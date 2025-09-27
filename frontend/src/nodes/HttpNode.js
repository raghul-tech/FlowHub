// HttpNode.js

import React, { useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { NodeBase } from './NodeBase';
import { useStore } from '../store';

export const HttpNode = ({ id, data }) => {
  const removeNode = useStore((s) => s.removeNode);

  const handleDelete = () => {
    removeNode(id); // Call store method to delete node
  };

  const updateNodeField = useStore((s) => s.updateNodeField);
  const [url, setUrl] = useState(data?.url || '');
  const [method, setMethod] = useState((data?.method || 'GET').toUpperCase());
  const [body, setBody] = useState(
    typeof data?.body === 'string' ? data.body : (data?.body ? JSON.stringify(data.body, null, 2) : '')
  );

  useEffect(() => {
    updateNodeField(id, 'url', url);
  }, [id, url, updateNodeField]);

  useEffect(() => {
    updateNodeField(id, 'method', method);
  }, [id, method, updateNodeField]);

  useEffect(() => {
    // Try to store JSON when possible; fall back to raw string
    try {
      const parsed = body ? JSON.parse(body) : null;
      updateNodeField(id, 'body', parsed);
    } catch {
      updateNodeField(id, 'body', body);
    }
  }, [id, body, updateNodeField]);

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
      {/* Upstream can provide URL/body if fields are empty */}
      <Handle type="target" position={Position.Left} id={`${id}-req`} />
      <NodeBase title="HTTP Request" icon={"🌐"}>
        <div className="grid grid-cols-1 gap-2 text-sm">
          <label className="flex flex-col gap-1">
            <span className="text-gray-300">Method</span>
            <select
              className="bg-surface border border-border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-gray-300">URL</span>
            <input
              className="bg-surface border border-border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
              type="text"
              placeholder="https://api.example.com/data"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <span className="text-xs text-gray-400">If empty, first upstream value will be used as URL</span>
          </label>
          {method === 'POST' && (
            <label className="flex flex-col gap-1">
              <span className="text-gray-300">JSON Body (optional)</span>
              <textarea
                className="bg-surface border border-border rounded-md px-2 py-2 text-sm min-h-[72px] focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder='{"key": "value"}'
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
              <span className="text-xs text-gray-400">If left blank, first upstream value (if any) will be sent as JSON</span>
            </label>
          )}
        </div>
      </NodeBase>
      <Handle type="source" position={Position.Right} id={`${id}-res`} />
    </div>
  );
};
