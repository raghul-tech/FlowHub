// InputNode.js
import { useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { NodeBase } from './NodeBase';
import { useStore } from '../store';

export const InputNode = ({ id, data }) => {
  const updateNodeField = useStore((s) => s.updateNodeField);
  const [name, setName] = useState(data?.inputName || id.replace('customInput-', 'input_'));
  const [type, setType] = useState(data?.inputType || 'Text');
  const [value, setValue] = useState(data?.value || '');
  const removeNode = useStore((s) => s.removeNode);

  // ✅ Single effect: sync all fields together
  useEffect(() => {
    updateNodeField(id, 'inputName', name);
    updateNodeField(id, 'inputType', type);
    updateNodeField(id, 'value', value);
  }, [id, name, type, value, updateNodeField]);

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
      <NodeBase title="Input" icon="In">
        <div className="flex flex-col gap-3 text-sm">
          {/* Name */}
          <input
            className="bg-surface border border-border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Input name (e.g. prompt, document)"
          />

          {/* Type */}
          <select
            className="bg-surface border border-border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="Text">Text</option>
            <option value="File">File</option>
            <option value="Number">Number</option>
            <option value="Boolean">Boolean</option>
          </select>

          {/* Value */}
          {type === 'Text' && (
            <textarea
              className="bg-surface border border-border rounded-md px-2 py-2 text-sm min-h-[72px] focus:outline-none focus:ring-2 focus:ring-primary"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter text input..."
            />
          )}
          {type === 'File' && (
            <input
              type="file"
              className="block text-sm text-gray-300 file:mr-4 file:py-1 file:px-2
                         file:rounded-md file:border-0
                         file:text-sm file:font-medium
                         file:bg-primary file:text-white
                         hover:file:bg-primary/80"
              onChange={(e) => setValue(e.target.files?.[0]?.name || '')}
            />
          )}
          {type === 'Number' && (
            <input
              type="number"
              className="bg-surface border border-border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter a number"
            />
          )}
          {type === 'Boolean' && (
            <select
              className="bg-surface border border-border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            >
              <option value="">-- Select --</option>
              <option value="true">True</option>
              <option value="false">False</option>
            </select>
          )}
        </div>
      </NodeBase>
      <Handle type="source" position={Position.Right} id={`${id}-value`} />
    </div>
  );
};
