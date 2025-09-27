
import { useStore } from './store';


export const ResetControls = () => {
    const resetGraph = useStore((s) => s.resetGraph);
    const resetHistory = useStore((s) => s.resetHistory);
    const setValidation = useStore((s) => s.setValidation);

    const reset = () => {
        resetGraph();
        resetHistory();
        setValidation(null);
    };

return (
    <button
        type="button"
        onClick={reset}
        style={{
            cursor: 'pointer',
            background: '#111827',
            color: '#fff',
            border: '1px solid #1F2937',
            padding: '10px 16px',
            borderRadius: 8,
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
            fontWeight: 600,
        }}
    >
        Reset Workflow
    </button>
)

}