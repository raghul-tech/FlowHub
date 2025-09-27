// TransformNode.js

import React from 'react';
import { Handle, Position } from 'reactflow';
import { NodeBase } from './NodeBase';
import { useStore } from '../store';

export const TransformNode = ({ id, data }) => {
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
      <Handle type="target" position={Position.Left} id={`${id}-in`} />
      <NodeBase title="Transform" icon={"Tx"}>
        <div style={{ fontSize: 12, opacity: 0.9 }}>
          Apply a simple transform to the input.
        </div>
      </NodeBase>
      <Handle type="source" position={Position.Right} id={`${id}-out`} />
    </div>
  );
};
