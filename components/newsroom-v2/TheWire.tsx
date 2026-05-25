import React, { useContext, useState, useMemo } from 'react';
import { Loader2, Zap, Cpu, Terminal as TerminalIcon, Scan, Sparkles, Activity, Layers, Globe, Radio, TrendingUp, ChevronRight, Info, FileText } from 'lucide-react';
import { NewsroomContext } from '../../contexts/NewsroomContext';
import { NewsroomButton, NewsroomPanel, NewsroomLabel, SignalCard, MagazineSignalCard, BriefingCard } from './NewsroomUI';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const TheWire: React.FC = () => {
  const context = useContext(NewsroomContext);
  const [localTopic, setLocalTopic] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'GITHUB' | 'RSS' | 'API'>('ALL');
  const [viewMode, setViewMode] = useState<'MAGAZINE' | 'DISRUPTION' | 'LIST'>('MAGAZINE');
  const [showBriefings, setShowBriefings] = useState(false);
  const [showNeuralInfo, setShowNeuralInfo] = useState(false);

  const mainstreamPillars = useMemo(() => {
    if (!context) return [];
    return (context.newsClusters || []).sort((a, b) => (b.articleCount || 0) - (a.articleCount || 0));
  }, [context?.newsClusters]);

  const filteredItems = useMemo(() => {
    if (!context) return [];
    const signals = context.signals || [];
    let base = signals;
    if (activeFilter === 'GITHUB') base = signals.filter(i => (i.sourceType || '').toUpperCase() === 'GITHUB' || (i.source || '').toLowerCase().includes('github'));
    if (activeFilter === 'RSS') base = signals.filter(i => (i.sourceType || '').toUpperCase() === 'RSS' || (i.source || '').toLowerCase().match(/rss|hacker|blog/));
    if (activeFilter === 'API') base = signals.filter(i => (i.sourceType || '').toUpperCase() === 'API' || i.source === 'SEARCH');
    return base;
  }, [context?.signals, activeFilter]);

  const selectedStory = useMemo(() => {
    if (!context) return null;
    const { signals = [], selectedStoryId } = context;
    if (!selectedStoryId) return null;
    return signals.find(i => i.storyId === selectedStoryId || i._id === selectedStoryId) || 
           mainstreamPillars.find(p => p._id === selectedStoryId);
  }, [context?.signals, mainstreamPillars, context?.selectedStoryId]);

  const uniqueDrafts = useMemo(() => {
    if (!context || !context.drafts) return [];
    const seen = new Set();
    return context.drafts.filter(d => {
      const duplicate = seen.has(d.headline);
      seen.add(d.headline);
      return !duplicate;
    });
  }, [context?.drafts]);

  if (!context) return null;

  const { 
    signals, 
    ingestSignals, 
    isIngesting,
    setTopic,
    researchTopic,
    isResearching,
    scoutTopic,
    isScouting,
    setSelectedStoryId,
    selectedStoryId,
    synthesizeCluster,
    runDeepDiscovery,
    drafts,
    setDraftId,
    setStep,
    activeConsensus
  } = context;

  const handleResearch = () => {
    if (!localTopic) return;
    setTopic(localTopic);
    setSelectedStoryId(null);
    researchTopic(localTopic);
  };

  const handleApplyTopic = (t: string, storyId?: string) => {
    setLocalTopic(t);
    setTopic(t);
    if (storyId) setSelectedStoryId(storyId);
  };

  const handleSelectBriefing = (id: any) => {
    setDraftId(id);
    setStep('EDITORIAL_BOARD');
  };

  return (
    <NewsroomPanel side="center" className="flex flex-col bg-[#050505]">
      {/* 1. STATEFUL STRATEGIC HEADER */}
      <div className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-30">
        <div className="h-24 flex items-center px-8 gap-10">
          <div className="flex items-center gap-4 min-w-[240px]">
            <div className="w-10 h-10 rounded-sm bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Radio className={cn("w-5 h-5 text-emerald-500", (isIngesting || isScouting) && "animate-pulse")} />
            </div>
            <div>
              <NewsroomLabel type="header" className="text-[12px] opacity-40 mb-1 block">SIGNAL FEED</NewsroomLabel>
              <div className="text-[16px] font-mono font-bold text-white tracking-widest uppercase">Live Ingestion</div>
            </div>
          </div>

          <div className="h-10 w-px bg-white/5"></div>

          <div className="flex-1 relative group">
            <TerminalIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/30 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search news or enter focus topic..."
              className="w-full bg-white/5 border border-white/5 rounded-sm py-5 pl-12 pr-4 text-[18px] font-mono tracking-tighter focus:outline-none focus:border-emerald-500/30 transition-all placeholder:text-zinc-700 text-emerald-400"
              value={localTopic}
              onChange={(e) => setLocalTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleResearch()}
            />
            <button 
              onClick={() => setShowNeuralInfo(!showNeuralInfo)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500/20 hover:text-emerald-500 transition-colors"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-4">
            <NewsroomButton 
              variant="tactical"
              onClick={handleResearch}
              disabled={isResearching || !localTopic}
              icon={isResearching ? Loader2 : Scan}
              loading={isResearching}
              className="h-16 px-10 border-emerald-500/20"
            >
              Analyze Topic
            </NewsroomButton>
          </div>
        </div>

        {/* Deep Dive Briefing Output */}
        <AnimatePresence>
          {context.context && !isResearching && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-zinc-900 border-t border-zinc-800 px-12 py-6 overflow-hidden"
            >
              <NewsroomLabel type="header" className="text-zinc-500 tracking-[0.2em] mb-2 uppercase text-[11px] flex items-center gap-2">
                <FileText className="w-3 h-3" />
                Deep-Dive Briefing Compiled
              </NewsroomLabel>
              <div className="prose prose-invert prose-emerald max-w-4xl text-[14px]">
                {context.context.split('\n').map((para, i) => (
                  <p key={i} className="text-zinc-400 font-serif leading-relaxed mb-4">{para}</p>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Neural Search Details */}
        <AnimatePresence>
          {showNeuralInfo && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-emerald-500/5 border-t border-emerald-500/10 px-12 py-6 overflow-hidden"
            >
              <div className="max-w-4xl space-y-4">
                <div className="flex items-center gap-2 text-emerald-500">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-[12px] font-mono font-black uppercase tracking-[0.3em]">Neural Search Architecture</span>
                </div>
                <p className="text-zinc-400 font-mono text-[11px] leading-relaxed">
                  Unlike traditional keyword search, LATENT TIMES utilizes <span className="text-emerald-400">Semantic Retrieval</span> to interrogate the signal pool. 
                  "Neural Search" refers to the AI-driven interrogation process that understands the conceptual intent of your query to find relevant data points. 
                  <br /><br />
                  <span className="text-white/40 italic">Note: This retrieval step is distinct from the <strong>Semantic Clustering</strong> layer, which performs post-ingestion synthesis to group related signals into the Narrative Pillars visible in the sidebar.</span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Editorial Directives */}
        <AnimatePresence>
          {activeConsensus && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-emerald-500/5 border-t border-emerald-500/10 px-8 py-3 flex gap-6 items-center overflow-hidden"
            >
              <div className="flex items-center gap-2 shrink-0">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] font-mono text-emerald-500/60 uppercase tracking-widest">Global Signal</span>
              </div>
              <div className="text-[13px] font-medium text-emerald-400 tracking-tight flex-1 line-clamp-1 normal-case italic">
                {activeConsensus}
              </div>
              <div className="flex gap-4 shrink-0">
                 <button 
                  onClick={() => handleApplyTopic(activeConsensus.slice(0, 80))}
                  className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-sm text-[10px] font-bold text-emerald-500 hover:bg-emerald-500 hover:text-black transition-all uppercase tracking-widest"
                 >
                   Apply Signal
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* 2. MAINSTREAM PILLAR RAIL (LEFT) - The Big Movements */}
        <div className="w-80 border-r border-white/5 flex flex-col bg-black/20">
          <div className="h-12 flex items-center px-6 justify-between border-b border-white/5">
            <NewsroomLabel type="header" className="text-[11px] opacity-50 tracking-[0.3em]">TOPIC CLUSTERS</NewsroomLabel>
            <TrendingUp className="w-3 h-3 text-[#ccff00]/50" />
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
            {mainstreamPillars.length === 0 && (
              <div className="p-6 text-center border border-white/5 bg-black/20 m-2 mt-4 rounded-sm">
                <Layers className="w-6 h-6 text-emerald-500/30 mx-auto mb-3" />
                <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest leading-relaxed">No clusters configured.</p>
                <p className="text-[10px] font-mono text-zinc-600 mt-2 leading-relaxed">Use 'Cluster Related Topics' in Intelligence Ops to identify narrative pillars.</p>
              </div>
            )}
            {mainstreamPillars.map((cluster) => (
              <motion.div
                key={cluster._id}
                whileHover={{ x: 4 }}
                onClick={() => setSelectedStoryId(cluster._id === selectedStoryId ? null : cluster._id)}
                className={cn(
                  "p-5 border cursor-pointer transition-all flex flex-col gap-2 group relative overflow-hidden",
                  selectedStoryId === cluster._id 
                    ? "bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.05)]" 
                    : "bg-white/[0.02] border-white/5 hover:border-white/20"
                )}
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono text-emerald-500 px-1.5 py-0.5 bg-emerald-500/10 rounded-xs uppercase tracking-tighter">
                    {cluster.articleCount || 0} SIGNALS
                  </span>
                  <div className="text-[10px] text-zinc-600 font-mono tracking-widest leading-none">[{cluster.status?.toUpperCase() || 'EMERGING'}]</div>
                </div>
                <h4 className={cn(
                  "text-[15px] font-bold leading-tight transition-colors break-words tracking-tighter",
                  selectedStoryId === cluster._id ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"
                )}>
                  {cluster.title}
                </h4>
                <p className="text-[10px] font-mono text-zinc-600 line-clamp-2 leading-relaxed tracking-tight">
                   {cluster.summary || "Synthesizing shared semantic context across constituent signals..."}
                </p>

                {cluster.keyEntities && cluster.keyEntities.length > 0 && (
                   <div className="flex flex-wrap gap-1 mt-1">
                      {cluster.keyEntities.slice(0, 3).map((e: string) => (
                        <span key={e} className="text-[8px] font-mono text-emerald-500/40 uppercase tracking-tighter shrink-0">
                          #{e.replace(/\s+/g, '')}
                        </span>
                      ))}
                   </div>
                )}

                {selectedStoryId === cluster._id && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t border-emerald-500/20 flex gap-4"
                  >
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleApplyTopic(cluster.title, cluster._id); }}
                      className="text-[10px] font-mono text-emerald-400 hover:text-white uppercase transition-colors"
                    >
                      [ Analyze ]
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); synthesizeCluster(cluster._id); }}
                      className="text-[10px] font-mono text-zinc-600 hover:text-emerald-400 uppercase transition-colors"
                    >
                      [ Update ]
                    </button>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* 3. CENTER MOSAIC */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="h-14 border-b border-white/5 flex items-center justify-between px-8 bg-black/60 backdrop-blur-md">
            <div className="flex items-center gap-12">
              <div className="flex items-center gap-3">
                <div className={cn("w-2 h-2 rounded-full", isIngesting ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-zinc-800")}></div>
                <NewsroomLabel type="header" className="text-[10px] tracking-[0.2em] font-black text-white/50 uppercase">ACTIVE WIRE</NewsroomLabel>
              </div>
              
              <div className="flex items-center h-full">
                {(['ALL', 'GITHUB', 'RSS', 'API'] as const).map(f => (
                  <button 
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={cn(
                      "px-4 text-[10px] font-mono font-bold uppercase tracking-widest transition-all h-14 flex items-center border-b-2",
                      activeFilter === f ? 'text-emerald-500 border-emerald-500 bg-emerald-500/5' : 'text-zinc-600 border-transparent hover:text-zinc-400'
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-sm">
              <button 
                onClick={() => setShowBriefings(!showBriefings)}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 rounded-xs transition-all text-[11px] font-bold uppercase tracking-widest border",
                  showBriefings
                    ? "bg-[#ccff00] text-black border-[#ccff00]" 
                    : "text-[#ccff00] hover:bg-[#ccff00]/10 border-[#ccff00]/20"
                )}
               >
                 <FileText className="w-3.5 h-3.5" />
                 <span>{showBriefings ? 'Back to Wire' : 'Briefing Vault'}</span>
               </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-12 scrollbar-hide relative bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:60px_60px]">
             {selectedStory && !showBriefings && (
               <motion.div 
                 initial={{ opacity: 0, y: -20 }} 
                 animate={{ opacity: 1, y: 0 }}
                 className="mb-12 p-8 bg-emerald-500/5 border border-emerald-500/20 rounded-sm relative overflow-hidden backdrop-blur-xl group"
               >
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                    <Layers className="w-32 h-32" />
                  </div>
                  <div className="flex items-center gap-3 mb-4 text-emerald-500/60">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    <span className="text-[11px] font-mono uppercase tracking-[0.4em] font-black text-emerald-500">Editorial Focus Pillar</span>
                  </div>
                  <h2 className="text-3xl font-black text-white mb-4 tracking-tighter leading-none italic max-w-3xl">{selectedStory.title}</h2>
                  <p className="text-zinc-400 font-mono text-[13px] leading-relaxed max-w-2xl mb-8 tracking-tight">
                    {selectedStory.summary || "Synthesizing multi-vector signals into a unified editorial narrative..."}
                  </p>
                  <div className="flex gap-6">
                    <NewsroomButton 
                      variant="primary" 
                      onClick={() => handleApplyTopic(selectedStory.title, selectedStory._id)}
                      className="bg-emerald-500 text-black hover:bg-white font-black px-8 py-4 h-auto text-[12px]"
                    >
                      SYNTHESIZE PILLAR
                    </NewsroomButton>
                    <button 
                      onClick={() => setSelectedStoryId(null)}
                      className="text-[11px] font-mono text-zinc-600 hover:text-white uppercase tracking-[0.3em] transition-colors flex items-center gap-2"
                    >
                      [ Release Signal ] <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
               </motion.div>
            )}

            <AnimatePresence mode="popLayout">
              {showBriefings ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
                  <div className="flex items-center justify-between">
                    <NewsroomLabel type="header" className="text-xl text-white">BRIEFING VAULT</NewsroomLabel>
                    <button onClick={() => setShowBriefings(false)} className="text-xs font-mono text-zinc-500 hover:text-emerald-500 uppercase tracking-widest">[ Close Archive ]</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {uniqueDrafts.map((d) => (
                      <BriefingCard 
                        key={d._id} 
                        draft={d} 
                        onSelect={handleSelectBriefing} 
                      />
                    ))}
                    {uniqueDrafts.length === 0 && (
                      <div className="col-span-full py-20 text-center border border-white/5 bg-black/40">
                        <FileText className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                        <div className="text-zinc-500 font-mono uppercase tracking-widest text-[11px]">No briefings archived yet.</div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredItems.filter(i => !selectedStoryId || i.storyId === selectedStoryId).map((item, idx) => (
                    <MagazineSignalCard
                      key={item._id}
                      item={item}
                      onSelect={(t, id) => {
                        handleApplyTopic(t, id);
                        setStep('EDITORIAL_BOARD'); // Draft Story button -> Send to writer
                      }}
                      onAnalyze={(t, id) => {
                        setLocalTopic(t);
                        setTopic(t);
                        setSelectedStoryId(id || null);
                        researchTopic(t);
                      }}
                      featured={idx === 0 || idx === 7}
                    />
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 4. MISSION TERMINAL (RIGHT) - Active Control */}
        <div className="w-80 bg-[#0a0a0a] border-l border-white/5 flex flex-col">
          <div className="h-12 border-b border-white/5 flex items-center px-6">
            <NewsroomLabel type="header" className="text-[11px] opacity-50 tracking-[0.3em]">INTELLIGENCE OPS</NewsroomLabel>
          </div>
          
          <div className="p-6 flex flex-col gap-8 flex-1">
            <div className="space-y-4">
              <NewsroomButton 
                variant="tactical"
                onClick={() => ingestSignals()}
                disabled={isIngesting}
                icon={Zap}
                className="w-full h-16 bg-emerald-500/5 hover:text-emerald-400 hover:bg-emerald-500/10 border-emerald-500/20 text-emerald-500 mb-2"
              >
                Scan Global Channels
              </NewsroomButton>
              <NewsroomButton 
                variant="ghost"
                onClick={() => runDeepDiscovery()}
                disabled={isIngesting || isScouting}
                icon={Layers}
                className="w-full h-12 text-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-500/5 border-emerald-500/10 shadow-none"
              >
                Cluster Related Topics
              </NewsroomButton>
            </div>

            <div className="mt-auto space-y-6">
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase">Clustering Index</div>
                  <div className="text-[10px] font-mono text-emerald-500">OPTIMIZED</div>
                </div>
                <div className="flex gap-1 h-8 items-end">
                  {(signals || []).slice(0, 15).map((item, i) => (
                    <div key={i} className={cn("flex-1", (item.innovation_score || 0) > 70 ? "bg-emerald-500" : "bg-emerald-500/20")} style={{ height: `${Math.max(10, (item.innovation_score || 50))}%` }}></div>
                  ))}
                </div>
              </div>
              
              <div className="text-[11px] font-mono text-zinc-600 uppercase tracking-widest leading-relaxed">
                Raw technical signals are normalized via Gemini Embeddings and clustered by semantic resonance.
              </div>
            </div>
          </div>
        </div>
      </div>
    </NewsroomPanel>
  );
};
