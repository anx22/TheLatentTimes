import React from 'react';

interface AgentCardProps {
  name: string;
  role: string;
  status: 'idle' | 'working' | 'done';
  action: string;
  icon: React.ElementType;
}

export const AgentCard: React.FC<AgentCardProps> = ({ name, role, status, action, icon: Icon }) => {
  const isWorking = status === 'working';
  return (
    <div className={`p-4 rounded-lg border transition-all duration-500 relative overflow-hidden ${isWorking ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'border-zinc-800 bg-zinc-900/50 opacity-50'}`}>
      {isWorking && (
        <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />
      )}
      <div className="flex items-start gap-4 relative z-10">
        <div className={`p-3 rounded-full transition-colors duration-300 ${isWorking ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.6)]' : 'bg-zinc-800 text-zinc-500'}`}>
          <Icon className={`w-6 h-6 ${isWorking ? 'animate-pulse' : ''}`} />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <h4 className={`font-bold tracking-widest uppercase ${isWorking ? 'text-emerald-400' : 'text-zinc-400'}`}>{name}</h4>
            <span className="text-[10px] text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">{role}</span>
          </div>
          <div className="min-h-[24px] flex items-center mt-2">
            {isWorking ? (
              <div className="flex items-start gap-2 bg-black/40 p-2 rounded border border-emerald-500/30 w-full">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping mt-1.5 shrink-0" />
                <p className="text-xs text-emerald-100 font-mono leading-relaxed">
                  {action}
                </p>
              </div>
            ) : (
              <p className="text-xs text-zinc-600 font-mono italic">Awaiting assignment...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
