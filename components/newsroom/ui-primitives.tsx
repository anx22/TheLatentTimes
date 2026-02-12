
import React from 'react';
import { AgentLog } from '../../types';

export const RiskChip: React.FC<{ risk?: string }> = ({ risk }) => {
    if (!risk || risk === 'NONE') return <span className="text-[9px] text-emerald-500 font-mono">SAFE</span>;
    return <span className={`text-[9px] font-bold ${risk === 'LEGAL' ? 'text-red-500' : 'text-amber-500'}`}>{risk}</span>;
};

export const LogStream: React.FC<{ logs: AgentLog[] }> = ({ logs }) => (
    <div className="h-32 overflow-y-auto font-mono text-[9px] space-y-1 opacity-70 custom-scrollbar p-2 bg-black/20 border-t border-neutral-900">
        {logs.slice(-20).reverse().map((l, i) => (
            <div key={i} className="flex gap-2">
                <span className={`font-bold w-10 shrink-0 ${l.agent === 'SYS' ? 'text-red-500' : 'text-accent'}`}>{l.agent}</span>
                <span className="text-neutral-400 truncate">{l.message}</span>
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
    <div className="mb-4">
        <label className="block text-[9px] font-bold text-neutral-500 mb-2 uppercase tracking-widest">{label}</label>
        <div className="flex bg-black border border-neutral-800 rounded-sm p-0.5">
            {options.map(opt => (
                <button
                    key={opt}
                    onClick={() => onChange(opt)}
                    className={`flex-1 py-1.5 text-[9px] font-bold uppercase tracking-wider transition-all rounded-sm ${value === opt ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
                >
                    {opt}
                </button>
            ))}
        </div>
    </div>
);
