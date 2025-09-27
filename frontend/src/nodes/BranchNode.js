// BranchNode.js

import React from 'react';
import { Handle, Position } from 'reactflow';
import { NodeBase } from './NodeBase';
import { useStore } from '../store';

export const BranchNode = ({ id, data }) => {
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
      <NodeBase title="Branch" icon={"if"}>
        <div style={{ fontSize: 12, opacity: 0.9 }}>
          Route input to True or False branch.
        </div>
      </NodeBase>
      <Handle type="source" position={Position.Right} id={`${id}-true`} style={{ top: '35%' }} />
      <Handle type="source" position={Position.Right} id={`${id}-false`} style={{ top: '70%' }} />
    </div>
  );
};
