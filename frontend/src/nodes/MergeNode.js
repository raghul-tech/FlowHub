// MergeNode.js

import React from 'react';
import { Handle, Position } from 'reactflow';
import { NodeBase } from './NodeBase';
import { useStore } from '../store';

export const MergeNode = ({ id, data }) => {
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
      <Handle type="target" position={Position.Left} id={`${id}-a`} style={{ top: '25%' }} />
      <Handle type="target" position={Position.Left} id={`${id}-b`} style={{ top: '50%' }} />
      <Handle type="target" position={Position.Left} id={`${id}-c`} style={{ top: '75%' }} />
      <NodeBase title="Merge" icon={"M"}>
        <div style={{ fontSize: 12, opacity: 0.9 }}>
          Merge multiple inputs into one output.
        </div>
      </NodeBase>
      <Handle type="source" position={Position.Right} id={`${id}-out`} />
    </div>
  );
};
