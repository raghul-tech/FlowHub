// llmNode.js

import { Handle, Position } from 'reactflow';
import { NodeBase } from './NodeBase';
import { useStore } from '../store';

export const LLMNode = ({ id, data }) => {
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
      <Handle type="target" position={Position.Left} id={`${id}-system`} style={{ top: '33%' }} />
      <Handle type="target" position={Position.Left} id={`${id}-prompt`} style={{ top: '66%' }} />
      <NodeBase title="LLM" icon={"AI"}>
        <div className="text-sm text-gray-300">Large Language Model</div>
      </NodeBase>
      <Handle type="source" position={Position.Right} id={`${id}-response`} />
    </div>
  );
}
