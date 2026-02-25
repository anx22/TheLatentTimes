import React, { useState, useEffect, useRef } from 'react';
import { useSimpleNewsroom } from '../../hooks/useSimpleNewsroom';
import { MagazineItem } from '../../types';
import { X, Sparkles, ArrowRight, Check, Loader2, Search, Activity, Settings, Database, PenTool, Image as ImageIcon, Terminal, ChevronUp, ChevronDown, SlidersHorizontal, Radio, Type, Camera, RefreshCw } from 'lucide-react';

interface NewsroomFloorProps {
  onPublish: (item: MagazineItem) => void;
  onClose: () => void;
}

type Department = 'THE WIRE' | 'THE BULLPEN' | 'THE DARKROOM' | 'THE PRESS';

// --- AGENT CARD COMPONENT ---
const AgentCard = ({ name, role, status, action, icon: Icon }: { name: string, role: string, status: 'idle' | 'working' | 'done', action: string, icon: any }) => {
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

export const NewsroomFloor: React.FC<NewsroomFloorProps> = ({ onPublish, onClose }) => {
  const { 
    step, topic, setTopic, draft, image, error, logs, 
    tickerItems, isFetchingTicker, fetchTickerData,
    scoutTopic, runPipeline, publish, reset,
    sources, setSources,
    noiseFilter, setNoiseFilter,
    editorialLens, setEditorialLens,
    wordCount, setWordCount,
    visualStyle, setVisualStyle,
    aspectRatio, setAspectRatio
  } = useSimpleNewsroom(onPublish);
  
  const [activeDept, setActiveDept] = useState<Department>('THE WIRE');
  const [ingestionMode, setIngestionMode] = useState<'TICKER' | 'RESEARCH' | 'SPECIFIC'>('TICKER');
  const [isDebugOpen, setIsDebugOpen] = useState(false);
  const [rightPanelMode, setRightPanelMode] = useState<'AGENTS' | 'PARAMETERS'>('AGENTS');
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (isDebugOpen && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isDebugOpen]);

  // Auto-switch tabs based on pipeline step
  useEffect(() => {
    if (step === 'WRITING') setActiveDept('THE BULLPEN');
    if (step === 'VISUALIZING') setActiveDept('THE DARKROOM');
    if (step === 'REVIEW') setActiveDept('THE PRESS');
    if (step === 'IDLE' && draft) setActiveDept('THE PRESS'); // If finished but not published
  }, [step]);

  // Fetch ticker data initially
  useEffect(() => {
    fetchTickerData();
  }, [fetchTickerData]);

  // Derive department status
  const getDeptStatus = (dept: Department) => {
    switch (dept) {
      case 'THE WIRE':
        return step === 'SCOUTING' ? { label: 'SCANNING', color: 'text-purple-400', items: 0 } : { label: 'LISTENING', color: 'text-emerald-500', items: tickerItems.length };
      case 'THE BULLPEN':
        return step === 'WRITING' ? { label: 'DRAFTING', color: 'text-amber-400', items: 1 } : { label: draft ? 'DONE' : 'IDLE', color: draft ? 'text-emerald-500' : 'text-zinc-600', items: draft ? 1 : 0 };
      case 'THE DARKROOM':
        return step === 'VISUALIZING' ? { label: 'DEVELOPING', color: 'text-amber-400', items: 1 } : { label: image ? 'DONE' : 'IDLE', color: image ? 'text-emerald-500' : 'text-zinc-600', items: image ? 1 : 0 };
      case 'THE PRESS':
        return step === 'REVIEW' ? { label: 'NEEDS REVIEW', color: 'text-red-400', items: 1 } : { label: 'IDLE', color: 'text-zinc-600', items: 0 };
    }
  };

  const getLatestAgentLog = (agentName: string, defaultAction: string) => {
    const agentLogs = logs.filter(l => l.agent === agentName.toUpperCase());
    if (agentLogs.length > 0) {
      return agentLogs[agentLogs.length - 1].message;
    }
    return defaultAction;
  };

  return (
    <div className="fixed inset-0 bg-zinc-950 text-zinc-50 z-50 flex flex-col font-mono text-sm">
      {/* HEADER */}
      <header className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-950 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="font-bold tracking-widest text-xs">MODUS OPERATIONS FLOOR</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-px h-4 bg-zinc-800" />
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* THE EDITORIAL CHAIN (TABS) */}
      <div className="flex border-b border-zinc-800 bg-zinc-900/50 shrink-0">
        {(['THE WIRE', 'THE BULLPEN', 'THE DARKROOM', 'THE PRESS'] as Department[]).map((dept) => {
          const status = getDeptStatus(dept);
          const isActive = activeDept === dept;
          return (
            <button
              key={dept}
              onClick={() => setActiveDept(dept)}
              className={`flex-1 p-4 border-r border-zinc-800 text-left transition-colors relative ${isActive ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'}`}
            >
              {isActive && <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />}
              <div className="flex justify-between items-start mb-2">
                <span className={`font-bold tracking-widest text-xs ${isActive ? 'text-white' : 'text-zinc-400'}`}>{dept}</span>
                <span className="text-[10px] bg-zinc-950 px-2 py-0.5 rounded text-zinc-500">{status.items} ITEMS</span>
              </div>
              <div className={`text-[10px] font-bold tracking-wider ${status.color}`}>
                {status.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* WORKSPACE (MAIN AREA) */}
      <main className="flex-1 overflow-hidden flex relative bg-zinc-900/20">
        
        {/* LEFT: MAIN CONTENT AREA */}
        <div className="flex-1 overflow-y-auto flex flex-col relative">
          {/* THE WIRE (INGESTION) */}
          {activeDept === 'THE WIRE' && (
            <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-6">
              <div className="flex border-b border-zinc-800 text-xs mb-6">
                <button onClick={() => setIngestionMode('TICKER')} className={`px-6 py-3 transition-colors ${ingestionMode === 'TICKER' ? 'border-b-2 border-emerald-500 text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}>THE TICKER</button>
                <button onClick={() => setIngestionMode('RESEARCH')} className={`px-6 py-3 transition-colors ${ingestionMode === 'RESEARCH' ? 'border-b-2 border-emerald-500 text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}>AUTO-SCOUT</button>
                <button onClick={() => setIngestionMode('SPECIFIC')} className={`px-6 py-3 transition-colors ${ingestionMode === 'SPECIFIC' ? 'border-b-2 border-emerald-500 text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}>TARGETED SEARCH</button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {ingestionMode === 'TICKER' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-zinc-500">Zero-token passive aggregation.</p>
                      <button 
                        onClick={fetchTickerData} 
                        disabled={isFetchingTicker}
                        className="flex items-center gap-2 text-xs text-emerald-500 hover:text-emerald-400 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3 h-3 ${isFetchingTicker ? 'animate-spin' : ''}`} />
                        POLL SOURCES
                      </button>
                    </div>
                    {tickerItems.length === 0 && !isFetchingTicker && (
                      <div className="text-center py-12 text-zinc-500">
                        No signals found. Adjust your noise filter or enable more sources.
                      </div>
                    )}
                    <div className="space-y-3">
                      {tickerItems.map(item => (
                        <div 
                          key={item.id} 
                          onClick={() => setTopic(item.text)}
                          className={`p-4 border rounded cursor-pointer transition-colors group ${topic === item.text ? 'border-emerald-500 bg-emerald-500/5' : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-600'}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">{item.source}</span>
                            <span className="text-[10px] text-zinc-600">{item.time}</span>
                          </div>
                          <p className="text-base text-zinc-300 group-hover:text-white">{item.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {ingestionMode === 'RESEARCH' && (
                  <div className="flex flex-col items-center justify-center h-full space-y-6 text-center">
                    <Activity className="w-12 h-12 text-zinc-700" />
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-white">Deploy The Scout</h3>
                      <p className="text-sm text-zinc-500 max-w-md">Command the Scout agent to scan the global network for emerging trends in technology, AI models, and code.</p>
                    </div>
                    <button 
                      onClick={scoutTopic}
                      disabled={step === 'SCOUTING'}
                      className="flex items-center gap-2 bg-zinc-800 text-zinc-300 px-6 py-3 rounded font-bold hover:bg-zinc-700 transition-colors border border-zinc-700 disabled:opacity-50"
                    >
                      {step === 'SCOUTING' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-purple-400" />}
                      <span>{step === 'SCOUTING' ? 'SCANNING THE WIRE...' : 'INITIATE SCOUT'}</span>
                    </button>
                  </div>
                )}

                {ingestionMode === 'SPECIFIC' && (
                  <div className="max-w-xl mx-auto mt-12 space-y-6">
                    <div className="space-y-2 text-center">
                      <Search className="w-8 h-8 text-zinc-700 mx-auto" />
                      <h3 className="text-lg font-bold text-white">Targeted Signal</h3>
                      <p className="text-sm text-zinc-500">Manually inject a topic into the editorial pipeline.</p>
                    </div>
                    <input 
                      type="text" 
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g. Synthetic Biology..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-4 text-lg focus:outline-none focus:border-emerald-500 transition-colors text-center"
                    />
                  </div>
                )}
              </div>

              {/* ACTION BAR */}
              <div className="mt-6 pt-6 border-t border-zinc-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500 uppercase tracking-widest">Active Signal:</span>
                  <span className="text-sm font-bold text-emerald-400">{topic || 'NONE'}</span>
                </div>
                <button 
                  onClick={runPipeline}
                  disabled={!topic.trim() || step === 'WRITING' || step === 'VISUALIZING'}
                  className="flex items-center gap-2 bg-zinc-100 text-zinc-900 px-6 py-2 rounded font-bold hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>SEND TO BULLPEN</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* THE BULLPEN (EDITORIAL) */}
          {activeDept === 'THE BULLPEN' && (
            <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-6">
              {step === 'WRITING' ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                  <div className="w-full max-w-md space-y-4">
                    <div className="h-4 bg-zinc-800 rounded w-3/4 animate-pulse" />
                    <div className="h-4 bg-zinc-800 rounded w-full animate-pulse" />
                    <div className="h-4 bg-zinc-800 rounded w-5/6 animate-pulse" />
                    <div className="h-4 bg-zinc-800 rounded w-full animate-pulse" />
                    <div className="h-4 bg-zinc-800 rounded w-2/3 animate-pulse" />
                  </div>
                </div>
              ) : draft ? (
                <div className="flex-1 overflow-y-auto space-y-8 animate-fade-in bg-zinc-950 border border-zinc-800 p-8 rounded">
                  <div className="space-y-4 border-b border-zinc-800 pb-6">
                    <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">{draft.tags.join(' • ')}</span>
                    <h2 className="text-4xl font-display font-bold leading-tight text-white">{draft.headline}</h2>
                    <p className="text-xl text-zinc-400 italic border-l-2 border-emerald-500 pl-4">{draft.deck}</p>
                  </div>
                  <div className="prose prose-invert prose-zinc max-w-none">
                    {draft.body.split('\n').map((p, i) => <p key={i}>{p}</p>)}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4 opacity-50">
                  <PenTool className="w-12 h-12 text-zinc-700" />
                  <p className="text-sm text-zinc-500">The Bullpen is empty. Send a signal from The Wire.</p>
                </div>
              )}
            </div>
          )}

          {/* THE DARKROOM (PRODUCTION) */}
          {activeDept === 'THE DARKROOM' && (
            <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-6">
              {step === 'VISUALIZING' ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                  <div className="w-full max-w-2xl aspect-[16/9] bg-zinc-900 border border-zinc-800 rounded flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                  </div>
                </div>
              ) : image ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-6 animate-fade-in">
                  <div className="relative w-full max-w-2xl aspect-[16/9] bg-black rounded overflow-hidden border border-zinc-800 shadow-2xl">
                    <img src={image} alt="Generated" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-full max-w-2xl text-xs text-zinc-400 bg-zinc-950 p-4 rounded border border-zinc-800">
                    <span className="font-bold text-emerald-500 uppercase tracking-widest block mb-2">Developed from Prompt:</span> 
                    {draft?.suggested_visual_prompt}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4 opacity-50">
                  <ImageIcon className="w-12 h-12 text-zinc-700" />
                  <p className="text-sm text-zinc-500">The Darkroom is empty. Awaiting editorial copy.</p>
                </div>
              )}
            </div>
          )}

          {/* THE PRESS (PUBLISHING) */}
          {activeDept === 'THE PRESS' && (
            <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-6">
              {step === 'REVIEW' && draft && image ? (
                <div className="flex-1 flex flex-col">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white">Final Review</h2>
                    <p className="text-zinc-500">Artifact is ready for the grid.</p>
                  </div>
                  
                  <div className="flex-1 grid grid-cols-2 gap-8">
                    <div className="relative bg-black rounded border border-zinc-800 overflow-hidden">
                       <img src={image} alt="Generated" className="w-full h-full object-cover opacity-80" />
                    </div>
                    <div className="bg-zinc-950 border border-zinc-800 p-6 rounded overflow-y-auto">
                      <h3 className="text-xl font-bold text-white mb-2">{draft.headline}</h3>
                      <p className="text-sm text-zinc-400 italic mb-4">{draft.deck}</p>
                      <div className="text-xs text-zinc-500 space-y-2">
                        {draft.body.split('\n').slice(0, 2).map((p, i) => <p key={i}>{p}</p>)}
                        <p>...</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-center gap-4">
                    <button onClick={reset} className="px-6 py-3 text-zinc-500 hover:text-white transition-colors">SCRAP ARTIFACT</button>
                    <button 
                      onClick={publish}
                      className="flex items-center gap-2 bg-emerald-500 text-black px-8 py-3 rounded font-bold hover:bg-emerald-400 transition-colors"
                    >
                      <Check className="w-5 h-5" />
                      <span>SEND TO PRESS (PUBLISH)</span>
                    </button>
                  </div>
                </div>
              ) : step === 'PUBLISHED' ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-6 animate-fade-in">
                  <div className="w-24 h-24 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center">
                    <Check className="w-12 h-12" />
                  </div>
                  <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold text-white tracking-widest">PUBLISHED</h2>
                    <p className="text-zinc-500">The artifact is now live on the grid.</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4 opacity-50">
                  <Check className="w-12 h-12 text-zinc-700" />
                  <p className="text-sm text-zinc-500">No artifacts ready for review.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT: PERSISTENT PANEL (AGENTS / PARAMETERS) */}
        <div className="w-80 border-l border-zinc-800 bg-zinc-950 flex flex-col shrink-0">
          <div className="flex border-b border-zinc-800">
            <button 
              onClick={() => setRightPanelMode('AGENTS')}
              className={`flex-1 py-3 text-xs font-bold tracking-widest transition-colors ${rightPanelMode === 'AGENTS' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              AGENTS
            </button>
            <button 
              onClick={() => setRightPanelMode('PARAMETERS')}
              className={`flex-1 py-3 text-xs font-bold tracking-widest transition-colors ${rightPanelMode === 'PARAMETERS' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              PARAMETERS
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {rightPanelMode === 'AGENTS' && (
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

            {rightPanelMode === 'PARAMETERS' && (
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

      </main>

      {/* THE DEBUG CONSOLE (SYSTEM LOG) */}
      <div className={`border-t border-zinc-800 bg-black shrink-0 transition-all duration-300 ease-in-out flex flex-col ${isDebugOpen ? 'h-64' : 'h-10'}`}>
        <button 
          onClick={() => setIsDebugOpen(!isDebugOpen)}
          className="h-10 px-4 flex items-center justify-between hover:bg-zinc-900 transition-colors w-full"
        >
          <div className="flex items-center gap-2 text-zinc-400">
            <Terminal className="w-4 h-4" />
            <span className="text-xs font-bold tracking-widest uppercase">System Log</span>
            {logs.length > 0 && (
              <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded ml-2">{logs.length} EVENTS</span>
            )}
          </div>
          {isDebugOpen ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronUp className="w-4 h-4 text-zinc-500" />}
        </button>
        
        {isDebugOpen && (
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

                return (
                  <div key={log.id} className="flex gap-4">
                    <span className="text-zinc-600 shrink-0">{log.timestamp.toLocaleTimeString()}</span>
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

      {/* ERROR OVERLAY */}
      {error && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded shadow-2xl flex items-center gap-4 z-50">
          <span className="font-bold text-sm">SYSTEM FAILURE:</span>
          <span className="text-sm">{error}</span>
          <button onClick={reset} className="ml-4 bg-black/20 px-3 py-1 rounded text-xs hover:bg-black/40">DISMISS</button>
        </div>
      )}
    </div>
  );
};
