// HistoryPanel.js
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from './store';

export const HistoryPanel = () => {
  const history = useStore((s) => s.history);
  const resetHistory = useStore((s) => s.resetHistory);

  return (
    <div className="rounded-2xl border border-border/40 bg-surface/70 backdrop-blur-md shadow-lg p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-100 text-sm">Run History</h3>
        <button
          onClick={resetHistory}
          className="text-xs px-3 py-1 rounded-lg border border-border/40 text-gray-300 hover:bg-gray-800 transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Content */}
      {history.length === 0 ? (
        <div className="text-sm text-gray-400 italic">
          No runs yet. Execute a workflow to see results here.
        </div>
      ) : (
        <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
          <AnimatePresence>
            {history.map((h) => (
              <motion.div
                key={h.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="rounded-xl border border-border/40 bg-card/80 p-4 hover:shadow-md hover:border-indigo-500/40 transition-all"
              >
                {/* Top meta */}
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span>{new Date(h.when || h.id).toLocaleString()}</span>
                  <span className="font-mono">{h.model} • {h.duration_ms} ms</span>
                </div>

                {/* Input/Output */}
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-300 mb-1">Inputs</div>
                    <pre className="text-xs bg-surface border border-border/40 rounded-md p-2 whitespace-pre-wrap text-gray-200 font-mono">
{JSON.stringify(h.input || {}, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <div className="text-xs text-gray-300 mb-1">Output</div>
                    <pre className="text-xs bg-surface border border-border/40 rounded-md p-2 whitespace-pre-wrap text-gray-200 font-mono">
{h.output}
                    </pre>
                  </div>
                </div>

                {/* Prompt section */}
                <details className="mt-3 group">
                  <summary className="cursor-pointer text-xs text-gray-400 group-hover:text-indigo-400 transition-colors">
                    Show Prompt
                  </summary>
                  <pre className="text-xs bg-surface border border-border/40 rounded-md p-2 whitespace-pre-wrap mt-2 text-gray-200 font-mono">
{h.prompt}
                  </pre>
                </details>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
