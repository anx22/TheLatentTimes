
import React, { useEffect, useRef } from 'react';
import { AgentLog } from '../../types';

export const RiskChip: React.FC<{ risk?: string }> = ({ risk }) => {
    if (!risk || risk === 'NONE') return <span className="text-[10px] text-emerald-500 font-mono font-bold">SAFE</span>;
    return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${risk === 'LEGAL' ? 'text-red-500 border-red-900/30 bg-red-900/10' : 'text-amber-500 border-amber-900/30 bg-amber-900/10'}`}>{risk}</span>;
};

export const LogStream: React.FC<{ logs: AgentLog[]; className?: string }> = ({ logs, className }) => {
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new logs
    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs.length]);

    return (
        <div className={`overflow-y-auto font-mono text-[10px] space-y-1 opacity-90 custom-scrollbar p-4 bg-[#050505] ${className}`}>
            {logs.length === 0 && (
                <div className="text-neutral-700 italic opacity-50 pt-2">System Ready. Awaiting signals...</div>
            )}
            {logs.map((l, i) => (
                <div key={i} className="flex gap-4 border-b border-white/5 pb-1 mb-1 last:border-0 hover:bg-white/5 transition-colors p-1 rounded-sm">
                    <span className="text-neutral-600 w-16 shrink-0">{l.timestamp.split(' ')[0]}</span>
                    <span className={`font-bold w-16 shrink-0 text-right ${l.agent === 'SYS' ? 'text-red-500' : l.agent === 'NET' ? 'text-blue-400' : 'text-accent'}`}>
                        [{l.agent}]
                    </span>
                    <span className="text-neutral-300 break-words leading-tight flex-1 font-medium">
                        {l.message} 
                        {l.data && (
                            <span className="block text-neutral-500 mt-1 ml-2 font-mono text-[9px]">
                                {JSON.stringify(l.data).slice(0, 120)}{JSON.stringify(l.data).length > 120 ? '...' : ''}
                            </span>
                        )}
                    </span>
                </div>
            ))}
            <div ref={bottomRef} />
        </div>
    );
};

export const ToggleGroup: React.FC<{ 
    label: string; 
    options: string[]; 
    value: string; 
    onChange: (val: any) => void 
}> = ({ label, options, value, onChange }) => (
    <div className="mb-6">
        <label className="block text-[10px] font-bold text-neutral-400 mb-3 uppercase tracking-widest">{label}</label>
        <div className="flex bg-black border border-neutral-800 rounded-sm p-1 gap-1">
            {options.map(opt => (
                <button
                    key={opt}
                    onClick={() => onChange(opt)}
                    className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-all rounded-sm ${value === opt ? 'bg-neutral-800 text-white shadow-sm ring-1 ring-neutral-700' : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900'}`}
                >
                    {opt}
                </button>
            ))}
        </div>
    </div>
);
