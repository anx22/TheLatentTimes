import React, { useState, useEffect, useRef } from 'react';
import { useNewsroom } from '../../hooks/useNewsroom';
import { Terminal, ChevronUp, ChevronDown } from 'lucide-react';

export const SystemLog: React.FC = () => {
  const { logs } = useNewsroom();
  const [isOpen, setIsOpen] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isOpen]);

  return (
    <div className={`border-t border-zinc-800 bg-black shrink-0 transition-all duration-300 ease-in-out flex flex-col ${isOpen ? 'h-64' : 'h-10'}`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 px-4 flex items-center justify-between hover:bg-zinc-900 transition-colors w-full"
      >
        <div className="flex items-center gap-2 text-zinc-400">
          <Terminal className="w-4 h-4" />
          <span className="text-xs font-bold tracking-widest uppercase">System Log</span>
          {logs.length > 0 && (
            <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded ml-2">{logs.length} EVENTS</span>
          )}
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronUp className="w-4 h-4 text-zinc-500" />}
      </button>
      
      {isOpen && (
        <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-[10px]">
          {logs.length === 0 ? (
            <div className="text-zinc-600 italic">No system events recorded in this session.</div>
          ) : (
            logs.map(log => {
              let color = 'text-zinc-400';
              if (log.level === 'action') color = 'text-blue-400';
              if (log.level === 'success') color = 'text-emerald-400';
              if (log.level === 'error') color = 'text-red-400';
              if (log.level === 'warning') color = 'text-amber-400';

              // Fix the timestamp issue by ensuring it's a Date object
              const timeString = new Date(log.timestamp).toLocaleTimeString();

              return (
                <div key={log.id} className="flex gap-4">
                  <span className="text-zinc-600 shrink-0">{timeString}</span>
                  <span className={`font-bold shrink-0 w-32 ${color}`}>[{log.agent}]</span>
                  <span className="text-zinc-300">{log.message}</span>
                </div>
              );
            })
          )}
          <div ref={logsEndRef} />
        </div>
      )}
    </div>
  );
};
