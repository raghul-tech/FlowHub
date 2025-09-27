// submit.js

import { useCallback, useState } from 'react';
import { useStore } from './store';
import { RunControls } from './RunControls';
import { ResetControls } from './ResetControls';

export const SubmitButton = () => {
  const nodes = useStore((s) => s.nodes);
  const edges = useStore((s) => s.edges);
  const setValidation = useStore((s) => s.setValidation);
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/pipelines/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setValidation(data);
      alert(`Nodes: ${data.num_nodes}\nEdges: ${data.num_edges}\nIs DAG: ${data.is_dag}`);
    } catch (e) {
      alert(`Submission failed: ${e.message}.\nEnsure backend is running on 8000 and restart the frontend after proxy changes.`);
    } finally {
      setLoading(false);
    }
  }, [nodes, edges, setValidation]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12, gap: 16 }}>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        style={{
          cursor: loading ? 'not-allowed' : 'pointer',
          background: '#2563EB',
          color: '#fff',
          border: 'none',
          padding: '10px 16px',
          borderRadius: 8,
          boxShadow: '0 6px 16px rgba(37, 99, 235, 0.4)',
          fontWeight: 600,
        }}
      >
        {loading ? 'Submitting…' : 'Submit Workflow'}
      </button>

        <RunControls /> 
      <ResetControls />
    </div>
  );
}
