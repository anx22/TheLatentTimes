
import React, { useState } from 'react';
import { useNewsroom } from '../../hooks/useNewsroom';
import { AgentCard } from './AgentCard';
import { Radio, Type, PenTool, Camera, Users } from 'lucide-react';

interface RightPanelProps {
  activeDept: string;
}

export const RightPanel: React.FC<RightPanelProps> = ({ activeDept }) => {
  const { 
    step, logs, sources, setSources, noiseFilter, setNoiseFilter, 
    editorialLens, setEditorialLens, wordCount, setWordCount, 
    visualStyle, setVisualStyle, aspectRatio, setAspectRatio 
  } = useNewsroom();

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
          <div className="space-y-8">
            <div className="mb-4">
              <span className="font-bold text-xs tracking-widest text-emerald-500 uppercase">{activeDept} SETTINGS</span>
            </div>
            
            {activeDept === 'THE WIRE' && (
              <>
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Active Sources</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 text-xs text-zinc-400 cursor-pointer hover:text-white">
                      <input type="checkbox" checked={sources.github} onChange={(e) => setSources({...sources, github: e.target.checked})} className="accent-emerald-500" />
                      GitHub Trending
                    </label>
                    <label className="flex items-center gap-3 text-xs text-zinc-400 cursor-pointer hover:text-white">
                      <input type="checkbox" checked={sources.arxiv} onChange={(e) => setSources({...sources, arxiv: e.target.checked})} className="accent-emerald-500" />
                      Arxiv (CS.AI)
                    </label>
                    <label className="flex items-center gap-3 text-xs text-zinc-400 cursor-pointer hover:text-white">
                      <input type="checkbox" checked={sources.techcrunch} onChange={(e) => setSources({...sources, techcrunch: e.target.checked})} className="accent-emerald-500" />
                      TechCrunch
                    </label>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Noise Filter</h4>
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={noiseFilter} 
                    onChange={(e) => setNoiseFilter(parseInt(e.target.value))}
                    className="w-full accent-emerald-500" 
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500">
                    <span>Broad</span>
                    <span>Strict</span>
                  </div>
                </div>
              </>
            )}

            {activeDept === 'THE BULLPEN' && (
              <>
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Editorial Lens</h4>
                  <select 
                    value={editorialLens}
                    onChange={(e) => setEditorialLens(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-zinc-300 focus:border-emerald-500 outline-none"
                  >
                    <option>Tech-Optimist (Default)</option>
                    <option>Culture-Critic</option>
                    <option>Fashion-Forward</option>
                    <option>Dystopian</option>
                  </select>
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Word Count Target</h4>
                  <select 
                    value={wordCount}
                    onChange={(e) => setWordCount(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-zinc-300 focus:border-emerald-500 outline-none"
                  >
                    <option>Short (300 words)</option>
                    <option>Standard (600 words)</option>
                    <option>Deep Dive (1200 words)</option>
                  </select>
                </div>
              </>
            )}

            {activeDept === 'THE DARKROOM' && (
              <>
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Visual Style</h4>
                  <select 
                    value={visualStyle}
                    onChange={(e) => setVisualStyle(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-zinc-300 focus:border-emerald-500 outline-none"
                  >
                    <option>Editorial Photography</option>
                    <option>Cyberpunk Render</option>
                    <option>Technical Blueprint</option>
                    <option>Abstract Latent</option>
                  </select>
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Aspect Ratio</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => setAspectRatio('16:9')} className={`py-2 rounded text-xs transition-colors ${aspectRatio === '16:9' ? 'bg-zinc-800 text-white font-bold border border-emerald-500' : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800 border border-transparent'}`}>16:9</button>
                    <button onClick={() => setAspectRatio('1:1')} className={`py-2 rounded text-xs transition-colors ${aspectRatio === '1:1' ? 'bg-zinc-800 text-white font-bold border border-emerald-500' : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800 border border-transparent'}`}>1:1</button>
                    <button onClick={() => setAspectRatio('3:4')} className={`py-2 rounded text-xs transition-colors ${aspectRatio === '3:4' ? 'bg-zinc-800 text-white font-bold border border-emerald-500' : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800 border border-transparent'}`}>3:4</button>
                  </div>
                </div>
              </>
            )}

            {activeDept === 'THE PRESS' && (
              <div className="text-xs text-zinc-500 italic">
                No parameters for final review.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
