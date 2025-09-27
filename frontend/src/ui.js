// ui.js
// Clean, grid-style workflow editor
// --------------------------------------------------

import { useState, useRef, useCallback } from 'react';
import ReactFlow, { Controls, Background, MiniMap } from 'reactflow';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';
import { InputNode } from './nodes/inputNode';
import { LLMNode } from './nodes/llmNode';
import { OutputNode } from './nodes/outputNode';
import { TextNode } from './nodes/textNode';
import { TransformNode } from './nodes/TransformNode';
import { PromptNode } from './nodes/PromptNode';
import { MergeNode } from './nodes/MergeNode';
import { BranchNode } from './nodes/BranchNode';
import { HttpNode } from './nodes/HttpNode';
import { MathNode } from './nodes/MathNode';

import 'reactflow/dist/style.css';

const gridSize = 20;
const proOptions = { hideAttribution: true };
const nodeTypes = {
  customInput: InputNode,
  llm: LLMNode,
  customOutput: OutputNode,
  text: TextNode,
  transform: TransformNode,
  prompt: PromptNode,
  merge: MergeNode,
  branch: BranchNode,
  http: HttpNode,
  math: MathNode,
};

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  getNodeID: state.getNodeID,
  addNode: state.addNode,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
});

export const PipelineUI = () => {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const {
    nodes,
    edges,
    getNodeID,
    addNode,
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = useStore(selector, shallow);

  const getInitNodeData = (nodeID, type) => {
    return { id: nodeID, nodeType: `${type}` };
  };

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();

      if (event?.dataTransfer?.getData('application/reactflow')) {
        const appData = JSON.parse(
          event.dataTransfer.getData('application/reactflow')
        );
        const type = appData?.nodeType;

        if (!type) return;

        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        const nodeID = getNodeID(type);
        const newNode = {
          id: nodeID,
          type,
          position,
          data: getInitNodeData(nodeID, type),
        };

        addNode(newNode);
      }
    },
    [reactFlowInstance, addNode, getNodeID]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <div
      ref={reactFlowWrapper}
      style={{
        width: '100%',
        height: '70vh',
        background: '#0f172a', // slate-900
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        proOptions={proOptions}
        snapGrid={[gridSize, gridSize]}
        connectionLineType="smoothstep"
      >
        {/* Subtle grid */}
        <Background color="#334155" gap={gridSize} size={1} />

        {/* Controls pinned to top-right */}
        <Controls
          style={{
            top: 10,
            right: 10,
            left: 'auto',
            bottom: 'auto',
            background: 'rgba(30, 41, 59, 0.8)',
            borderRadius: '8px',
            padding: '4px',
          }}
        />

        {/* MiniMap in bottom-right */}
        <MiniMap
  style={{
    right: 10,
    bottom: 10,
    left: 'auto',
    top: 'auto',
    background: 'rgba(15, 23, 42, 0.9)', // slate-900 bg
    borderRadius: '8px',
    width: 180,
    height: 140,
  }}
  zoomable
  pannable
  nodeStrokeWidth={2}
  nodeStrokeColor={(n) => {
    switch (n.type) {
      case 'customInput': return '#22c55e';   // green-500
      case 'text':        return '#f97316';   // orange-500
      case 'llm':         return '#3b82f6';   // blue-500
      case 'http':        return '#06b6d4';   // cyan-500
      case 'transform':   return '#a855f7';   // purple-500
      case 'merge':       return '#ec4899';   // pink-500
      case 'branch':      return '#e11d48';   // rose-600
      case 'math':        return '#f59e0b';   // amber-500
      case 'customOutput':return '#84cc16';   // lime-500
      case 'prompt':      return '#6366f1';   // indigo-500
      default:            return '#9ca3af';   // gray-400 (fallback)
    }
  }}
  nodeColor={(n) => {
    switch (n.type) {
      case 'customInput': return '#064e3b';   // green-900
      case 'text':        return '#7c2d12';   // orange-900
      case 'llm':         return '#1e3a8a';   // blue-900
      case 'http':        return '#164e63';   // cyan-900
      case 'transform':   return '#581c87';   // purple-900
      case 'merge':       return '#831843';   // pink-900
      case 'branch':      return '#881337';   // rose-900
      case 'math':        return '#78350f';   // amber-900
      case 'customOutput':return '#365314';   // lime-900
      case 'prompt':      return '#312e81';   // indigo-900
      default:            return '#1f2937';   // gray-800
    }
  }}
  maskColor="rgba(15, 23, 42, 0.6)" // dim background
/>

      </ReactFlow>
    </div>
  );
};
