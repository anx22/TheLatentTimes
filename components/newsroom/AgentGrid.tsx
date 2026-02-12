
import React from 'react';
import { AgentJob, AgentRole } from '../../types';
import { AGENT_ROSTER } from '../../services/agent-registry';

interface AgentGridProps {
    jobs: Record<AgentRole, AgentJob>;
}

export const AgentGrid: React.FC<AgentGridProps> = ({ jobs }) => {
    return (
        <div className="mb-6 grid grid-cols-2 gap-2">
            {Object.entries(jobs).map(([role, job]) => {
                const def = AGENT_ROSTER[role];
                const isActive = job.status === 'WORKING';
                const isError = job.status === 'ERROR';
                
                // Color Mapping
                const borderColor = {
                    'emerald': 'border-emerald-500/50',
                    'red': 'border-red-500/50',
                    'white': 'border-white/50',
                    'neutral': 'border-neutral-500/50',
                    'purple': 'border-purple-500/50',
                    'blue': 'border-blue-500/50'
                }[def.color] || 'border-neutral-800';

                const textColor = {
                    'emerald': 'text-emerald-500',
                    'red': 'text-red-500',
                    'white': 'text-white',
                    'neutral': 'text-neutral-400',
                    'purple': 'text-purple-500',
                    'blue': 'text-blue-500'
                }[def.color] || 'text-neutral-500';

                const bgActive = {
                    'emerald': 'bg-emerald-950/30',
                    'red': 'bg-red-950/30',
                    'white': 'bg-neutral-800',
                    'neutral': 'bg-neutral-900',
                    'purple': 'bg-purple-950/30',
                    'blue': 'bg-blue-950/30'
                }[def.color] || 'bg-neutral-900';

                // Computed Styles based on State
                let finalBorder = 'border-neutral-900';
                let finalBg = 'bg-neutral-950 opacity-60';
                let finalShadow = '';

                if (isActive) {
                    finalBorder = borderColor;
                    finalBg = bgActive;
                    finalShadow = 'shadow-[0_0_10px_rgba(0,0,0,0.5)]';
                } else if (isError) {
                    finalBorder = 'border-red-600';
                    finalBg = 'bg-red-950/50';
                    finalShadow = 'shadow-[0_0_15px_rgba(255,0,0,0.3)]';
                }

                return (
                    <div 
                        key={role}
                        className={`
                            relative p-3 rounded-sm border transition-all duration-300 overflow-hidden
                            ${finalBorder} ${finalBg} ${finalShadow}
                        `}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center mb-1">
                            <span className={`text-xs font-bold uppercase tracking-widest ${isActive ? textColor : isError ? 'text-red-400' : 'text-neutral-600'}`}>
                                {def.name}
                            </span>
                            <span className="text-[10px] grayscale opacity-50">{def.icon}</span>
                        </div>

                        {/* Status */}
                        <div className="min-h-[24px]">
                            {isActive ? (
                                <div className="flex flex-col gap-1">
                                    <span className="text-[9px] font-mono text-neutral-300 truncate animate-pulse">
                                        {job.currentTask}
                                    </span>
                                    {/* Progress Bar */}
                                    <div className="h-0.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full ${textColor.replace('text-', 'bg-')}`} 
                                            style={{ width: `${job.progress > 0 ? job.progress : 100}%`, transition: 'width 0.5s ease-out' }}
                                        ></div>
                                    </div>
                                </div>
                            ) : isError ? (
                                <div className="flex flex-col gap-1">
                                    <span className="text-[9px] font-mono text-red-400 font-bold uppercase tracking-wider">
                                        SYSTEM FAILURE
                                    </span>
                                    <span className="text-[8px] font-mono text-red-300 truncate">
                                        {job.currentTask || "Process Aborted"}
                                    </span>
                                </div>
                            ) : (
                                <span className="text-[9px] font-mono text-neutral-700 uppercase tracking-wider">
                                    {job.status === 'DONE' ? 'Standby' : 'Offline'}
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
