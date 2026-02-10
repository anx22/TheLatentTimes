
import React, { useState, useEffect, useRef } from 'react';
import { IssueContent, AgentLog, DropArtifact, StoryArtifact, RecipeArtifact, ArtifactStatus, AspectRatio, DebateArtifact } from '../types';
import { RunConfig } from '../hooks/useNewsroom';
import { savePendingIssue, loadPendingIssue, initiateLogin, getSession } from '../services/storage';
import { generateImage } from '../services/gemini';

interface NewsroomProps {
  logs: AgentLog[];
  isProcessing: boolean;
  onRun: (theme: string, targets: string[], useDemo: boolean, config: RunConfig, onUpdate?: (partial: IssueContent) => void) => Promise<IssueContent | null>;
  onPublish: (issue: IssueContent) => void;
  onCancel: () => void;
}

// --- HELPER COMPONENTS & FUNCTIONS ---
const countReviewItems = (issue: IssueContent) => {
  if (!issue) return 0;
  let count = 0;
  if (issue.cover.title) count++; 
  count += issue.drops.length;
  count += issue.features.length;
  count += issue.columns.length;
  return count;
};

const getAgentBadgeColor = (role: string) => {
  switch(role) {
    case 'CRITIC': return 'text-red-400 border border-red-900 bg-red-900/20';
    case 'RUNWAY': return 'text-pink-400 border border-pink-900 bg-pink-900/20';
    case 'ATELIER': return 'text-purple-400 border border-purple-900 bg-purple-900/20';
    default: return 'text-gray-400 border border-gray-700 bg-gray-800';
  }
};

interface ReviewCardProps {
  type: 'cover' | 'drop' | 'story' | 'recipe';
  title: string;
  body: string;
  status?: ArtifactStatus;
  img?: string;
  prompt?: string;
  aspectRatio?: AspectRatio;
  meta?: string;
  onChange: (status: ArtifactStatus) => void;
  onUpdateHeadline?: (val: string) => void;
  onUpdateBody?: (val: string) => void;
  onUpdatePrompt?: (val: string) => void;
  onRegenerate?: (prompt: string, ratio: AspectRatio) => Promise<boolean>;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ 
    type, title, body, status, img, prompt, aspectRatio, meta, 
    onChange, onUpdateHeadline, onUpdateBody, onUpdatePrompt, onRegenerate 
}) => {
    const [localPrompt, setLocalPrompt] = useState(prompt || "");
    const [isRegenerating, setIsRegenerating] = useState(false);

    useEffect(() => {
        setLocalPrompt(prompt || "");
    }, [prompt]);

    const handleRegen = async () => {
        if (!onRegenerate || !aspectRatio) return;
        setIsRegenerating(true);
        await onRegenerate(localPrompt, aspectRatio);
        setIsRegenerating(false);
    };

    return (
        <div className="border border-gray-800 bg-gray-900/50 rounded-sm p-6 animate-fade-in relative group">
            <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-black px-2 py-1 rounded">
                    {type} {meta ? `// ${meta}` : ''}
                </span>
                <select 
                    value={status || 'DRAFT'} 
                    onChange={(e) => onChange(e.target.value as ArtifactStatus)}
                    className={`bg-black text-[10px] font-bold uppercase tracking-widest border px-2 py-1 rounded focus:outline-none ${
                        status === 'PUBLISHED' ? 'text-green-400 border-green-900' : 
                        status === 'REJECTED' ? 'text-red-400 border-red-900' : 
                        'text-yellow-400 border-yellow-900'
                    }`}
                >
                    <option value="DRAFT">Draft</option>
                    <option value="REVIEW">Review</option>
                    <option value="PUBLISHED">Approved</option>
                    <option value="REJECTED">Kill</option>
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className={`col-span-12 ${img !== undefined ? 'md:col-span-8' : 'md:col-span-12'}`}>
                    {onUpdateHeadline ? (
                         <input 
                            className="w-full bg-transparent text-xl md:text-2xl font-display font-bold text-white mb-2 border-b border-transparent hover:border-gray-700 focus:border-gray-500 focus:outline-none transition-colors"
                            value={title}
                            onChange={(e) => onUpdateHeadline(e.target.value)}
                         />
                    ) : (
                        <h3 className="text-xl md:text-2xl font-display font-bold text-white mb-2">{title}</h3>
                    )}
                    
                    {onUpdateBody ? (
                        <textarea 
                            className="w-full bg-transparent text-sm text-gray-400 leading-relaxed h-32 resize-y border border-transparent hover:border-gray-700 focus:border-gray-500 focus:outline-none p-2 -ml-2 rounded transition-colors"
                            value={body}
                            onChange={(e) => onUpdateBody(e.target.value)}
                        />
                    ) : (
                        <p className="text-sm text-gray-400 leading-relaxed mb-4">{body}</p>
                    )}
                </div>
                
                {img !== undefined && (
                    <div className="col-span-12 md:col-span-4 space-y-3">
                         <div className="aspect-video bg-black border border-gray-800 relative overflow-hidden flex items-center justify-center">
                             {img ? (
                                 <img src={img} className="w-full h-full object-cover" alt="Asset" />
                             ) : (
                                 <div className="text-[10px] text-gray-600 uppercase tracking-widest">No Asset</div>
                             )}
                             {isRegenerating && (
                                 <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                                     <div className="w-6 h-6 border-2 border-gray-500 border-t-white rounded-full animate-spin"></div>
                                 </div>
                             )}
                         </div>
                         
                         {onUpdatePrompt && (
                             <div className="relative">
                                 <textarea 
                                     className="w-full bg-[#0a0a0a] text-[10px] text-gray-500 font-mono p-2 border border-gray-800 focus:border-gray-600 focus:outline-none h-16 resize-none"
                                     value={localPrompt}
                                     onChange={(e) => {
                                         setLocalPrompt(e.target.value);
                                         if (onUpdatePrompt) onUpdatePrompt(e.target.value);
                                     }}
                                     placeholder="Prompt..."
                                 />
                                 <button 
                                     onClick={handleRegen}
                                     disabled={isRegenerating}
                                     className="absolute bottom-2 right-2 text-[9px] font-bold uppercase tracking-widest bg-gray-800 hover:bg-white hover:text-black px-2 py-1 rounded transition-colors disabled:opacity-50"
                                 >
                                     Regen
                                 </button>
                             </div>
                         )}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---

export const TheNewsroom: React.FC<NewsroomProps> = ({ logs, isProcessing, onRun, onPublish, onCancel }) => {
  const [theme, setTheme] = useState("Agentic Drift");
  const [targets, setTargets] = useState("Kling 3 Release, Nano Banana, Clawdbot Early Beginnings"); 
  const [useDemo, setUseDemo] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'CONFIG' | 'CONSOLE' | 'DEBATE' | 'QUEUE'>('CONSOLE');
  const [pendingIssue, setPendingIssue] = useState<IssueContent | null>(null);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Granular Controls
  const [config, setConfig] = useState<RunConfig>({
    deepResearch: true,
    qualityPass: true,
    includeAtelier: true,
    generateImages: false 
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  // Check auth on mount
  useEffect(() => {
    getSession().then(session => {
        setIsLoggedIn(!!session);
        setIsCheckingAuth(false);
    });
  }, []);

  // Load pending issue on mount if auth present
  useEffect(() => {
    if (isLoggedIn) {
        loadPendingIssue().then(savedPending => {
            if (savedPending) {
                setPendingIssue(savedPending);
                setActiveTab('QUEUE');
            }
        });
    } else {
        if (window.innerWidth < 768) setActiveTab('CONFIG');
    }
  }, [isLoggedIn]);

  // Persist pending issue on change
  useEffect(() => {
    if (pendingIssue && isLoggedIn) {
        savePendingIssue(pendingIssue);
    }
  }, [pendingIssue, isLoggedIn]);

  useEffect(() => {
    if (activeTab === 'CONSOLE' && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, activeTab]);

  const handleLogin = async () => {
      try {
          await initiateLogin();
          setIsLoggedIn(true);
      } catch (e: any) {
          if (e?.type === 'popup_closed_by_user' || e?.error === 'popup_closed_by_user') return;
          console.error("Login Failed", e);
          alert("Could not connect to Database. Check console.");
      }
  };

  const handleExecute = async () => {
    if (!isLoggedIn) {
        await handleLogin();
        const session = await getSession();
        if (!session) return;
    }

    if (config.generateImages && window.aistudio) {
        if (!await window.aistudio.hasSelectedApiKey()) {
            try {
                await window.aistudio.openSelectKey();
            } catch (e) {
                console.error("Key selection error", e);
            }
        }
    }

    setActiveTab('CONSOLE');
    const targetList = targets.split(',').map(s => s.trim());
    
    const issue = await onRun(theme, targetList, useDemo, config, (partial) => {
        setPendingIssue(partial);
    });
    
    if (issue) {
      setPendingIssue(issue);
      setActiveTab('QUEUE');
    }
  };

  const handleStatusChange = (type: 'drop' | 'story' | 'recipe' | 'cover', id: string, newStatus: ArtifactStatus) => {
    if (!pendingIssue) return;
    const newIssue = { ...pendingIssue };

    if (type === 'drop') {
        newIssue.drops = newIssue.drops.map(d => d.id === id ? { ...d, status: newStatus } : d);
    } else if (type === 'story') {
        newIssue.features = newIssue.features.map(s => s.id === id ? { ...s, status: newStatus } : s);
        newIssue.columns = newIssue.columns.map(s => s.id === id ? { ...s, status: newStatus } : s);
    } else if (type === 'recipe') {
        newIssue.atelier = newIssue.atelier.map(r => r.id === id ? { ...r, status: newStatus } : r);
    }
    setPendingIssue(newIssue);
  };

  // --- DIRECTOR CONTROLS (v1.3 Text Editing) ---
  const handleUpdateText = (type: 'cover' | 'drop' | 'story', id: string, field: 'headline' | 'body', value: string) => {
      if (!pendingIssue) return;
      const newIssue = { ...pendingIssue };

      if (type === 'cover') {
          if (field === 'headline') newIssue.cover.title = value;
          if (field === 'body') newIssue.cover.deck = value;
      } else if (type === 'drop') {
          newIssue.drops = newIssue.drops.map(d => {
              if (d.id === id) {
                  return { ...d, [field === 'headline' ? 'headline' : 'body']: value };
              }
              return d;
          });
      } else if (type === 'story') {
          const updateStory = (s: StoryArtifact) => {
              if (s.id === id) {
                  return { ...s, [field === 'headline' ? 'headline' : 'deck']: value };
              }
              return s;
          };
          newIssue.features = newIssue.features.map(updateStory);
          newIssue.columns = newIssue.columns.map(updateStory);
      }
      setPendingIssue(newIssue);
  };

  const handleUpdatePrompt = (type: 'cover' | 'story', id: string, newPrompt: string) => {
      if (!pendingIssue) return;
      const newIssue = { ...pendingIssue };

      if (type === 'cover') {
          newIssue.cover.imgPrompt = newPrompt;
      } else if (type === 'story') {
          newIssue.features = newIssue.features.map(s => s.id === id ? { ...s, img_prompt: newPrompt } : s);
          newIssue.columns = newIssue.columns.map(s => s.id === id ? { ...s, img_prompt: newPrompt } : s);
      }
      setPendingIssue(newIssue);
  };

  const handleRegenerateImage = async (type: 'cover' | 'story', id: string, prompt: string, ratio: AspectRatio) => {
      if (window.aistudio && !await window.aistudio.hasSelectedApiKey()) {
         await window.aistudio.openSelectKey();
      }

      try {
          const base64 = await generateImage(prompt, ratio);
          
          if (!pendingIssue) return;
          const newIssue = { ...pendingIssue };

          if (type === 'cover') {
              newIssue.cover.img_base64 = base64;
          } else if (type === 'story') {
              newIssue.features = newIssue.features.map(s => s.id === id ? { ...s, img_base64: base64 } : s);
              newIssue.columns = newIssue.columns.map(s => s.id === id ? { ...s, img_base64: base64 } : s);
          }
          setPendingIssue(newIssue);
          return true;
      } catch (e) {
          console.error("Regeneration Failed", e);
          alert("Generation failed. Check console.");
          return false;
      }
  };

  const handleCommit = () => {
    if (pendingIssue) {
        onPublish(pendingIssue);
        setPendingIssue(null); // Clear pending after publish
        savePendingIssue(null);
    }
  };

  const getLogColor = (agent: string) => {
    switch(agent) {
      case 'SCOUT': return 'text-blue-400';
      case 'QUERY_ORCH': return 'text-blue-300';
      case 'ARCHIVIST': return 'text-purple-400';
      case 'BOARD': return 'text-yellow-200';
      case 'EDITOR': return 'text-yellow-500 font-bold';
      case 'HEADLINE': return 'text-pink-300';
      case 'OUTLINE': return 'text-pink-300';
      case 'WRITER': return 'text-pink-500 font-bold';
      case 'DESIGNER': return 'text-purple-300 font-bold';
      case 'ATELIER': return 'text-purple-500 font-bold underline';
      case 'REWRITER': return 'text-pink-400';
      case 'FACT_CHECK': return 'text-red-400 font-bold';
      case 'ENGINEER': return 'text-cyan-400';
      case 'QA_LEAD': return 'text-green-400';
      case 'SYS': return 'text-gray-500';
      case 'PUBLISHER': return 'text-white bg-black border border-white px-1';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] text-white font-mono z-50 flex flex-col">
      {/* Top Bar */}
      <div className="border-b border-gray-800 p-3 md:p-4 flex flex-col md:flex-row justify-between items-start md:items-center bg-black gap-4 md:gap-0">
        <div className="flex w-full md:w-auto justify-between md:justify-start items-center gap-6">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isProcessing ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></div>
            <h1 className="text-xs md:text-sm font-bold tracking-widest uppercase">Modus // Engine Core</h1>
          </div>
          
          <button onClick={onCancel} className="md:hidden text-xs text-gray-500 hover:text-white border border-gray-800 px-2 py-1 rounded">CLOSE</button>
        </div>

        {/* Mobile Nav Tabs */}
        <div className="flex w-full md:w-auto gap-1 bg-gray-900 p-1 rounded overflow-x-auto">
             <button 
                onClick={() => setActiveTab('CONFIG')} 
                className={`flex-1 md:hidden px-4 py-2 md:py-1 text-[10px] uppercase tracking-widest rounded ${activeTab === 'CONFIG' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-white'}`}
             >
                Input
             </button>
             <button 
                onClick={() => setActiveTab('CONSOLE')} 
                className={`flex-1 md:flex-none px-4 py-2 md:py-1 text-[10px] uppercase tracking-widest rounded ${activeTab === 'CONSOLE' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-white'}`}
             >
                Console
             </button>
             <button 
                onClick={() => setActiveTab('DEBATE')} 
                className={`flex-1 md:flex-none px-4 py-2 md:py-1 text-[10px] uppercase tracking-widest rounded ${activeTab === 'DEBATE' ? 'bg-purple-900 text-purple-100' : 'text-gray-500 hover:text-white'}`}
             >
                Debate
             </button>
             <button 
                onClick={() => setActiveTab('QUEUE')} 
                className={`flex-1 md:flex-none px-4 py-2 md:py-1 text-[10px] uppercase tracking-widest rounded ${activeTab === 'QUEUE' ? 'bg-yellow-900 text-yellow-100' : 'text-gray-500 hover:text-white'}`}
             >
                Queue {pendingIssue && `(${countReviewItems(pendingIssue)})`}
             </button>
          </div>
          
          <button onClick={onCancel} className="hidden md:block text-xs text-gray-500 hover:text-white">[ESC]</button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Control Panel */}
        <div className={`${activeTab === 'CONFIG' ? 'flex' : 'hidden'} md:flex w-full md:w-1/3 border-r border-gray-800 p-6 bg-[#0f0f0f] flex-col gap-8 overflow-y-auto`}>
          
          {/* LOGIN STATE */}
          {!isLoggedIn && !isCheckingAuth && (
              <div className="bg-red-900/20 border border-red-900 p-4 mb-4">
                  <h4 className="text-red-400 text-xs font-bold uppercase tracking-widest mb-2">Storage Disconnected</h4>
                  <p className="text-xs text-gray-400 mb-4">You must connect to the database (Supabase) to save or publish issues.</p>
                  <button 
                    onClick={handleLogin}
                    className="w-full bg-red-600 hover:bg-red-500 text-white py-2 font-bold uppercase text-xs tracking-widest"
                  >
                    Connect to Database
                  </button>
              </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-500">00. Global Theme</label>
            <input 
              value={theme}
              onChange={e => setTheme(e.target.value)}
              disabled={isProcessing}
              className="w-full bg-black border border-gray-800 p-3 text-sm focus:border-green-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-500">01. Target Clusters (CSV)</label>
            <textarea 
              value={targets}
              onChange={e => setTargets(e.target.value)}
              disabled={isProcessing}
              className="w-full h-32 bg-black border border-gray-800 p-3 text-sm focus:border-green-500 focus:outline-none transition-colors resize-none"
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-800">
            <label className="text-[10px] uppercase tracking-widest text-gray-500">Pipeline Config</label>
            <div className="flex flex-col gap-3">
               <label className="flex items-center gap-3 cursor-pointer hover:text-green-400 transition-colors">
                 <input 
                   type="checkbox" 
                   checked={useDemo} 
                   onChange={e => setUseDemo(e.target.checked)} 
                   disabled={isProcessing}
                   className="accent-green-500"
                 />
                 <span className="text-xs">Simulation Mode (Fast/Predictable)</span>
               </label>

               <label className="flex items-center gap-3 cursor-pointer hover:text-cyan-400 transition-colors">
                 <input 
                   type="checkbox" 
                   checked={config.includeAtelier} 
                   onChange={e => setConfig(prev => ({...prev, includeAtelier: e.target.checked}))} 
                   disabled={isProcessing}
                   className="accent-cyan-500"
                 />
                 <span className="text-xs">Atelier Engine (Recipes)</span>
               </label>

               <label className="flex items-center gap-3 cursor-pointer hover:text-pink-400 transition-colors">
                 <input 
                   type="checkbox" 
                   checked={config.qualityPass} 
                   onChange={e => setConfig(prev => ({...prev, qualityPass: e.target.checked}))} 
                   disabled={isProcessing}
                   className="accent-pink-500"
                 />
                 <span className="text-xs">Quality Gate (Rewrite + Fact Check)</span>
               </label>

               <label className="flex items-center gap-3 cursor-pointer hover:text-purple-400 transition-colors">
                 <input 
                   type="checkbox" 
                   checked={config.generateImages} 
                   onChange={e => setConfig(prev => ({...prev, generateImages: e.target.checked}))} 
                   disabled={isProcessing}
                   className="accent-purple-500"
                 />
                 <span className="text-xs text-purple-200">Auto-Generate Visuals (Gemini Pro - Paid)</span>
               </label>
            </div>
          </div>

          <button 
            onClick={handleExecute}
            disabled={isProcessing || !isLoggedIn}
            className="mt-auto py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-green-500 transition-colors disabled:opacity-50 disabled:bg-gray-700"
          >
            {isProcessing ? 'Running Cycle...' : !isLoggedIn ? 'Auth Required' : 'Initialize Run'}
          </button>
        </div>

        {/* Right Panel */}
        <div className={`${activeTab !== 'CONFIG' ? 'flex' : 'hidden md:flex'} w-full md:w-2/3 bg-black flex-col`}>
           {activeTab === 'CONSOLE' ? (
               <>
                <div className="p-2 bg-gray-900 border-b border-gray-800 flex gap-4 text-[10px] uppercase tracking-widest text-gray-400">
                    <div className="flex-1 text-center">Log Stream</div>
                </div>
                
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 font-sm leading-relaxed space-y-1">
                    {logs.length === 0 && (
                    <div className="h-full flex items-center justify-center text-gray-700 italic">
                        System Idle. Awaiting trigger.
                    </div>
                    )}
                    {logs.map((log) => (
                    <div key={log.id} className="flex gap-4 hover:bg-white/5 px-2 py-1 rounded transition-colors group">
                        <span className="text-gray-600 text-[10px] w-16 shrink-0 pt-0.5">{log.timestamp}</span>
                        <span className={`text-[10px] w-24 shrink-0 font-bold uppercase ${getLogColor(log.agent)}`}>{log.agent}</span>
                        <div className="text-gray-300 group-hover:text-white transition-colors">
                        {log.message}
                        {log.data && (
                            <pre className="mt-1 text-[10px] text-gray-500 overflow-x-auto border-l border-gray-700 pl-2">
                            {JSON.stringify(log.data, null, 2)}
                            </pre>
                        )}
                        </div>
                    </div>
                    ))}
                    {isProcessing && <div className="animate-pulse text-green-500 px-2">_</div>}
                </div>
               </>
           ) : activeTab === 'DEBATE' ? (
                <div className="flex-1 flex flex-col bg-[#050505]">
                    <div className="p-4 bg-purple-900/10 border-b border-purple-900/30 flex justify-between items-center">
                        <span className="text-purple-400 text-xs font-bold uppercase tracking-widest">Debate Chamber (Live)</span>
                        <span className="text-[10px] text-gray-500 font-mono">
                            {pendingIssue?.debates?.length || 0} Active Threads
                        </span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                         {!pendingIssue?.debates || pendingIssue.debates.length === 0 ? (
                             <div className="text-center text-gray-600 pt-20">
                                 <div className="text-4xl mb-4 opacity-20">⚖️</div>
                                 <p>No active debates.</p>
                                 <p className="text-xs mt-2">Pitches will appear here as agents deliberate.</p>
                             </div>
                         ) : (
                             pendingIssue.debates.map((debate) => (
                                 <div key={debate.id} className="border border-gray-800 bg-gray-900/50 rounded-sm overflow-hidden animate-fade-in">
                                     <div className="p-4 border-b border-gray-800 bg-black flex justify-between items-center">
                                         <h3 className="text-sm font-bold text-white uppercase tracking-wider">{debate.topic}</h3>
                                         <div className="flex gap-4 text-[10px] text-gray-500">
                                             <span>Novelty: {debate.scores.novelty}/5</span>
                                             <span>Heat: {debate.scores.heat}/5</span>
                                         </div>
                                     </div>
                                     
                                     <div className="grid grid-cols-1 md:grid-cols-3 gap-1 p-1 bg-gray-800">
                                         {debate.pitches.map((pitch) => {
                                             const isWinner = debate.verdict?.selected_pitch_id === pitch.id;
                                             return (
                                                 <div key={pitch.id} className={`p-4 flex flex-col gap-3 relative ${isWinner ? 'bg-purple-900/20' : 'bg-[#0a0a0a]'}`}>
                                                     <div className="flex justify-between items-start">
                                                         <span className={`text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded ${getAgentBadgeColor(pitch.agent_role)}`}>
                                                             {pitch.agent_role}
                                                         </span>
                                                         {isWinner && (
                                                             <span className="text-[9px] uppercase font-bold tracking-widest text-green-400 border border-green-900 bg-green-900/20 px-2 py-0.5">
                                                                 Commissioned
                                                             </span>
                                                         )}
                                                     </div>
                                                     <h4 className="text-xs font-bold text-gray-200 leading-tight min-h-[3em]">"{pitch.angle}"</h4>
                                                     <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-4">{pitch.thesis_fit}</p>
                                                     
                                                     <div className="mt-auto pt-3 border-t border-gray-800 flex justify-between text-[9px] text-gray-600 uppercase">
                                                         <span>Vote: {pitch.suggested_placement}</span>
                                                         <span>Volt: {pitch.cultural_voltage}</span>
                                                     </div>
                                                 </div>
                                             );
                                         })}
                                     </div>
                                     
                                     {debate.verdict && (
                                         <div className="p-3 bg-black border-t border-gray-800 text-[10px] text-gray-400 font-mono">
                                             <span className="text-yellow-500 font-bold uppercase mr-2">Editor's Verdict:</span>
                                             {debate.verdict.reason}
                                         </div>
                                     )}
                                 </div>
                             ))
                         )}
                    </div>
                </div>
           ) : activeTab === 'QUEUE' ? (
               <div className="flex flex-col h-full">
                  <div className="p-4 bg-yellow-900/10 border-b border-yellow-900/30 flex justify-between items-center">
                      <span className="text-yellow-500 text-xs font-bold uppercase tracking-widest">Audit Required</span>
                      <button onClick={handleCommit} className="bg-yellow-600 hover:bg-yellow-500 text-black px-4 py-2 text-xs font-bold uppercase tracking-widest">
                          Publish Approved
                      </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 pb-20 md:pb-6">
                     {!pendingIssue ? (
                         <div className="text-center text-gray-600 pt-20">No pending artifacts. Run the engine first.</div>
                     ) : (
                         <>
                            <ReviewCard 
                                key="cover" 
                                type="cover"
                                title={pendingIssue.cover.title} 
                                body={pendingIssue.cover.deck} 
                                status="PUBLISHED" 
                                img={pendingIssue.cover.img_base64}
                                prompt={pendingIssue.cover.imgPrompt}
                                aspectRatio="3:4"
                                onChange={() => {}} 
                                onUpdatePrompt={(val) => handleUpdatePrompt('cover', 'cover', val)}
                                onUpdateHeadline={(val) => handleUpdateText('cover', 'cover', 'headline', val)}
                                onUpdateBody={(val) => handleUpdateText('cover', 'cover', 'body', val)}
                                onRegenerate={(p, r) => handleRegenerateImage('cover', 'cover', p, r)}
                            />

                            {pendingIssue.drops.map(d => (
                                <ReviewCard 
                                    key={d.id} 
                                    type="drop"
                                    title={d.headline} 
                                    body={d.body} 
                                    status={d.status}
                                    onChange={(s) => handleStatusChange('drop', d.id, s)}
                                    onUpdateHeadline={(val) => handleUpdateText('drop', d.id, 'headline', val)}
                                    onUpdateBody={(val) => handleUpdateText('drop', d.id, 'body', val)}
                                />
                            ))}
                            
                            {pendingIssue.features.map(f => (
                                <ReviewCard 
                                    key={f.id} 
                                    type="story"
                                    title={f.headline} 
                                    body={f.deck} 
                                    img={f.img_base64}
                                    prompt={f.img_prompt}
                                    aspectRatio="16:9"
                                    status={f.status}
                                    onChange={(s) => handleStatusChange('story', f.id, s)}
                                    onUpdatePrompt={(val) => handleUpdatePrompt('story', f.id, val)}
                                    onUpdateHeadline={(val) => handleUpdateText('story', f.id, 'headline', val)}
                                    onUpdateBody={(val) => handleUpdateText('story', f.id, 'body', val)}
                                    onRegenerate={(p, r) => handleRegenerateImage('story', f.id, p, r)}
                                />
                            ))}

                            {pendingIssue.columns.map(c => (
                                <ReviewCard 
                                    key={c.id} 
                                    type="story"
                                    title={c.headline} 
                                    body={c.deck}
                                    meta={`Persona: ${c.author_persona}`} 
                                    img={c.img_base64}
                                    prompt={c.img_prompt}
                                    aspectRatio="4:3"
                                    status={c.status}
                                    onChange={(s) => handleStatusChange('story', c.id, s)}
                                    onUpdatePrompt={(val) => handleUpdatePrompt('story', c.id, val)}
                                    onUpdateHeadline={(val) => handleUpdateText('story', c.id, 'headline', val)}
                                    onUpdateBody={(val) => handleUpdateText('story', c.id, 'body', val)}
                                    onRegenerate={(p, r) => handleRegenerateImage('story', c.id, p, r)}
                                />
                            ))}
                         </>
                     )}
                  </div>
               </div>
           ) : null}
        </div>
      </div>
    </div>
  );
};
