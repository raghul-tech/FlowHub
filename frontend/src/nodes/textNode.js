// textNode.js

import { useEffect, useMemo, useRef, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { NodeBase } from './NodeBase';
import { useStore } from '../store';

export const TextNode = ({ id, data }) => {
  const updateNodeField = useStore((s) => s.updateNodeField);
  const removeNode = useStore((s) => s.removeNode);
  const [currText, setCurrText] = useState(data?.text || '{{input}}');
  const textareaRef = useRef(null);
  const [boxWidth, setBoxWidth] = useState(260);

  const variables = useMemo(() => {
    const regex = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;
    const set = new Set();
    let m;
    while ((m = regex.exec(currText)) !== null) {
      set.add(m[1]);
    }
    return Array.from(set);
  }, [currText]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      // Auto width within bounds (220px - 600px)
      const sw = textareaRef.current.scrollWidth;
      const target = Math.max(220, Math.min(600, sw + 40));
      setBoxWidth(target);
    }
  }, [currText]);

  // Ensure node.data.text stays in sync so other components can read it
 useEffect(() => {
    updateNodeField(id, 'text', currText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currText, id]);

  const handleTextChange = (e) => {
    setCurrText(e.target.value);
  };

  const handleDelete = () => {
    removeNode(id); // Call store method to delete node
  };

  // compute dynamic height for handles stacking
  const handlePositions = variables.map((_, idx) => ({ top: `${20 + idx * 20}%` }));

  return (
    <div style={{ position: 'relative', width: boxWidth }}
    className="text-node-container"
    >
      {variables.map((v, idx) => (
        <Handle
          key={`${id}-var-${v}`}
          type="target"
          position={Position.Left}
          id={`${id}-var-${v}`}
          style={{ ...handlePositions[idx] }}
        />
      ))}

 {/* Delete Button */}
 <button
        onClick={handleDelete}
        className="delete-node-btn"
        title="Delete Node"
      >
        ×
      </button>

      <NodeBase title="Text" icon={"T"}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
          <span style={{ opacity: 0.8 }}>Text</span>
          <textarea
            ref={textareaRef}
            value={currText}
            onChange={handleTextChange}
            placeholder="Type text with {{variables}}"
            rows={1}
            style={{
              resize: 'none',
              overflow: 'hidden',
              width: '100%',
              lineHeight: '20px',
              borderRadius: 8,
              border: '1px solid #334155',
              background: '#0B1220',
              color: '#E5E7EB',
              padding: '8px 10px',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          />
        </label>
      </NodeBase>
      <Handle type="source" position={Position.Right} id={`${id}-output`} />
    </div>
  );
}
