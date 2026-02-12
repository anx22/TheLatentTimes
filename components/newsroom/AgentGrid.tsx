
import React from 'react';
import { AgentJob, AgentRole } from '../../types';
import { AGENT_ROSTER } from '../../services/agent-registry';

interface AgentGridProps {
    jobs: Record<AgentRole, AgentJob>;
    onAgentClick?: (role: AgentRole) => void;
}

export const AgentGrid: React.FC<AgentGridProps> = ({ jobs, onAgentClick }) => {
    return (
        <div className="mb-4 grid grid-cols-2 gap-2">
            {Object.entries(jobs).map(([role, job]) => {
                const def = AGENT_ROSTER[role];
                const isActive = job.status === 'WORKING';
                const isError = job.status === 'ERROR';
                
                // Colors based on Agent Definition
                const colorMap: Record<string, string> = {
                    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
                    red: 'text-rose-600 bg-rose-50 border-rose-100',
                    blue: 'text-blue-600 bg-blue-50 border-blue-100',
                    purple: 'text-purple-600 bg-purple-50 border-purple-100',
                    neutral: 'text-zinc-600 bg-zinc-100 border-zinc-200',
                    white: 'text-zinc-800 bg-white border-zinc-200'
                };
                const theme = colorMap[def.color] || colorMap.neutral;

                return (
                    <div 
                        key={role}
                        onClick={() => onAgentClick && onAgentClick(role as AgentRole)}
                        className={`
                            relative p-3 rounded-md border transition-all duration-300 overflow-hidden group cursor-pointer
                            ${isActive ? 'bg-white border-zinc-300 shadow-md scale-[1.02] z-10' : 'bg-zinc-50 border-zinc-100 opacity-80 hover:opacity-100 hover:border-zinc-300'}
                        `}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-1.5">
                                <span className={`text-[10px] p-1 rounded-sm ${isActive ? theme : 'bg-zinc-200 text-zinc-400 group-hover:text-zinc-600'}`}>
                                    {def.icon}
                                </span>
                                <span className={`text-[10px] font-bold uppercase tracking-wide truncate ${isActive ? 'text-zinc-900' : 'text-zinc-400 group-hover:text-zinc-600'}`}>
                                    {def.name}
                                </span>
                            </div>
                            {isActive && (
                                <span className="flex h-1.5 w-1.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                </span>
                            )}
                        </div>

                        {/* Current Task Display */}
                        <div className="min-h-[24px]">
                            {isActive ? (
                                <p className="text-[10px] leading-tight text-zinc-600 line-clamp-2 font-medium">
                                    {job.currentTask || "Processing..."}
                                </p>
                            ) : isError ? (
                                <span className="text-[9px] font-mono font-bold text-red-500">OFFLINE (ERR)</span>
                            ) : (
                                <span className="text-[9px] text-zinc-300 font-mono uppercase tracking-wider group-hover:text-zinc-400">Standing By</span>
                            )}
                        </div>
                        
                        {/* Progress Bar */}
                        {isActive && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-100">
                                <div 
                                    className="h-full bg-indigo-500 transition-all duration-300 ease-out" 
                                    style={{ width: `${job.progress > 0 ? job.progress : 15}%` }}
                                ></div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
