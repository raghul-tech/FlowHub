// PromptNode.js

import React from 'react';
import { Handle, Position } from 'reactflow';
import { NodeBase } from './NodeBase';
import { useStore } from '../store';

export const PromptNode = ({ id, data }) => {
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
      <Handle type="target" position={Position.Left} id={`${id}-system`} style={{ top: '30%' }} />
      <Handle type="target" position={Position.Left} id={`${id}-vars`} style={{ top: '70%' }} />
      <NodeBase title="Prompt" icon={"P"}>
        <div style={{ fontSize: 12, opacity: 0.9 }}>
          Compose a prompt from system and variables.
        </div>
      </NodeBase>
      <Handle type="source" position={Position.Right} id={`${id}-prompt`} />
    </div>
  );
};
