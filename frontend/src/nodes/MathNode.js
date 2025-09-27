// MathNode.js

import React from 'react';
import { Handle, Position } from 'reactflow';
import { NodeBase } from './NodeBase';
import { useStore } from '../store';

export const MathNode = ({ id, data }) => {
  const removeNode = useStore((s) => s.removeNode);

  const handleDelete = () => {
    removeNode(id); // Call store method to delete node
  };

  return (
    <div className="relative text-node-container">
      {/* Delete Button */}
 <button
        onClick={handleDelete}
        className="delete-node-btn"
        title="Delete Node"
      >
        ×
      </button>
      <Handle type="target" position={Position.Left} id={`${id}-x`} style={{ top: '35%' }} />
      <Handle type="target" position={Position.Left} id={`${id}-y`} style={{ top: '70%' }} />
      <NodeBase title="Math" icon={"Σ"}>
        <div style={{ fontSize: 12, opacity: 0.9 }}>
          Combine two numeric inputs.
        </div>
      </NodeBase>
      <Handle type="source" position={Position.Right} id={`${id}-sum`} />
    </div>
  );
};
