import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export const DebugStatus: React.FC = () => {
  const [apiKeyStatus, setApiKeyStatus] = useState<{ present: boolean; length: number; source: string }>({ present: false, length: 0, source: 'unknown' });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let key = '';
    let source = 'none';

    // Check all possible sources
    if (process.env.GEMINI_API_KEY) {
      key = process.env.GEMINI_API_KEY;
      source = 'process.env.GEMINI_API_KEY';
    } else if (process.env.API_KEY) {
      key = process.env.API_KEY;
      source = 'process.env.API_KEY';
    } 
    // @ts-ignore
    else if (import.meta.env?.VITE_GEMINI_API_KEY) {
      // @ts-ignore
      key = import.meta.env.VITE_GEMINI_API_KEY;
      source = 'import.meta.env.VITE_GEMINI_API_KEY';
    }
    // @ts-ignore
    else if (import.meta.env?.VITE_API_KEY) {
      // @ts-ignore
      key = import.meta.env.VITE_API_KEY;
      source = 'import.meta.env.VITE_API_KEY';
    }

    setApiKeyStatus({
      present: !!key && key.length > 0,
      length: key ? key.length : 0,
      source
    });

    // Auto-show if missing
    if (!key || key.length === 0) {
      setIsVisible(true);
    }
  }, []);

  if (!isVisible) {
    return (
      <button 
        onClick={() => setIsVisible(true)}
        className="fixed bottom-2 right-2 p-2 bg-zinc-900/50 text-zinc-500 hover:text-white rounded-full text-xs z-50"
      >
        DEBUG
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl p-4 z-50 font-mono text-xs">
      <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-2">
        <h3 className="font-bold text-white uppercase tracking-widest">System Diagnostics</h3>
        <button onClick={() => setIsVisible(false)} className="text-zinc-500 hover:text-white">✕</button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">API Key Status</span>
            {apiKeyStatus.present ? (
              <span className="text-emerald-500 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> DETECTED
              </span>
            ) : (
              <span className="text-red-500 flex items-center gap-1">
                <XCircle className="w-3 h-3" /> MISSING
              </span>
            )}
          </div>
          
          <div className="p-2 bg-zinc-900 rounded border border-zinc-800 space-y-1">
            <div className="flex justify-between">
              <span className="text-zinc-600">Length:</span>
              <span className="text-zinc-300">{apiKeyStatus.length} chars</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600">Source:</span>
              <span className="text-zinc-300">{apiKeyStatus.source}</span>
            </div>
          </div>
        </div>

        {!apiKeyStatus.present && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 flex gap-2 items-start">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              CRITICAL: The application cannot find the Gemini API Key. 
              The build environment may be missing the `API_KEY` variable.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
