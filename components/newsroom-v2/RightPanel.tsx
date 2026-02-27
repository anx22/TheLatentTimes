
import React, { useState } from 'react';
import { useNewsroom } from '../../hooks/useNewsroom';
import { AgentCard } from './AgentCard';
import { ParametersPanel } from './ParametersPanel';
import { Radio, Type, PenTool, Camera, Users } from 'lucide-react';

interface RightPanelProps {
  activeDept: string;
}

export const RightPanel: React.FC<RightPanelProps> = ({ activeDept }) => {
  const { step, logs } = useNewsroom();

  const [mode, setMode] = useState<'AGENTS' | 'PARAMETERS'>('AGENTS');

  const getLatestAgentLog = (agentName: string, defaultAction: string) => {
    const agentLogs = logs.filter(l => l.agent === agentName.toUpperCase());
    if (agentLogs.length > 0) {
      return agentLogs[agentLogs.length - 1].message;
    }
    return defaultAction;
  };

  return (
    <div className="w-80 border-l border-zinc-800 bg-zinc-950 flex flex-col shrink-0">
      <div className="flex border-b border-zinc-800">
        <button 
          onClick={() => setMode('AGENTS')}
          className={`flex-1 py-3 text-xs font-bold tracking-widest transition-colors ${mode === 'AGENTS' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          AGENTS
        </button>
        <button 
          onClick={() => setMode('PARAMETERS')}
          className={`flex-1 py-3 text-xs font-bold tracking-widest transition-colors ${mode === 'PARAMETERS' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          PARAMETERS
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {mode === 'AGENTS' && (
          <div className="space-y-4">
            {activeDept === 'THE WIRE' && (
              <AgentCard 
                name="The Scout" 
                role="Ingestion & Discovery" 
                status={step === 'SCOUTING' ? 'working' : 'idle'} 
                action={getLatestAgentLog('THE SCOUT', "Interfacing with global data streams...")} 
                icon={Radio} 
              />
            )}
            {activeDept === 'THE BULLPEN' && (
              <>
                <AgentCard 
                  name="The Board" 
                  role="Editorial Debate" 
                  status={step === 'DEBATING' ? 'working' : 'idle'} 
                  action={getLatestAgentLog('THE BOARD', "Generating distinct editorial angles...")} 
                  icon={Users} 
                />
                <AgentCard 
                  name="The Columnist" 
                  role="Lead Writer" 
                  status={step === 'WRITING' ? 'working' : 'idle'} 
                  action={getLatestAgentLog('THE COLUMNIST', "Synthesizing cultural vectors and technical data...")} 
                  icon={Type} 
                />
                <AgentCard 
                  name="The Editor" 
                  role="Critical Review" 
                  status={step === 'WRITING' ? 'working' : 'idle'} 
                  action={getLatestAgentLog('THE EDITOR', "Reviewing structural integrity...")} 
                  icon={PenTool} 
                />
              </>
            )}
            {activeDept === 'THE DARKROOM' && (
              <AgentCard 
                name="The Photographer" 
                role="Visual Director" 
                status={step === 'VISUALIZING' ? 'working' : 'idle'} 
                action={getLatestAgentLog('THE PHOTOGRAPHER', "Developing latent space artifacts...")} 
                icon={Camera} 
              />
            )}
            {activeDept === 'THE PRESS' && (
              <div className="text-xs text-zinc-500 italic text-center py-8">
                No active agents in The Press.
              </div>
            )}
          </div>
        )}

        {mode === 'PARAMETERS' && (
          <ParametersPanel activeDept={activeDept} />
        )}
      </div>
    </div>
  );
};
