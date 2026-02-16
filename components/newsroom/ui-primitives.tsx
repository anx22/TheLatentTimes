
import React, { useEffect, useRef, useState } from 'react';
import { AgentLog, AgentRole } from '../../types';
import { AGENT_ROSTER } from '../../services/agent-registry';

export const RiskChip: React.FC<{ risk?: string }> = ({ risk }) => {
    if (!risk || risk === 'NONE') return <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">SAFE</span>;
    
    let color = 'text-amber-700 bg-amber-50 border-amber-200';
    if (risk === 'LEGAL') color = 'text-red-700 bg-red-50 border-red-200';
    
    return <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${color}`}>{risk}</span>;
};

// --- NEW: JSON INSPECTOR ---
export const JsonInspector: React.FC<{ data: any; label?: string; collapsed?: boolean }> = ({ data, label = "Raw Object Data", collapsed = true }) => {
    const [isOpen, setIsOpen] = useState(!collapsed);
    
    // Safety: Don't render if data is empty or trivial
    if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) return null;

    return (
        <div className="border border-zinc-200 rounded-md bg-white overflow-hidden mt-2">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 transition-colors text-[9px] font-bold uppercase tracking-widest text-zinc-500"
            >
                <span>{label}</span>
                <span className="font-mono">{isOpen ? '[-]' : '[+]'}</span>
            </button>
            {isOpen && (
                <div className="p-3 bg-[#0A0A0A] overflow-x-auto max-h-[300px] custom-scrollbar border-t border-zinc-200">
                    <pre className="text-[9px] font-mono text-zinc-400 leading-relaxed whitespace-pre-wrap break-all">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};

// --- NEW: TONE EQ SLIDER (Shared) ---
export const ToneEQSlider: React.FC<{ label: string; value: number; max: number; onChange?: (v: number) => void }> = ({ label, value, max, onChange }) => (
    <div className="mb-4">
        <div className="flex justify-between mb-1">
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{label}</span>
            <span className="text-[9px] font-mono text-zinc-400">{value}/{max}</span>
        </div>
        <div className="flex gap-0.5 h-3 cursor-pointer group" onClick={(e) => {
            if (!onChange) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percent = x / rect.width;
            const newValue = Math.ceil(percent * max);
            onChange(Math.max(1, newValue));
        }}>
            {Array.from({ length: max }).map((_, i) => (
                <div 
                    key={i}
                    className={`flex-1 rounded-sm transition-all duration-200 ${i < value ? 'bg-indigo-500 group-hover:bg-indigo-400' : 'bg-zinc-200 group-hover:bg-zinc-300'}`}
                ></div>
            ))}
        </div>
    </div>
);

// --- NEW: AGENT AVATAR ---
export const AgentAvatar: React.FC<{ role: string; size?: 'sm' | 'md' }> = ({ role, size = 'sm' }) => {
    const def = AGENT_ROSTER[role] || { color: 'zinc', icon: '?', name: 'System' };
    
    const sizeClasses = size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs';
    
    const colorClasses: Record<string, string> = {
        emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        red: 'bg-rose-100 text-rose-700 border-rose-200',
        blue: 'bg-blue-100 text-blue-700 border-blue-200',
        neutral: 'bg-zinc-100 text-zinc-700 border-zinc-200',
        purple: 'bg-purple-100 text-purple-700 border-purple-200',
        white: 'bg-white text-zinc-700 border-zinc-200',
    };

    const style = colorClasses[def.color] || colorClasses.neutral;

    return (
        <div className={`${sizeClasses} ${style} rounded-full flex items-center justify-center font-bold border shadow-sm shrink-0`} title={def.name}>
            {def.icon}
        </div>
    );
};

// --- NEW: TEAM STREAM (Chat Style) ---
export const TeamStream: React.FC<{ logs: AgentLog[]; className?: string }> = ({ logs, className }) => {
    const bottomRef = useRef<HTMLDivElement>(null);

    // Strict auto-scroll on every new log
    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs.length]);

    const formatTime = (ts: string) => {
        try {
            const d = new Date(ts);
            // Manual formatting to ensure HH:MM:SS.mmm format without TS issues on 'fractionDigits' option
            return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' }) + '.' + d.getMilliseconds().toString().padStart(3, '0');
        } catch {
            return ts.split(' ')[0];
        }
    };

    return (
        <div className={`overflow-y-auto custom-scrollbar p-4 space-y-4 bg-zinc-50/50 ${className}`}>
            {logs.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-zinc-300 space-y-2">
                    <span className="text-xl grayscale opacity-20">👋</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Team Offline</span>
                </div>
            )}
            
            {logs.map((l, i) => {
                const isSystem = l.agent === 'SYS' || l.agent === 'OPS';
                const agentName = AGENT_ROSTER[l.agent]?.name || l.agent;
                const timeStr = formatTime(l.timestamp);
                
                if (isSystem) {
                    return (
                        <div key={i} className="flex flex-col items-center my-3 animate-fade-in">
                            <span className="text-[9px] font-mono text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full uppercase tracking-wider mb-1">
                                {timeStr} • {l.message}
                            </span>
                            {/* System logs can also have data */}
                            {l.data && <div className="w-full max-w-[200px]"><JsonInspector data={l.data} label="SYS DATA" collapsed={true} /></div>}
                        </div>
                    );
                }

                return (
                    <div key={i} className="flex gap-3 animate-fade-in group items-start">
                        <div className="mt-1"><AgentAvatar role={l.agent} /></div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2 mb-0.5">
                                <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-wide">
                                    {agentName}
                                </span>
                                <span className="text-[9px] text-zinc-300 font-mono">
                                    {timeStr}
                                </span>
                            </div>
                            <div className="text-[11px] text-zinc-600 leading-snug bg-white p-2 rounded-tr-lg rounded-br-lg rounded-bl-lg border border-zinc-100 shadow-sm inline-block max-w-full break-words">
                                {l.message}
                                {l.data && (
                                    <div className="mt-2 min-w-[200px]">
                                        <JsonInspector data={l.data} label="ARTIFACT" collapsed={true} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
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
    <div className="mb-4">
        <label className="block text-[10px] font-semibold text-zinc-500 mb-2 uppercase">{label}</label>
        <div className="flex bg-zinc-100 border border-zinc-200 rounded-md p-1 gap-1">
            {options.map(opt => (
                <button
                    key={opt}
                    onClick={() => onChange(opt)}
                    className={`flex-1 py-1.5 text-[10px] font-medium transition-all rounded-sm ${value === opt ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
                >
                    {opt}
                </button>
            ))}
        </div>
    </div>
);
