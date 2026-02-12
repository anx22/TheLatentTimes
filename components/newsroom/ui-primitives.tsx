
import React from 'react';
import { AgentLog } from '../../types';

export const RiskChip: React.FC<{ risk?: string }> = ({ risk }) => {
    if (!risk || risk === 'NONE') return <span className="text-[10px] text-emerald-500 font-mono font-bold">SAFE</span>;
    return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${risk === 'LEGAL' ? 'text-red-500 border-red-900/30 bg-red-900/10' : 'text-amber-500 border-amber-900/30 bg-amber-900/10'}`}>{risk}</span>;
};

export const LogStream: React.FC<{ logs: AgentLog[] }> = ({ logs }) => (
    <div className="h-48 overflow-y-auto font-mono text-[10px] space-y-1.5 opacity-80 custom-scrollbar p-3 bg-black/40 border-t border-neutral-900">
        {logs.slice(-50).reverse().map((l, i) => (
            <div key={i} className="flex gap-3">
                <span className={`font-bold w-12 shrink-0 ${l.agent === 'SYS' ? 'text-red-500' : 'text-accent'}`}>{l.agent}</span>
                <span className="text-neutral-400 break-words leading-tight">{l.message}</span>
            </div>
        ))}
    </div>
);

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
