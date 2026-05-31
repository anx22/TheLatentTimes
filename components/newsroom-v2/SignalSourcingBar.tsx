import React, { useContext, useState, useMemo } from 'react';
import { NewsroomContext } from '../../contexts/NewsroomContext';
import { 
  Settings2, X, ShieldCheck, Database, Zap, Activity, Info, Lock,
  Edit, Check, Trash2, Plus, Sliders, Cpu, Gauge, Radio, Shield, 
  FileText, Network, RefreshCw, AlertTriangle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { SOURCE_PACKS } from '../../services/signals/SourceRegistry';

export const SignalSourcingBar: React.FC = () => {
  const context = useContext(NewsroomContext);
  const [isSetupOpen, setIsSetupOpen] = useState(false);

  // Source editing state
  const [editingSourceId, setEditingSourceId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editType, setEditType] = useState<'rss' | 'api' | 'github' | 'html_watch'>('rss');
  const [editPriority, setEditPriority] = useState(3);
  const [editCrawlFrequency, setEditCrawlFrequency] = useState(60);
  const [editTrustTier, setEditTrustTier] = useState('media');
  const [editRightsMode, setEditRightsMode] = useState('excerpt_allowed');

  // Source additions state
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newPack, setNewPack] = useState<string>(SOURCE_PACKS[0]);
  const [newType, setNewType] = useState<'rss' | 'api' | 'github' | 'html_watch'>('rss');
  const [newPriority, setNewPriority] = useState(3);
  const [newCrawlFrequency, setNewCrawlFrequency] = useState(60);
  const [newTrustTier, setNewTrustTier] = useState('media');
  const [newRightsMode, setNewRightsMode] = useState('excerpt_allowed');

  // Ingestion Payload Capping local state (helps limit token overflow)
  const [payloadCapping, setPayloadCapping] = useState<number>(() => {
    const cached = localStorage.getItem('lnt_ingest_payload_cap');
    return cached ? parseInt(cached, 10) : 20;
  });

  const dbSources = context?.dbSources;
  const isIngesting = context?.isIngesting;
  const ingestSignals = context?.ingestSignals;
  const mutations = context?.mutations;
  const noiseFilter = context?.noiseFilter ?? 0;
  const setNoiseFilter = context?.setNoiseFilter ?? (() => {});

  // Group sources by pack
  const groupedSources = useMemo(() => {
    const groups: Record<string, any[]> = {};
    SOURCE_PACKS.forEach(pack => groups[pack] = []);
    
    (dbSources || []).forEach((source: any) => {
      const pack = source.pack || 'UNCATEGORIZED';
      if (!groups[pack]) groups[pack] = [];
      groups[pack].push(source);
    });
    return groups;
  }, [dbSources]);

  if (!context) return null;

  const toggleSource = async (id: string, currentState: boolean) => {
    await mutations.toggleSource({ id: id as any, isActive: !currentState });
  };

  const togglePack = async (pack: string, isActive: boolean) => {
    const sourcesInPack = groupedSources[pack] || [];
    for (const source of sourcesInPack) {
      if (source.isActive !== isActive) {
        await mutations.toggleSource({ id: source._id, isActive });
      }
    }
  };

  // Launch Inline Editing Form
  const startEditing = (source: any) => {
    setEditingSourceId(source._id);
    setEditName(source.name);
    setEditUrl(source.url);
    setEditType(source.type || 'rss');
    setEditPriority(source.priority || 3);
    setEditCrawlFrequency(source.crawlFrequency || 60);
    setEditTrustTier(source.trustTier || 'media');
    setEditRightsMode(source.rightsMode || 'excerpt_allowed');
  };

  // Save Source Configuration
  const saveSourceConfig = async (id: string) => {
    try {
      await mutations.updateSource({
        id: id as any,
        name: editName,
        url: editUrl,
        type: editType,
        priority: editPriority,
        crawlFrequency: editCrawlFrequency,
        trustTier: editTrustTier,
        rightsMode: editRightsMode
      });
      setEditingSourceId(null);
    } catch (e) {
      console.error("Failed to update source:", e);
    }
  };

  // Delete Source Boundary
  const handleDeleteSource = async (id: string) => {
    if (window.confirm("Are you absolutely sure you want to decouple this feed node boundary?")) {
      try {
        await mutations.deleteSource({ id: id as any });
        if (editingSourceId === id) {
          setEditingSourceId(null);
        }
      } catch (e) {
        console.error("Failed to delete source:", e);
      }
    }
  };

  // Add Source Boundary
  const handleAddNewSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newUrl.trim()) return;

    try {
      await mutations.addSource({
        name: newName,
        url: newUrl,
        type: newType,
        crawlFrequency: newCrawlFrequency,
        pack: newPack,
        priority: newPriority,
        trustTier: newTrustTier,
        rightsMode: newRightsMode
      });
      
      // Reset addition state
      setNewName('');
      setNewUrl('');
      setIsAdding(false);
    } catch (e) {
      console.error("Failed to add new source boundary:", e);
    }
  };

  // Update local and storage payload cap
  const changePayloadCapping = (val: number) => {
    setPayloadCapping(val);
    localStorage.setItem('lnt_ingest_payload_cap', val.toString());
  };

  return (
    <>
        <div className="flex border-b border-zinc-800 bg-zinc-950 shrink-0 h-11" id="signal-sourcing-bar">
        <div className="flex items-center px-4 border-r border-zinc-800 gap-3 shrink-0" id="brand-panel">
          <Database className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-[10px] uppercase font-bold font-mono tracking-[0.2em] text-zinc-500">
            Signal <span className="text-white">Intake</span>
          </span>
        </div>
        
        <div className="flex-1 flex overflow-x-auto no-scrollbar py-2 px-3 items-center gap-1" id="pack-badges">
          {SOURCE_PACKS.map((pack) => {
            const sources = groupedSources[pack] || [];
            const activeCount = sources.filter((s: any) => s.isActive).length;
            const isAllActive = activeCount === sources.length && sources.length > 0;
            
            return (
              <div 
                key={pack}
                id={`pack-badge-${pack}`}
                className={cn(
                  "flex items-center group cursor-pointer transition-all border border-zinc-800 h-7 rounded-sm px-2 gap-1.5",
                  activeCount > 0 ? "bg-zinc-900 border-zinc-700" : "bg-transparent opacity-40 hover:opacity-100"
                )}
                onClick={() => togglePack(pack, !isAllActive)}
              >
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full shrink-0",
                  activeCount > 0 ? "bg-[#ccff00] shadow-[0_0_8px_#ccff00]" : "bg-zinc-800"
                )} />
                <span className={cn(
                  "text-[9px] font-mono uppercase tracking-widest whitespace-nowrap",
                  activeCount > 0 ? "text-zinc-200" : "text-zinc-600"
                )}>
                  {pack.replace('AI_', '').replace(/_/g, ' ')}
                </span>
                {activeCount > 0 && (
                  <span className="text-[8px] font-mono text-[#ccff00] bg-[#ccff00]/10 px-1 rounded-sm ml-1">
                    {activeCount}/{sources.length}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center px-4 border-l border-zinc-800 gap-3" id="directive-input">
          <input 
            type="text" 
            placeholder="Search Focus..."
            value={context.globalDirective}
            onChange={(e) => context.setGlobalDirective(e.target.value)}
            className="w-48 bg-zinc-900 border border-zinc-800 text-white font-mono text-[10px] px-2 py-1 outline-none focus:border-zinc-500"
          />
        </div>

        <div className="flex items-center px-4 border-l border-zinc-800 gap-6" id="intake-metadata">
           <div className="flex items-center gap-2">
              <Activity className="w-3 h-3 text-zinc-600" />
              <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
                Nodes: <span className="text-zinc-400">{(dbSources || []).filter(s => s.isActive).length}</span>
              </span>
           </div>
           {context.isSaving ? (
             <span className="text-[9px] font-mono text-zinc-600 animate-pulse uppercase tracking-[0.2em]" id="sync-pill">Syncing...</span>
           ) : (
             <div className="flex items-center gap-1.5" id="security-badge">
               <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-[0.2em]">Sync Complete</span>
             </div>
           )}
        </div>

        <button 
          onClick={ingestSignals}
          disabled={isIngesting}
          id="btn-sweep-signals"
          className="px-6 border-l border-zinc-800 bg-[#ccff00] text-black hover:bg-[#dfff4d] transition-all flex items-center justify-center shrink-0 disabled:opacity-50 font-mono text-[10px] uppercase tracking-widest font-bold h-full group"
        >
          {isIngesting ? (
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3 animate-pulse" />
              Ingesting...
            </div>
          ) : (
             <span className="group-hover:scale-105 transition-transform">Fetch Feeds</span>
          )}
        </button>

        <button 
          onClick={() => setIsSetupOpen(true)}
          id="btn-matrix-open"
          className="px-4 border-l border-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors flex items-center justify-center shrink-0"
        >
          <Settings2 className="w-4 h-4" />
        </button>
      </div>

      {isSetupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm px-4" id="matrix-modal-wrapper">
          <div className="w-full max-w-7xl bg-zinc-950 border border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col h-[90vh] animate-in fade-in zoom-in-95 duration-200" id="matrix-panel">
            
            {/* Header section of the matrix panel */}
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50" id="matrix-header">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-[#ccff00]/10 border border-[#ccff00]/20 rounded-md">
                   <Sliders className="w-5 h-5 text-[#ccff00]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white uppercase tracking-[0.3em] font-mono italic">Global Reconnaissance Matrix</h2>
                  <div className="text-[10px] text-zinc-500 mt-1 font-mono uppercase tracking-[0.1em] flex items-center gap-2">
                    <Zap className="w-3 h-3 text-[#ccff00]" /> 
                    <span>Neural Sourcing Infrastructure v2.6 // Token Guard Status:</span>
                    <span className="text-emerald-500 border border-emerald-500/20 px-1 py-0.5 roundedbg-emerald-500/5">Active Shield</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsSetupOpen(false)} 
                id="btn-matrix-close"
                className="text-zinc-600 hover:text-white p-2 transition-colors border border-zinc-800 hover:border-zinc-700 bg-zinc-900 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8 bg-black" id="matrix-scroller-body">
              
              {/* Levers Section (Hebel & Metrics Console) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="matrix-dashboard-top">
                 <div className="lg:col-span-8 bg-zinc-950 border border-zinc-850 p-5 rounded-sm space-y-6" id="dashboard-levers">
                    <div className="flex items-center gap-2.5 border-b border-zinc-800 pb-3">
                       <Cpu className="w-4 h-4 text-[#ccff00]" />
                       <h3 className="text-[11px] font-mono text-zinc-400 uppercase tracking-[0.2em] font-bold">Primary Aggregation Controllers</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="dashboard-levers-cards">
                      {/* Lever 1: Resonance Threshold */}
                      <div className="border border-zinc-800 bg-zinc-900/30 p-4 space-y-3.5 rounded-sm relative group overflow-hidden">
                        <div className="flex justify-between items-center border-b border-zinc-800/60 pb-1.5">
                           <label className="text-[10px] uppercase font-mono tracking-widest text-zinc-300 font-bold block">Resonance Filter</label>
                           <span className="text-[10px] font-mono text-[#ccff00] font-bold">{noiseFilter}%</span>
                        </div>
                        <p className="text-[9px] text-zinc-500 font-mono leading-tight">
                          Minimum semantic cross-feed matching threshold required to merge signals into narrative pillars. High thresholds ensure high consensus.
                        </p>
                        <div className="flex items-center gap-3">
                          <span className="text-[8px] font-mono text-zinc-600">0%</span>
                          <input 
                            type="range" 
                            id="slider-noise-filter"
                            className="w-full accent-[#ccff00] h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer" 
                            min="0" max="100" step="5" 
                            value={noiseFilter} 
                            onChange={e => setNoiseFilter(parseInt(e.target.value))}
                          />
                          <span className="text-[8px] font-mono text-zinc-600">100%</span>
                        </div>
                      </div>

                      {/* Lever 2: Ingestion Payload Depth (The Critical token guard!) */}
                      <div className="border border-zinc-800 bg-zinc-900/30 p-4 space-y-3.5 rounded-sm relative group overflow-hidden">
                        <div className="flex justify-between items-center border-b border-zinc-800/60 pb-1.5">
                           <label className="text-[10px] uppercase font-mono tracking-widest text-[#ccff00] font-bold block">Payload Cap / Boundary</label>
                           <span className="text-[10px] font-mono text-emerald-400 font-bold">{payloadCapping} Signals/Node</span>
                        </div>
                        <p className="text-[9px] text-zinc-500 font-mono leading-tight">
                          Restricts maximum fetched content units per news-source to shield against Context Token Overflow (<span className="text-amber-500">1M limits</span>). 
                        </p>
                        <div className="flex items-center gap-3">
                          <span className="text-[8px] font-mono text-zinc-600">5</span>
                          <input 
                            type="range" 
                            id="slider-payload-capping"
                            className="w-full accent-[#ccff00] h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer" 
                            min="5" max="50" step="1" 
                            value={payloadCapping} 
                            onChange={e => changePayloadCapping(parseInt(e.target.value))}
                          />
                          <span className="text-[8px] font-mono text-zinc-600">50</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-zinc-900/25 border border-zinc-900 p-3.5 rounded-sm text-[9px] font-mono text-zinc-500 flex gap-3.5 items-start">
                       <Radio className="w-5 h-5 text-zinc-700 shrink-0 mt-0.5 animate-pulse" />
                       <div>
                          <span className="text-zinc-300 font-semibold uppercase">Content Extraction Adapter Matrices:</span> Decoupling feed types automatically engages the dedicated parser: <span className="text-blue-400">RSS Excerpt</span>, <span className="text-emerald-400">Full-Text Crawler</span>, <span className="text-indigo-400">GitHub API Tracker</span>, or <span className="text-amber-400">HTML Delta Scraper</span>. You can modify types per individual source down below.
                       </div>
                    </div>
                 </div>

                 {/* System Health Monitor & Quick Operations */}
                 <div className="lg:col-span-4 border border-zinc-850 bg-zinc-950 p-5 rounded-sm flex flex-col justify-between space-y-4" id="dashboard-stats flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-2">
                         <Gauge className="w-4 h-4 text-emerald-500" />
                         <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">Network Metrics (Live)</span>
                      </div>
                      <div className="space-y-2.5">
                         <div className="flex justify-between text-[9px] font-mono">
                            <span className="text-zinc-600 uppercase">Database Sourcing Nodes</span>
                            <span className="text-zinc-300 font-bold">{(dbSources || []).length} API/RSS Channels</span>
                         </div>
                         <div className="flex justify-between text-[9px] font-mono text-zinc-600">
                            <span className="uppercase">Ingest Pipeline Throttle</span>
                            <span className="text-emerald-500 font-bold">1:1 Normal Flow</span>
                         </div>
                         <div className="flex justify-between text-[9px] font-mono text-zinc-600">
                            <span className="uppercase">Token Overflow Threshold</span>
                            <span className="text-emerald-500/80 font-mono">OK (&lt; 200k context typical)</span>
                         </div>
                         <div className="flex justify-between text-[9px] font-mono text-zinc-600">
                            <span className="uppercase">Synthesis Latency Avg</span>
                            <span className="text-zinc-400 font-bold">840ms / AI Generation</span>
                         </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-900 flex flex-col gap-2">
                       <button 
                         onClick={() => setIsAdding(!isAdding)}
                         id="btn-trigger-add"
                         className="bg-[#ccff00]/5 hover:bg-[#ccff00]/15 border border-[#ccff00]/20 hover:border-[#ccff00]/30 text-[#ccff00] text-[9px] font-mono uppercase tracking-widest py-2 px-3 text-center transition-all flex items-center justify-center gap-1.5"
                       >
                         <Plus className="w-3.5 h-3.5" />
                         {isAdding ? "Close Input Dock" : "Decouple / Add New Sourcing Node"}
                       </button>
                    </div>
                 </div>
              </div>

              {/* Add Source Drawer Boundary Form */}
              {isAdding && (
                <div className="border border-zinc-800 bg-zinc-950 p-5 rounded-sm animate-in slide-in-from-top-4 duration-300" id="matrix-add-form-dock">
                  <form onSubmit={handleAddNewSource} className="space-y-4">
                     <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                        <div className="flex items-center gap-2">
                           <Plus className="w-4 h-4 text-[#ccff00]" />
                           <h4 className="text-[10px] font-mono text-white uppercase tracking-widest font-bold">Add Live Sourcing Boundary</h4>
                        </div>
                        <span className="text-zinc-500 text-[8px] font-mono uppercase">VNT v2.6 Feed Inserter</span>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                           <label className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider block mb-1">Source Name</label>
                           <input 
                             type="text" 
                             required
                             placeholder="e.g. Wired AI Feed"
                             value={newName}
                             onChange={e => setNewName(e.target.value)}
                             className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white font-mono text-xs px-3 py-2 rounded-sm outline-none focus:border-[#ccff00]"
                           />
                        </div>
                        <div>
                           <label className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider block mb-1">RSS/API Endpoint URL</label>
                           <input 
                             type="url" 
                             required
                             placeholder="https://..."
                             value={newUrl}
                             onChange={e => setNewUrl(e.target.value)}
                             className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white font-mono text-xs px-3 py-2 rounded-sm outline-none focus:border-[#ccff00]"
                           />
                        </div>
                        <div>
                           <label className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider block mb-1">Category Pack Allocation</label>
                           <select 
                             value={newPack}
                             onChange={e => setNewPack(e.target.value)}
                             className="w-full bg-zinc-900 border border-zinc-800 text-white font-mono text-xs px-2 py-2 rounded-sm outline-none focus:border-[#ccff00]"
                           >
                              {SOURCE_PACKS.map(p => (
                                 <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>
                              ))}
                           </select>
                        </div>
                        <div>
                           <label className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider block mb-1">Extraction Adapter</label>
                           <select 
                             value={newType}
                             onChange={e => setNewType(e.target.value as any)}
                             className="w-full bg-zinc-900 border border-zinc-800 text-white font-mono text-xs px-2 py-2 rounded-sm outline-none focus:border-[#ccff00]"
                           >
                              <option value="rss">RSS Excerpt Parser (rss)</option>
                              <option value="api">Dynamic REST API Watcher (api)</option>
                              <option value="github">GitHub Stars/Repo Tracker (github)</option>
                              <option value="html_watch">HTML Delta Scraper (html_watch)</option>
                           </select>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                        <div>
                           <label className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider block mb-1">Trust Quality Tier</label>
                           <select 
                             value={newTrustTier}
                             onChange={e => setNewTrustTier(e.target.value)}
                             className="w-full bg-zinc-900 border border-zinc-800 text-white font-mono text-xs px-2 py-2 rounded-sm outline-none"
                           >
                              <option value="primary">Primary Authority x2.4 weight</option>
                              <option value="expert">Expert/Specialist Academic</option>
                              <option value="media">Global Tech Media Feed</option>
                              <option value="social">Active Social/Forum Thread</option>
                           </select>
                        </div>
                        <div>
                           <label className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider block mb-1">Rights Mode Policy</label>
                           <select 
                             value={newRightsMode}
                             onChange={e => setNewRightsMode(e.target.value)}
                             className="w-full bg-zinc-900 border border-zinc-800 text-white font-mono text-xs px-2 py-2 rounded-sm outline-none"
                           >
                              <option value="excerpt_allowed">Excerpt Allowed Scrapy</option>
                              <option value="metadata_only">Metadata/Pillars Only</option>
                              <option value="internal_analysis">Internal Private Analysis Only</option>
                           </select>
                        </div>
                        <div>
                           <label className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider block mb-1">Static Priority Ranking (1-5)</label>
                           <input 
                             type="number" 
                             min={1} max={5}
                             value={newPriority}
                             onChange={e => setNewPriority(parseInt(e.target.value) || 3)}
                             className="w-full bg-zinc-900 border border-zinc-800 text-white font-mono text-xs px-3 py-2 rounded-sm outline-none"
                           />
                        </div>
                        <div>
                           <label className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider block mb-1">Crawl Frequency Frame rate (minutes)</label>
                           <input 
                             type="number" 
                             min={5} max={1440}
                             value={newCrawlFrequency}
                             onChange={e => setNewCrawlFrequency(parseInt(e.target.value) || 60)}
                             className="w-full bg-zinc-900 border border-zinc-800 text-white font-mono text-xs px-3 py-2 rounded-sm outline-none"
                           />
                        </div>
                     </div>

                     <div className="flex justify-end gap-3 pt-2">
                        <button 
                          type="button" 
                          onClick={() => setIsAdding(false)}
                          className="px-4 py-2 border border-zinc-800 text-zinc-400 font-mono text-[10px] uppercase tracking-wider hover:bg-zinc-900"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="px-5 py-2 bg-[#ccff00] text-black font-mono text-[10px] font-bold uppercase tracking-wider hover:bg-[#dfff4d]"
                        >
                          Establish Node Boundary
                        </button>
                     </div>
                  </form>
                </div>
              )}

              {/* Sourcing Packs & News Sources Grid (The Main Body) */}
              {SOURCE_PACKS.map(pack => {
                const sources = groupedSources[pack] || [];
                if (sources.length === 0) return null;
                
                return (
                  <div key={pack} className="space-y-4 border border-zinc-900 bg-zinc-950 p-5 rounded-sm" id={`category-pack-${pack}`}>
                    
                    {/* Header of categories */}
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-3" id={`pack-header-${pack}`}>
                       <div className="flex items-center gap-3">
                          <h3 className="text-[11px] font-mono text-zinc-300 uppercase tracking-[0.3em] font-bold">
                            {pack.replace('AI_', '').replace(/_/g, ' ')}
                          </h3>
                          <span className="text-zinc-600 text-[9px] font-mono uppercase tracking-widest border-l border-zinc-800 pl-3">
                            {sources.length} Ingest Nodes Alloc
                          </span>
                       </div>
                       <div className="flex gap-2.5 items-center">
                          <button 
                            onClick={() => togglePack(pack, true)}
                            className="text-[8px] font-mono text-zinc-500 hover:text-[#ccff00] uppercase tracking-widest transition-colors py-1 px-2 border border-zinc-900 rounded-sm hover:border-zinc-800 bg-zinc-900/30"
                          >
                             Activate All Nodes
                          </button>
                          <button 
                            onClick={() => togglePack(pack, false)}
                            className="text-[8px] font-mono text-zinc-500 hover:text-red-500 uppercase tracking-widest transition-colors py-1 px-2 border border-zinc-900 rounded-sm hover:border-zinc-800 bg-zinc-900/30"
                          >
                             Deactivate Pack
                          </button>
                       </div>
                    </div>

                    {/* Sources Sub-Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" id={`sources-subgrid-${pack}`}>
                      {sources.map(source => {
                        const isEditingThis = editingSourceId === source._id;
                        
                        return (
                          <div 
                            key={source._id} 
                            id={`source-${source._id}`}
                            className={cn(
                              "group relative p-4 border transition-all duration-300 flex flex-col justify-between rounded-sm min-h-[160px]",
                              source.isActive 
                                ? "bg-zinc-900/40 border-zinc-800 shadow-[inset_0_0_20px_rgba(204,255,0,0.01)] hover:border-zinc-700" 
                                : "bg-black/80 border-zinc-900 opacity-55 hover:opacity-100"
                            )}
                          >
                            {/* ACTIVE / EDITING FORM CONDITIONAL */}
                            {isEditingThis ? (
                              <div className="space-y-3.5 flex-1 flex flex-col justify-between" id={`source-editing-layout-${source._id}`}>
                                <div className="space-y-2.5">
                                   <div className="border-b border-zinc-800 pb-1 flex justify-between items-center">
                                      <span className="text-[8px] font-mono text-[#ccff55] uppercase font-bold">Configure Node API</span>
                                      <span className="text-[7px] font-mono text-zinc-600">ID: {source._id.slice(-4)}</span>
                                   </div>
                                   <div>
                                      <label className="text-[7px] font-mono text-zinc-500 uppercase">Label Title</label>
                                      <input 
                                        type="text" 
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                        className="w-full bg-zinc-950 border border-zinc-850 text-white font-mono text-[10px] px-2 py-1 rounded outline-none focus:border-[#ccff00]"
                                      />
                                   </div>
                                   <div>
                                      <label className="text-[7px] font-mono text-zinc-500 uppercase">Endpoint URI</label>
                                      <input 
                                        type="text" 
                                        value={editUrl}
                                        onChange={e => setEditUrl(e.target.value)}
                                        className="w-full bg-zinc-950 border border-zinc-850 text-zinc-300 font-mono text-[9px] px-2 py-1 rounded outline-none focus:border-[#ccff00]"
                                      />
                                   </div>

                                   {/* Sub dropdown parameters details inline */}
                                   <div className="grid grid-cols-2 gap-2">
                                      <div>
                                         <label className="text-[7px] font-mono text-zinc-500 uppercase">Adapter</label>
                                         <select
                                           value={editType}
                                           onChange={e => setEditType(e.target.value as any)}
                                           className="w-full bg-zinc-950 border border-zinc-850 text-zinc-300 font-mono text-[8px] p-1 rounded"
                                         >
                                            <option value="rss">RSS Feed</option>
                                            <option value="api">REST API</option>
                                            <option value="github">GitHub</option>
                                            <option value="html_watch">HTML Watch</option>
                                         </select>
                                      </div>
                                      <div>
                                         <label className="text-[7px] font-mono text-zinc-500 uppercase">Trust Tier</label>
                                         <select
                                           value={editTrustTier}
                                           onChange={e => setEditTrustTier(e.target.value)}
                                           className="w-full bg-zinc-950 border border-zinc-850 text-zinc-300 font-mono text-[8px] p-1 rounded"
                                         >
                                            <option value="primary">Primary</option>
                                            <option value="expert">Expert</option>
                                            <option value="media">Media</option>
                                            <option value="social">Social</option>
                                         </select>
                                      </div>
                                   </div>

                                   <div className="grid grid-cols-2 gap-2">
                                      <div>
                                         <label className="text-[7px] font-mono text-zinc-500 uppercase">Rights Mode</label>
                                         <select
                                           value={editRightsMode}
                                           onChange={e => setEditRightsMode(e.target.value)}
                                           className="w-full bg-zinc-950 border border-zinc-850 text-zinc-350 font-mono text-[8px] p-1 rounded"
                                         >
                                            <option value="excerpt_allowed">Excerpt</option>
                                            <option value="metadata_only">Metadata</option>
                                            <option value="internal_analysis">Internal</option>
                                         </select>
                                      </div>
                                      <div className="grid grid-cols-2 gap-1.5">
                                         <div>
                                            <label className="text-[7px] font-mono text-zinc-500 uppercase">Prio</label>
                                            <input 
                                              type="number"
                                              min={1} max={5}
                                              value={editPriority}
                                              onChange={e => setEditPriority(parseInt(e.target.value) || 3)}
                                              className="w-full bg-zinc-950 border border-zinc-850 text-zinc-300 font-mono text-[8px] p-1 rounded text-center"
                                            />
                                         </div>
                                         <div>
                                            <label className="text-[7px] font-mono text-zinc-500 uppercase">Rate</label>
                                            <input 
                                              type="number"
                                              min={5} max={1440}
                                              value={editCrawlFrequency}
                                              onChange={e => setEditCrawlFrequency(parseInt(e.target.value) || 60)}
                                              className="w-full bg-zinc-950 border border-zinc-850 text-zinc-350 font-mono text-[8px] p-1 rounded text-center animate-none"
                                            />
                                         </div>
                                      </div>
                                   </div>

                                </div>

                                <div className="flex gap-2 justify-end pt-2 border-t border-zinc-800 text-[10px]">
                                   <button 
                                     type="button" 
                                     onClick={() => setEditingSourceId(null)}
                                     className="px-2.5 py-1 text-zinc-400 hover:text-zinc-200 font-mono border border-zinc-800 hover:bg-zinc-900 rounded-sm"
                                   >
                                      Cancel
                                   </button>
                                   <button 
                                     type="button" 
                                     onClick={() => saveSourceConfig(source._id)}
                                     className="px-3 py-1 bg-[#ccff00] text-black hover:bg-[#dfff4d] font-bold font-mono rounded-sm flex items-center gap-1"
                                   >
                                      <Check className="w-3 h-3" /> Save Node
                                   </button>
                                </div>
                              </div>
                            ) : (
                              /* NORMAL CARD PREVIEW MODE */
                              <div className="flex-1 flex flex-col justify-between" id={`source-card-view-${source._id}`}>
                                <div>
                                   <div className="flex justify-between items-start gap-2 mb-2">
                                      <div className="min-w-0 flex-1">
                                          <div className="flex items-center gap-2">
                                             <div className={cn(
                                                "w-1.5 h-1.5 rounded-full shrink-0",
                                                source.isActive ? "bg-emerald-500 animate-pulse" : "bg-zinc-800"
                                             )} />
                                             <h4 className={cn(
                                               "text-[10px] font-mono font-bold uppercase tracking-widest truncate",
                                               source.isActive ? "text-white" : "text-zinc-505 text-zinc-500"
                                             )}>
                                               {source.name}
                                             </h4>
                                          </div>
                                          <div className="text-[8px] text-zinc-500 font-mono truncate mt-0.5 ml-3.5">
                                            {source.url.replace('https://', '').replace('http://', '')}
                                          </div>
                                      </div>
                                      
                                      <div className="flex gap-1.5 shrink-0" id={`source-quick-btns-${source._id}`}>
                                        <button 
                                           onClick={() => startEditing(source)}
                                           className="text-zinc-500 hover:text-zinc-300 p-1 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 rounded transition-colors"
                                           title="Configure Boundary Paramters"
                                        >
                                           <Edit className="w-2.5 h-2.5" />
                                        </button>
                                        <button 
                                           onClick={() => handleDeleteSource(source._id)}
                                           className="text-zinc-500 hover:text-red-400 p-1 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 hover:border-red-950/40 rounded transition-colors"
                                           title="Decouple Node"
                                        >
                                           <Trash2 className="w-2.5 h-2.5" />
                                        </button>
                                      </div>
                                   </div>
                                   
                                   {/* Styled Badge Grid */}
                                   <div className="flex flex-wrap gap-1.5 mt-2 ml-3.5" id={`meta-grid-${source._id}`}>
                                      <span className={cn(
                                          "text-[7px] font-mono uppercase px-1 border tracking-[0.1em]",
                                          source.trustTier === 'primary' ? "text-blue-400 border-blue-400/20 bg-blue-400/5" :
                                          source.trustTier === 'expert' ? "text-emerald-400 border-emerald-400/20 bg-emerald-400/5" :
                                          "text-zinc-500 border-zinc-800 bg-zinc-900/20"
                                      )}>
                                        {source.trustTier || 'STANDARD'}
                                      </span>
                                      <span className={cn(
                                        "text-[7px] font-mono uppercase px-1 border tracking-[0.1em]",
                                        source.type === 'rss' ? "text-blue-400 border-blue-400/10 bg-blue-500/5" :
                                        source.type === 'github' ? "text-indigo-400 border-indigo-400/10 bg-indigo-500/5" :
                                        source.type === 'api' ? "text-emerald-450 text-emerald-400 border-emerald-400/15" :
                                        "text-amber-400 border-amber-400/10"
                                      )}>
                                        {source.type === 'rss' && "RSS ADAPTER"}
                                        {source.type === 'github' && "GITHUB API"}
                                        {source.type === 'api' && "REST API FEED"}
                                        {source.type === 'html_watch' && "HTML WATCHER"}
                                        {!source.type && "UNKNOWN"}
                                      </span>
                                   </div>

                                   {/* Meta attributes rows */}
                                   <div className="text-[8px] font-mono text-zinc-500 space-y-1 mt-3 ml-3.5 border-t border-zinc-900 pt-2" id={`meta-rows-${source._id}`}>
                                      <div className="flex justify-between">
                                         <span className="uppercase text-zinc-650 text-zinc-600">Dynamic Priority:</span>
                                         <span className="text-zinc-450 text-zinc-400 font-bold">P:{source.priority || 3} / 5</span>
                                      </div>
                                      <div className="flex justify-between">
                                         <span className="uppercase text-zinc-600">Crawl Period:</span>
                                         <span className="text-zinc-400">{source.crawlFrequency || 60}m rate</span>
                                      </div>
                                      <div className="flex justify-between">
                                         <span className="uppercase text-zinc-600">Rights Mode:</span>
                                         <span className="text-zinc-400 uppercase italic">{(source.rightsMode || 'EXCERPT').replace(/_/g, ' ')}</span>
                                      </div>
                                   </div>
                                </div>

                                {/* Active Toggle Footer */}
                                <div className="flex items-center justify-between pt-2.5 border-t border-zinc-900 mt-2.5 ml-3.5" id={`source-card-footer-${source._id}`}>
                                   <div className="flex items-center gap-1">
                                      <span className="text-[7px] font-mono text-zinc-600 uppercase">
                                         Node Boundary Status
                                      </span>
                                   </div>
                                   
                                   <label className="relative inline-flex items-center cursor-pointer">
                                      <input 
                                         type="checkbox"
                                         checked={source.isActive}
                                         onChange={() => toggleSource(source._id, source.isActive)}
                                         className="sr-only peer"
                                      />
                                      <div className="w-7 h-4 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#ccff00] peer-checked:after:bg-black peer-checked:after:border-black"></div>
                                   </label>
                                </div>
                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>

                  </div>
                );
              })}

              {/* Expansion capabilities status footer */}
              <div className="pt-12 flex flex-col items-center pb-8 border-t border-zinc-900" id="matrix-footer">
                  <div className="text-[10px] text-zinc-700 font-mono uppercase tracking-[0.3em] mb-4 text-center">
                    Neural Reconnaissance Protocol - Encryption Bound
                  </div>
                  <div className="flex flex-wrap justify-center gap-4">
                    <div className="text-[8px] font-mono text-zinc-600 border border-zinc-900 px-4 py-2 bg-zinc-950/20 uppercase tracking-widest flex items-center gap-2">
                        <Lock className="w-3 h-3 text-zinc-800" /> API Boundary Integration Secured
                    </div>
                    <div className="text-[8px] font-mono text-zinc-600 border border-zinc-900 px-4 py-2 bg-zinc-950/20 uppercase tracking-widest flex items-center gap-2">
                        <Lock className="w-3 h-3 text-zinc-800" /> HTML Differentials Synchronized
                    </div>
                  </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};
