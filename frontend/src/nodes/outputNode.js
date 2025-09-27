// outputNode.js

import { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { NodeBase } from './NodeBase';
import { useStore } from '../store';

export const OutputNode = ({ id, data }) => {
  // Debug: Log the data received by the output node
  console.log(`OutputNode ${id} received data:`, data);
  
  const [currName, setCurrName] = useState(data?.outputName || id.replace('customOutput-', 'output_'));
  const [outputType, setOutputType] = useState(data?.outputType || 'Text');
  const [isOpen, setIsOpen] = useState(false);
  const removeNode = useStore((s) => s.removeNode);

  // Get the workflow results from data.value
  const getResultText = () => {
    // Prefer result over value
    const val = data?.result ?? data?.value ?? '';
    return typeof val === 'string' ? val : JSON.stringify(val, null, 2);
  };
  const handleDelete = () => {
    removeNode(id); // Call store method to delete node
  };

  
  
  const fullText = getResultText();
  const lineCount = (fullText.match(/\n/g) || []).length + (fullText ? 1 : 0);
  const isShort = fullText && fullText.length <= 280 && lineCount <= 6;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullText);
      // Optional: a light feedback; avoid alert spam in node UI
      // console.log('Copied output to clipboard');
    } catch (e) {
      // console.warn('Copy failed', e);
    }
  };

  const downloadTxt = () => {
    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currName || 'output'}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
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
      <Handle type="target" position={Position.Left} id={`${id}-value`} />
      <NodeBase title="Output" icon={"Out"}>
        <div className="grid grid-cols-1 gap-2 text-sm">
          <label className="flex flex-col gap-1">
            <span className="text-gray-300">Name</span>
            <input
              className="bg-surface border border-border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
              type="text"
              value={currName}
              onChange={(e) => setCurrName(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-gray-300">Type</span>
            <select
              className="bg-surface border border-border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
              value={outputType}
              onChange={(e) => setOutputType(e.target.value)}
            >
              <option value="Text">Text</option>
              <option value="File">Image</option>
            </select>
          </label>

          {/* Live Result Preview (short only) */}
          <div className="flex flex-col gap-2">
            <span className="text-gray-300">Result</span>
            {isShort ? (
              <pre
                className="bg-surface border border-border rounded-md p-2 text-sm whitespace-pre-wrap max-h-24 overflow-auto"
                title="Double-click to view full result"
                onDoubleClick={() => setIsOpen(true)}
                style={{ cursor: 'zoom-in' }}
              >
                {getResultText()}
              </pre>
            ) : (
              fullText && (
                <div className="text-xs text-gray-400">Long result. Use actions below to view.</div>
              )
            )}
            {fullText && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(true)}
                  className="px-2 py-1 rounded-md text-white"
                  style={{ background: '#374151', border: '1px solid #4B5563' }}
                >
                  Open full result
                </button>
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="px-2 py-1 rounded-md text-white"
                  style={{ background: '#1F2937', border: '1px solid #374151' }}
                >
                  Copy
                </button>
                <button
                  type="button"
                  onClick={downloadTxt}
                  className="px-2 py-1 rounded-md text-white"
                  style={{ background: '#111827', border: '1px solid #374151' }}
                >
                  Download .txt
                </button>
              </div>
            )}
          </div>
        </div>
      </NodeBase>
      {/* Modal for full result */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50"
          style={{
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            className="rounded-lg"
            style={{
              background: '#0B1220',
              border: '1px solid #1F2A44',
              width: 'min(900px, 92vw)',
              maxHeight: '80vh',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              color: '#E5E7EB',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between" style={{ padding: '10px 12px', borderBottom: '1px solid #1F2A44' }}>
              <div style={{ fontWeight: 700 }}>Output: {currName}</div>
              <div className="flex gap-2">
                <button onClick={copyToClipboard} className="px-2 py-1 rounded-md text-white" style={{ background: '#1F2937', border: '1px solid #374151' }}>Copy</button>
                <button onClick={downloadTxt} className="px-2 py-1 rounded-md text-white" style={{ background: '#111827', border: '1px solid #374151' }}>Download</button>
                <button onClick={() => setIsOpen(false)} className="px-2 py-1 rounded-md text-white" style={{ background: '#4B5563', border: '1px solid #6B7280' }}>Close</button>
              </div>
            </div>
            <div style={{ padding: 12 }}>
              <pre className="text-sm whitespace-pre-wrap" style={{ maxHeight: '60vh', overflow: 'auto' }}>{fullText}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
