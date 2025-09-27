from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Set, DefaultDict
from collections import defaultdict, deque
import os
import re
import time
import requests

app = FastAPI()

# Allow local dev from CRA and Vite defaults
app.add_middleware(
    CORSMiddleware,
 allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173","https://flowhub-lovat.vercel.app/"],
    #allow_origins=["https://flowhub-lovat.vercel.app/"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class EdgeModel(BaseModel):
    id: str | None = None
    source: str
    target: str
    sourceHandle: str | None = None
    targetHandle: str | None = None


class NodeModel(BaseModel):
    id: str
    type: str | None = None
    data: Dict[str, Any] | None = None


class PipelineRequest(BaseModel):
    nodes: List[NodeModel]
    edges: List[EdgeModel]


def is_dag(num_nodes: int, edges: List[EdgeModel], nodes: List[NodeModel]) -> bool:
    # Build adjacency and indegree
    adj: DefaultDict[str, Set[str]] = defaultdict(set)
    indeg: DefaultDict[str, int] = defaultdict(int)
    ids = {n.id for n in nodes}

    for e in edges:
        # ignore self-loops (self-loop makes it non-DAG)
        if e.source == e.target:
            return False
        adj[e.source].add(e.target)
        indeg[e.target] += 1
        # ensure nodes present in dicts
        if e.source not in indeg:
            indeg[e.source] = indeg[e.source]

    # Kahn's algorithm
    q = deque([n for n in ids if indeg[n] == 0])
    visited = 0
    while q:
        u = q.popleft()
        visited += 1
        for v in adj[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                q.append(v)

    return visited == len(ids)


@app.get("/")
def read_root():
    return {"Ping": "Pong"}


@app.post("/pipelines/parse")
def parse_pipeline(payload: PipelineRequest):
    num_nodes = len(payload.nodes)
    num_edges = len(payload.edges)
    dag = is_dag(num_nodes, payload.edges, payload.nodes)
    return {
        "num_nodes": num_nodes,
        "num_edges": num_edges,
        "is_dag": dag,
    }


class RunGeminiRequest(BaseModel):
    prompt: str
    model: str | None = "gemini-1.5-flash"


@app.post("/run_gemini")
def run_gemini(req: RunGeminiRequest):
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Missing GEMINI_API_KEY in environment")

    # Gemini generate content endpoint (v1beta)
    model = req.model or "gemini-2.5-flash"
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": req.prompt}
                ]
            }
        ]
    }

    start = time.time()
    r = requests.post(url, json=payload, timeout=60)
    dur_ms = int((time.time() - start) * 1000)
    if r.status_code != 200:
        raise HTTPException(status_code=r.status_code, detail=f"Gemini error: {r.text}")
    data = r.json()
    # Extract first candidate text safely
    try:
        text = data["candidates"][0]["content"]["parts"][0]["text"]
    except Exception:
        text = ""

    return {
        "model": model,
        "duration_ms": dur_ms,
        "raw": data,
        "text": text,
    }


class RunStepRequest(BaseModel):
    step_type: str
    input_text: str
    model: str | None = "gemini-2.5-flash"


@app.post("/run_step")
def run_step(req: RunStepRequest):
    if req.step_type.lower() in {"llm", "gemini"}:
        return run_gemini(RunGeminiRequest(prompt=req.input_text, model=req.model))
    raise HTTPException(status_code=400, detail=f"Unsupported step_type: {req.step_type}")


class RunWorkflowRequest(BaseModel):
    nodes: List[NodeModel]
    edges: List[EdgeModel]
    inputs: Dict[str, Any] | None = None
    model: str | None = "gemini-2.5-flash"


@app.post("/run_workflow")
def run_workflow(req: RunWorkflowRequest):
    # Simple multi-step executor. It:
    # 1) Builds adjacency and indegree; topologically sorts the graph
    # 2) Executes supported node types and collects outputs in node_outputs[id] = value(str or JSON)
    # 3) For compatibility, also returns 'prompt', 'model', 'duration_ms', 'output_text' from the last LLM step

    nodes = req.nodes
    edges = req.edges
    node_by_id: Dict[str, NodeModel] = {n.id: n for n in nodes}

    # Build graph
    incoming: DefaultDict[str, List[EdgeModel]] = defaultdict(list)
    outgoing: DefaultDict[str, List[EdgeModel]] = defaultdict(list)
    indeg: DefaultDict[str, int] = defaultdict(int)
    ids = [n.id for n in nodes]
    for e in edges:
        outgoing[e.source].append(e)
        incoming[e.target].append(e)
        indeg[e.target] += 1
        if e.source not in indeg:
            indeg[e.source] = indeg[e.source]

    # Topo order (Kahn)
    q = deque([i for i in ids if indeg[i] == 0])
    order: List[str] = []
    while q:
        u = q.popleft()
        order.append(u)
        for e in outgoing[u]:
            v = e.target
            indeg[v] -= 1
            if indeg[v] == 0:
                q.append(v)
    if len(order) != len(ids):
        raise HTTPException(status_code=400, detail="Workflow has a cycle or disconnected indegree resolution failed")

    # Helper to read upstream text values
    def get_upstream_values(node_id: str) -> List[Any]:
        vals: List[Any] = []
        for e in incoming[node_id]:
            src = node_by_id.get(e.source)
            if not src:
                continue
            # Prefer computed output of src; fallback to src.data.value (e.g., customInput)
            if src.id in node_outputs:
                vals.append(node_outputs[src.id])
            else:
                vals.append((src.data or {}).get("value"))
        return vals

    # Variable resolution for text nodes
    def resolve_text(text_node: NodeModel) -> str:
        raw = (text_node.data or {}).get("text", "")
        # Collect named vars from incoming handles matching "<text_id>-var-<name>"
        vars_map: Dict[str, Any] = dict(req.inputs or {})
        for e in incoming[text_node.id]:
            if e.targetHandle and e.targetHandle.startswith(f"{text_node.id}-var-"):
                varname = e.targetHandle[len(f"{text_node.id}-var-"):]
                src = node_by_id.get(e.source)
                if src:
                    val = node_outputs.get(src.id)
                    if val is None and (src.type == "customInput" or src.id.startswith("customInput-")):
                        val = (src.data or {}).get("value")
                    if val is not None:
                        vars_map[varname] = val

        def sub(m: re.Match):
            k = m.group(1).strip()
            return str(vars_map.get(k, f"{{{{{k}}}}}"))

        return re.sub(r"\{\{\s*([a-zA-Z0-9_]+)\s*\}\}", sub, raw)

    # Exec handlers
    def exec_transform(values: List[Any], node: NodeModel) -> Any:
        s = "" if not values else str(values[0])
        mode = (node.data or {}).get("mode") or (node.data or {}).get("transform")
        if mode == "upper":
            return s.upper()
        if mode == "lower":
            return s.lower()
        if mode == "title":
            return s.title()
        return s  # passthrough

    def exec_merge(values: List[Any], node: NodeModel) -> Any:
        sep = (node.data or {}).get("sep") or "\n"
        return sep.join([str(v) for v in values if v is not None])

    def exec_math(values: List[Any], node: NodeModel) -> Any:
        # Very limited safe math using eval on digits and operators only
        expr = (node.data or {}).get("expr")
        if not expr and values:
            expr = str(values[0])
        if not expr:
            return None
        if not re.fullmatch(r"[0-9\s\+\-\*\/\(\)\.]+", expr):
            raise HTTPException(status_code=400, detail="Unsafe math expression")
        try:
            return eval(expr, {"__builtins__": {}}, {})
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Math error: {e}")

    def exec_http(values: List[Any], node: NodeModel) -> Any:
        url = (node.data or {}).get("url") or (values[0] if values else None)
        method = ((node.data or {}).get("method") or "GET").upper()
        if not url:
            return None
        try:
            if method == "GET":
                r = requests.get(url, timeout=15)
            else:
                # POST JSON body if provided in node.data.body; else send first upstream value
                body = (node.data or {}).get("body")
                payload = body if body is not None else (values[0] if values else None)
                r = requests.post(url, json=payload, timeout=20)
            r.raise_for_status()
            # Try JSON first
            try:
                return r.json()
            except Exception:
                return r.text
        except requests.RequestException as e:
            raise HTTPException(status_code=400, detail=f"HTTP error: {e}")

    node_outputs: Dict[str, Any] = {}
    last_llm: Dict[str, Any] | None = None

    for nid in order:
        n = node_by_id[nid]
        ntype = (n.type or "").lower()
        ups = get_upstream_values(nid)

        if ntype in {"custominput"} or n.id.startswith("customInput-"):
            # Take its own value
            node_outputs[nid] = (n.data or {}).get("value")
        elif ntype in {"text", "prompt"}:
            node_outputs[nid] = resolve_text(n)
        elif ntype in {"llm"}:
            text = str(ups[0]) if ups else ""
            gem = run_gemini(RunGeminiRequest(prompt=text, model=req.model))
            node_outputs[nid] = gem.get("text", "")
            last_llm = {"prompt": text, "model": gem.get("model"), "duration_ms": gem.get("duration_ms"), "output_text": gem.get("text", "")}
        elif ntype in {"http"}:
            node_outputs[nid] = exec_http(ups, n)
        elif ntype in {"transform"}:
            node_outputs[nid] = exec_transform(ups, n)
        elif ntype in {"merge"}:
            node_outputs[nid] = exec_merge(ups, n)
        elif ntype in {"math"}:
            node_outputs[nid] = exec_math(ups, n)
        elif ntype in {"customoutput"}:
            # It displays upstream; just pass through first upstream
            node_outputs[nid] = ups[0] if ups else None
        else:
            # Unknown node: passthrough first upstream
            node_outputs[nid] = ups[0] if ups else None

    # If no LLM step happened, emulate old behavior using first text node
    if last_llm is None:
        text_nodes = [n for n in nodes if (n.type == "text")]
        if text_nodes:
            text_node = text_nodes[0]
            prompt = node_outputs.get(text_node.id) or resolve_text(text_node)
            gem = run_gemini(RunGeminiRequest(prompt=prompt, model=req.model))
            last_llm = {"prompt": prompt, "model": gem.get("model"), "duration_ms": gem.get("duration_ms"), "output_text": gem.get("text", "")}

    resp = {
        "node_outputs": node_outputs,
    }
    if last_llm is not None:
        resp.update(last_llm)
    return resp
