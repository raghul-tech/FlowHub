// ValidationPanel.js

import React from 'react';
import { useStore } from './store';

export const ValidationPanel = () => {
  const nodes = useStore((s) => s.nodes);
  const edges = useStore((s) => s.edges);
  const lastValidation = useStore((s) => s.lastValidation);

  const badge = (ok) => (
    <span style={{
      padding: '2px 8px',
      borderRadius: 999,
      background: ok ? '#065F46' : '#7F1D1D',
      color: '#fff',
      fontSize: 12,
      fontWeight: 600,
    }}>
      {ok ? 'DAG' : 'Has Cycle'}
    </span>
  );

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={{ fontWeight: 700 }}>Workflow Validation</span>
          {lastValidation && badge(lastValidation.is_dag)}
        </div>
        <div style={styles.grid}>
          <div style={styles.stat}>Nodes: <strong>{lastValidation?.num_nodes ?? nodes.length}</strong></div>
          <div style={styles.stat}>Edges: <strong>{lastValidation?.num_edges ?? edges.length}</strong></div>
        </div>
        <div style={{ height: 8 }} />
        <div style={styles.sectionTitle}>Nodes</div>
        <div style={styles.list}>
          {nodes.length === 0 && <div style={styles.empty}>No nodes yet</div>}
          {nodes.map((n) => (
            <div key={n.id} style={styles.item}>
              <code style={styles.code}>{n.id}</code>
              <span style={styles.dim}>{n.type}</span>
            </div>
          ))}
        </div>
        <div style={{ height: 8 }} />
        <div style={styles.sectionTitle}>Edges</div>
        <div style={styles.list}>
          {edges.length === 0 && <div style={styles.empty}>No edges yet</div>}
          {edges.map((e, i) => (
            <div key={e.id || i} style={styles.item}>
              <code style={styles.code}>{e.source} → {e.target}</code>
              <span style={styles.dim}>{e.sourceHandle} → {e.targetHandle}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    padding: '10px 12px 20px',
  },
  card: {
    width: 'min(920px, 94vw)',
    background: 'linear-gradient(180deg, #0B1220 0%, #0A0F1A 100%)',
    border: '1px solid #1F2A44',
    borderRadius: 12,
    color: '#E5E7EB',
    boxShadow: '0 6px 18px rgba(0,0,0,0.35)',
    padding: 14,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 8,
  },
  stat: {
    background: '#111827',
    border: '1px solid #1F2937',
    padding: '8px 10px',
    borderRadius: 8,
  },
  sectionTitle: {
    marginTop: 6,
    marginBottom: 6,
    fontWeight: 700,
    fontSize: 13,
    opacity: 0.9,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    maxHeight: 220,
    overflow: 'auto',
    border: '1px solid #1F2937',
    borderRadius: 8,
    padding: 8,
    background: '#0F172A',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    background: '#0B1220',
    border: '1px solid #1E293B',
    padding: '6px 8px',
    borderRadius: 6,
  },
  code: {
    background: '#111827',
    padding: '2px 6px',
    borderRadius: 4,
    border: '1px solid #1F2937',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontSize: 12,
  },
  dim: {
    opacity: 0.7,
    fontSize: 12,
  },
  empty: {
    opacity: 0.6,
    fontStyle: 'italic',
    fontSize: 12,
    padding: '4px 2px',
  },
};
