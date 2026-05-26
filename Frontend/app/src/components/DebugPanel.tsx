import { useState, useEffect } from 'react';
import { ChevronDown, Trash2 } from 'lucide-react';

export default function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<Array<{ time: string; msg: string }>>([]);

  useEffect(() => {
    // Load logs from localStorage on mount
    const savedLogs = JSON.parse(localStorage.getItem('authDebugLogs') || '[]');
    setLogs(savedLogs);

    // Poll for new logs every 500ms
    const interval = setInterval(() => {
      const currentLogs = JSON.parse(localStorage.getItem('authDebugLogs') || '[]');
      setLogs(currentLogs);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const clearLogs = () => {
    localStorage.removeItem('authDebugLogs');
    setLogs([]);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[200]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
      >
        🐛 Debug ({logs.length})
        <ChevronDown size={14} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-[400px] max-h-[400px] bg-gray-900 border border-gray-700 rounded-lg shadow-lg overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
            <span className="text-xs font-bold text-white">Auth Debug Logs</span>
            <button
              onClick={clearLogs}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
            >
              <Trash2 size={14} className="text-gray-400" />
            </button>
          </div>
          <div className="overflow-y-auto flex-1 px-3 py-2">
            {logs.length === 0 ? (
              <div className="text-xs text-gray-500">No logs yet...</div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="text-xs text-gray-300 font-mono mb-1 pb-1 border-b border-gray-800">
                  <span className="text-gray-500">[{log.time}]</span> {log.msg}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
