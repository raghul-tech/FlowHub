import { PipelineToolbar } from './toolbar';
import { PipelineUI } from './ui';
import { SubmitButton } from './submit';
import { ValidationPanel } from './ValidationPanel';
import { HistoryPanel } from './HistoryPanel';

function App() {
  return (
    <div className="min-h-screen bg-surface text-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <PipelineToolbar />
        <div className="mt-4">
          <div className="rounded-xl border border-border shadow-card overflow-hidden">
            <PipelineUI />
          </div>
        </div>
        <div className="flex items-center gap-4 flex-nowrap justify-center">
          <SubmitButton />
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <ValidationPanel />
          <HistoryPanel />
        </div>
      </div>
    </div>
  );
}

export default App;
