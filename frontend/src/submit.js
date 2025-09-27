// submit.js

import { useCallback, useState } from 'react';
import { useStore } from './store';
import { RunControls } from './RunControls';
import { ResetControls } from './ResetControls';
import { api } from './api';

export const SubmitButton = () => {
  const nodes = useStore((s) => s.nodes);
  const edges = useStore((s) => s.edges);
  const setValidation = useStore((s) => s.setValidation);
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.post('/pipelines/parse', { nodes, edges });
      setValidation(res.data);
      alert(`Nodes: ${res.data.num_nodes}\nEdges: ${res.data.num_edges}\nIs DAG: ${res.data.is_dag}`);
    } catch (e) {
      const errorMessage = e.response?.data?.detail || e.message;
      alert(`Submission failed: ${errorMessage}`);
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
