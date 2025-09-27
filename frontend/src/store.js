// store.js

import { create } from "zustand";
import {
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    MarkerType,
  } from 'reactflow';

export const useStore = create((set, get) => ({
    nodes: [],
    edges: [],
    lastValidation: null,
    history: [],
    getNodeID: (type) => {
        const newIDs = {...get().nodeIDs};
        if (newIDs[type] === undefined) {
            newIDs[type] = 0;
        }
        newIDs[type] += 1;
        set({nodeIDs: newIDs});
        return `${type}-${newIDs[type]}`;
    },
    addNode: (node) => {
        set({
            nodes: [...get().nodes, node]
        });
    },
    onNodesChange: (changes) => {
      set({
        nodes: applyNodeChanges(changes, get().nodes),
      });
    },
    onEdgesChange: (changes) => {
      set({
        edges: applyEdgeChanges(changes, get().edges),
      });
    },
    onConnect: (connection) => {
      set({
        edges: addEdge({...connection, type: 'smoothstep', animated: true, markerEnd: {type: MarkerType.Arrow, height: '20px', width: '20px'}}, get().edges),
      });
    },
    updateNodeFields: (updates) => {
      set({
        nodes: get().nodes.map((node) => {
          if (updates[node.id]) {
            return {
              ...node,
              data: { ...node.data, ...updates[node.id] },
            };
          }
          return node;
        }),
      });
    },
    
    updateNodeField: (nodeId, fieldName, fieldValue) => {
      set({
        nodes: get().nodes.map((node) => {
          if (node.id === nodeId) {
            node.data = { ...node.data, [fieldName]: fieldValue };
          }
          return node;
        }),
      });
    },

    removeNode: (nodeId) => {
      set({
          nodes: get().nodes.filter((node) => node.id !== nodeId),
          edges: get().edges.filter(
              (edge) => edge.source !== nodeId && edge.target !== nodeId
          ),
      });
  },


    setValidation: (validation) => {
      set({ lastValidation: validation });
    },
    addHistoryEntry: (entry) => {
      set({ history: [{ id: Date.now(), ...entry }, ...get().history].slice(0, 50) });
    },
    resetHistory: () => set({ history: [] }),
    resetGraph: () => set({ nodes: [], edges: [], lastValidation: null }),
  }));
