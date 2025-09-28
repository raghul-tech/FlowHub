// RunControls.js
import { useState } from 'react';
import { api } from './api';
import { useStore } from './store';

export const RunControls = () => {
  const nodes = useStore((s) => s.nodes);
  const edges = useStore((s) => s.edges);
  const addHistoryEntry = useStore((s) => s.addHistoryEntry);
  //const updateNodeField = useStore((s) => s.updateNodeField);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    try {
      setLoading(true);

      if (nodes.length === 0) {
        setLoading(false);
        return;
      }

      console.log('[RunControls] POST /run_workflow', { nodes, edges });
      const res = await api.post('/run_workflow', {
        nodes,
        edges,
        model: 'gemini-2.5-flash',
      });

      const data = res.data;
      console.log('[RunControls] /run_workflow response', data);

      // Collect inputs for history
      const inputValues = {};
      nodes.forEach((node) => {
        if (node.type === 'customInput' && node.data?.value) {
          inputValues[node.data.label || `input-${node.id}`] = node.data.value;
        }
      });

      // Always store the real model output
      addHistoryEntry({
        when: new Date().toISOString(),
        input: inputValues,
        prompt: data.prompt,
        output: data.output_text,
        model: data.model,
        duration_ms: data.duration_ms,
      });

  // Collect updates
  const updates = nodes.reduce((acc, node) => {
    acc[node.id] = { 
      value: data.output_text, 
      result: data.output_text 
    };
    return acc;
  }, {});

// Apply in one go
useStore.getState().updateNodeFields(updates);


    } catch (e) {
      const msg = e?.response?.data?.detail || e.message || 'Unknown error';
      console.error('[RunControls] Run failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-4">
        <button
          onClick={run}
          disabled={loading}
          className="px-4 py-2 rounded-md text-white disabled:opacity-60"
          style={{
            cursor: loading ? 'not-allowed' : 'pointer',
            background: '#2563EB',
            border: 'none',
            padding: '10px 16px',
            borderRadius: 8,
            boxShadow: '0 6px 16px rgba(37, 99, 235, 0.4)',
            fontWeight: 600,
          }}
        >
          {loading ? 'Running…' : 'Run Workflow'}
        </button>
      </div>
    </div>
  );
};
