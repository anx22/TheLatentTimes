import React, { useContext, useState, useMemo, useEffect } from 'react';
import { NewsroomContext } from '../../contexts/NewsroomContext';
import { Radio, Zap, ChevronRight, Activity, MessageSquare, Loader2, Sparkles, Send, Scale, BookOpen, HelpCircle, Bookmark, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Signal, WorkbenchSession, StoryAngle } from '../../types';
import { NewsroomButton, NewsroomLabel, BriefingCard } from './NewsroomUI';

export const ThreeZonePipeline: React.FC = () => {
    const context = useContext(NewsroomContext);
    const [selectedSignalIds, setSelectedSignalIds] = useState<string[]>([]);
    const [workbenchContext, setWorkbenchContext] = useState('');
    const [complianceTab, setComplianceTab] = useState<'claims' | 'evidence' | 'audit'>('claims');
    
    // Auto-select signals if workbench is active
    useEffect(() => {
        if (context?.activeWorkbenchSession) {
            setSelectedSignalIds(context.activeWorkbenchSession.signals);
            if (context.activeWorkbenchSession.context && !workbenchContext) {
                setWorkbenchContext(context.activeWorkbenchSession.context);
            }
        }
    }, [context?.activeWorkbenchSession, workbenchContext]);

    // Let's filter signals with a high score (simulated) or just show recent
    const strongSignals = useMemo(() => {
        return (context?.signals || []).slice(0, 20); // Last 20 signals
    }, [context?.signals]);

    if (!context) return null;

    const { 
        activeWorkbenchSession, 
        storyAngles,
        initializeWorkbench,
        generateWorkbenchAngles,
        toggleStoryAngle,
        executeDraftFromWorkbench,
        drafts,
        setDraftId,
        setStep
    } = context;

    const toggleSignal = (id: string) => {
        if (activeWorkbenchSession && activeWorkbenchSession.status === 'processing') return;
        setSelectedSignalIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleExecuteWorkbench = () => {
        initializeWorkbench(selectedSignalIds);
    };

    const selectedCount = storyAngles.filter(a => a.selected).length;

    return (
        <div className="flex h-full bg-zinc-900">
            {/* ZONE 1: Signal Mosaic */}
            <div className="flex-[1.2] border-r border-zinc-700 flex flex-col custom-scrollbar relative">
                <div className="p-4 border-b border-zinc-700 sticky top-0 bg-zinc-900 z-10 flex justify-between items-end">
                    <div>
                        <NewsroomLabel type="header" className="text-[12px] opacity-60 mb-1 block">ZONE 1</NewsroomLabel>
                        <div className="text-[16px] font-mono font-bold text-white tracking-widest uppercase">Signal Mosaic</div>
                        <div className="text-[11px] text-zinc-400 mt-2 font-mono">Curate signals.</div>
                    </div>
                    <div className="text-[10px] font-mono text-emerald-500/50">{strongSignals.length} items</div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar border-t border-zinc-700">
                    <div className="flex flex-col divide-y divide-zinc-900/50">
                        {strongSignals.map(sig => (
                            <div 
                                key={sig._id}
                                onClick={() => toggleSignal(sig._id)}
                                className={cn(
                                    "p-3 flex items-start gap-3 transition-colors cursor-pointer group",
                                    selectedSignalIds.includes(sig._id) 
                                        ? "bg-emerald-500/10" 
                                        : "bg-transparent hover:bg-zinc-900",
                                    activeWorkbenchSession?.status === 'processing' && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                <div className={cn(
                                    "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 transition-colors",
                                    selectedSignalIds.includes(sig._id) ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-zinc-800 group-hover:bg-zinc-600"
                                )} />
                                <div className="flex-1 min-w-0">
                                    <h3 className={cn(
                                        "text-xs font-sans leading-relaxed truncate font-medium mb-1",
                                        selectedSignalIds.includes(sig._id) ? "text-white" : "text-zinc-400"
                                    )}>
                                        {sig.title}
                                    </h3>
                                    <div className="flex items-center justify-between gap-2 mt-2">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <div className="text-[8px] font-mono uppercase tracking-widest shrink-0 text-emerald-500/60 bg-emerald-500/5 px-1 border border-emerald-500/10 truncate">
                                                {sig.sourcePack || sig.sourceType || 'RSS'}
                                            </div>
                                            {sig.sourceTrustTier && (
                                                <div className={cn(
                                                    "text-[8px] font-mono uppercase px-1 border min-w-0 truncate",
                                                    sig.sourceTrustTier === 'primary' ? "text-blue-500 border-blue-500/20 bg-blue-500/5" : "text-zinc-600 border-zinc-700 bg-zinc-900"
                                                )}>
                                                    {sig.sourceTrustTier}
                                                </div>
                                            )}
                                            {sig.qualityScore !== undefined && (
                                                <div className="text-[8px] font-mono text-zinc-500 shrink-0">
                                                    Q:{sig.qualityScore}
                                                </div>
                                            )}
                                        </div>
                                        
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                context.setSeedArticle(context.seedArticle?._id === sig._id ? null : sig);
                                            }}
                                            className={cn(
                                                "text-[9px] font-mono px-2 py-0.5 border flex items-center gap-1 transition-all rounded shrink-0",
                                                context.seedArticle?._id === sig._id 
                                                    ? "bg-[#ccff00] text-black border-[#ccff00] font-bold" 
                                                    : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700"
                                            )}
                                        >
                                            <Bookmark className="w-2.5 h-2.5" />
                                            {context.seedArticle?._id === sig._id ? 'SEED NOMINEE' : 'SET SEED'}
                                        </button>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Zone 1 Footer Action */}
                <div className="p-4 border-t border-zinc-700 bg-zinc-950">
                    <NewsroomButton 
                        variant={selectedSignalIds.length > 0 ? "tactical" : "ghost"}
                        className="w-full justify-between"
                        disabled={selectedSignalIds.length === 0 || activeWorkbenchSession?.status === 'processing'}
                        onClick={handleExecuteWorkbench}
                    >
                        {activeWorkbenchSession ? 'Update Workbench Selection' : 'Send to Workbench'}
                        <ChevronRight className="w-4 h-4" />
                    </NewsroomButton>
                </div>
            </div>

            {/* ZONE 2: Semantic Workbench */}
            <div className="flex-[1.5] border-r border-zinc-700 flex flex-col custom-scrollbar relative bg-zinc-950">
                <div className="p-4 border-b border-zinc-700 sticky top-0 bg-zinc-950 z-10">
                    <NewsroomLabel type="header" className="text-[12px] opacity-60 mb-1 block">ZONE 2</NewsroomLabel>
                    <div className="text-[16px] font-mono font-bold text-[#ccff00] tracking-widest uppercase">Semantic Workbench</div>
                    <div className="text-[11px] text-zinc-400 mt-2 font-mono">Deconstruct signals to distinct angles.</div>
                </div>
                
                {activeWorkbenchSession ? (
                    <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                        {/* Legal Compliance & Seed Controller */}
                        <div className="p-6 border-b border-zinc-800 bg-zinc-900/40">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Scale className="w-5 h-5 text-yellow-500" />
                                    <span className="text-xs font-mono font-bold text-white uppercase tracking-widest">UrhG Compliance Center</span>
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <span className="text-[10px] font-mono text-zinc-400">Legal Shield</span>
                                    <input 
                                        type="checkbox" 
                                        checked={context.isLegalGuardrailsEnabled}
                                        onChange={e => context.setIsLegalGuardrailsEnabled(e.target.checked)}
                                        className="rounded border-zinc-700 bg-black text-[#ccff00] focus:ring-0 w-3.5 h-3.5"
                                    />
                                </label>
                            </div>

                            {context.seedArticle ? (
                                <div className="space-y-3">
                                    {/* Selected Seed article banner */}
                                    <div className="bg-black border border-zinc-805 p-3 rounded">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <div className="flex items-center gap-1.5 text-[9px] font-mono text-zinc-500 uppercase">
                                                <BookOpen className="w-3 h-3 text-[#ccff00]" />
                                                Active Seed (Leitartikel)
                                            </div>
                                            <button 
                                                onClick={() => context.setSeedArticle(null)}
                                                className="text-[9px] text-red-500/70 hover:text-red-400 font-mono"
                                            >
                                                [Clear]
                                            </button>
                                        </div>
                                        <div className="text-xs font-medium text-white truncate">{context.seedArticle.title}</div>
                                        <div className="text-[10px] font-mono text-zinc-500 mt-1">
                                            Publisher: <span className="text-zinc-300">{context.seedArticle.sourcePack || context.seedArticle.sourceType || 'RSS'}</span>
                                        </div>
                                    </div>

                                    {context.isLegalGuardrailsEnabled && (
                                        <div className="border border-zinc-800 rounded bg-black/50 overflow-hidden">
                                            {/* Sub-Tabs for Compliance Tasks */}
                                            <div className="flex border-b border-zinc-800 bg-zinc-950 text-[10px] font-mono">
                                                <button
                                                    onClick={() => setComplianceTab('claims')}
                                                    className={cn(
                                                        "flex-1 py-2 text-center border-r border-zinc-800 transition-colors",
                                                        complianceTab === 'claims' ? "bg-zinc-900 text-[#ccff00]" : "text-zinc-500 hover:text-zinc-300"
                                                    )}
                                                >
                                                    1. Atomic Facts ({context.extractedClaims.length})
                                                </button>
                                                <button
                                                    onClick={() => setComplianceTab('evidence')}
                                                    className={cn(
                                                        "flex-1 py-2 text-center border-r border-zinc-800 transition-colors",
                                                        complianceTab === 'evidence' ? "bg-zinc-900 text-[#ccff00]" : "text-zinc-500 hover:text-zinc-300"
                                                    )}
                                                >
                                                    2. Evidence Pack
                                                </button>
                                                <button
                                                    onClick={() => setComplianceTab('audit')}
                                                    className={cn(
                                                        "flex-1 py-2 text-center transition-colors",
                                                        complianceTab === 'audit' ? "bg-zinc-900 text-[#ccff00]" : "text-zinc-500 hover:text-zinc-300"
                                                    )}
                                                >
                                                    3. Legal Audit
                                                </button>
                                            </div>

                                            {/* Tab 1: Extracted Claims */}
                                            {complianceTab === 'claims' && (
                                                <div className="p-3 space-y-3">
                                                    <div className="text-[10px] text-zinc-500 leading-relaxed font-sans">
                                                        Deconstructs intellectual framing into dry, factual vectors (UrhG-compliant).
                                                    </div>
                                                    
                                                    {context.extractedClaims.length > 0 ? (
                                                        <div className="max-h-[140px] overflow-y-auto custom-scrollbar space-y-2 pr-1">
                                                            {context.extractedClaims.map((claim, idx) => (
                                                                <div key={idx} className="bg-zinc-950 p-2 border border-zinc-900 text-[11px] font-mono">
                                                                    <div className="flex items-center justify-between gap-1 mb-1 text-[9px]">
                                                                        <span className="text-zinc-500 uppercase">CLAIM #{idx + 1}</span>
                                                                        <span className={cn(
                                                                            "px-1 rounded-sm uppercase tracking-wide text-[8px]",
                                                                            claim.claimType === 'funding' ? "bg-emerald-500/10 text-emerald-400" :
                                                                            claim.claimType === 'launch' ? "bg-blue-500/10 text-blue-400" :
                                                                            "bg-zinc-800 text-zinc-400"
                                                                        )}>
                                                                            {claim.claimType}
                                                                        </span>
                                                                    </div>
                                                                    <div className="text-zinc-200 leading-normal font-sans text-xs">{claim.claimText}</div>
                                                                    <div className="text-[8px] text-zinc-650 mt-1 flex justify-between">
                                                                        <span>Entities: {claim.entities.join(', ') || 'none'}</span>
                                                                        <span>Confidence: {claim.confidence}%</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="text-zinc-600 text-[11px] font-mono italic p-2 text-center">No claims extracted yet.</div>
                                                    )}

                                                    <NewsroomButton
                                                        variant="ghost"
                                                        className="w-full text-[10px] h-7"
                                                        onClick={() => context.extractClaimsFromSeed()}
                                                        disabled={context.isExtractingClaims}
                                                        icon={context.isExtractingClaims ? Loader2 : RefreshCw}
                                                        loading={context.isExtractingClaims}
                                                    >
                                                        {context.extractedClaims.length > 0 ? 'Re-extract Atomic Claims' : 'Extract Atomic Claims'}
                                                    </NewsroomButton>
                                                </div>
                                            )}

                                            {/* Tab 2: Evidence Pack */}
                                            {complianceTab === 'evidence' && (
                                                <div className="p-3 space-y-3">
                                                    <div className="text-[10px] text-zinc-500 leading-relaxed font-sans">
                                                        Crawls live signals to find independent confirmations, avoiding single-source copyright traps.
                                                    </div>

                                                    {context.evidencePack ? (
                                                        <div className="space-y-3">
                                                            <div className="bg-zinc-950 p-2.5 border border-zinc-900 text-xs font-sans text-zinc-300 leading-relaxed max-h-[120px] overflow-y-auto custom-scrollbar">
                                                                {context.evidencePack.synthesizedEvidence}
                                                            </div>
                                                            {context.evidencePack.sources.length > 0 && (
                                                                <div className="space-y-1">
                                                                    <div className="text-[9px] font-mono text-zinc-500 uppercase">Independent References:</div>
                                                                    <div className="max-h-[80px] overflow-y-auto custom-scrollbar space-y-1">
                                                                        {context.evidencePack.sources.map((src, i) => (
                                                                            <a 
                                                                                key={i} 
                                                                                href={src.url} 
                                                                                target="_blank" 
                                                                                rel="noreferrer" 
                                                                                className="block text-[10px] text-emerald-400 hover:underline truncate"
                                                                            >
                                                                                🔗 {src.title || src.url}
                                                                            </a>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="text-zinc-600 text-[11px] font-mono italic p-2 text-center">No independent evidence compiled yet.</div>
                                                    )}

                                                    <NewsroomButton
                                                        variant="ghost"
                                                        className="w-full text-[10px] h-7"
                                                        onClick={() => context.gatherIndependentEvidence()}
                                                        disabled={context.isResearching || context.extractedClaims.length === 0}
                                                        icon={context.isResearching ? Loader2 : RefreshCw}
                                                        loading={context.isResearching}
                                                    >
                                                        Synthesize Evidence Pack
                                                    </NewsroomButton>
                                                </div>
                                            )}

                                            {/* Tab 3: Legal Audit */}
                                            {complianceTab === 'audit' && (
                                                <div className="p-3 space-y-3">
                                                    <div className="text-[10px] text-zinc-500 leading-relaxed font-sans">
                                                        Audits current active draft copy likeness against original seed structure.
                                                    </div>

                                                    {context.similarityReport ? (
                                                        <div className="space-y-3 font-mono">
                                                            <div className="flex items-center justify-between bg-zinc-950 p-2 border border-zinc-900 rounded">
                                                                <span className="text-[11px] text-zinc-400">Copyright Safety Margin:</span>
                                                                <div className="flex items-center gap-1.5">
                                                                    <div className={cn(
                                                                        "h-2 w-2 rounded-full",
                                                                        context.similarityReport.score >= 70 ? "bg-emerald-500 animate-pulse" : "bg-red-500 bg-red-400"
                                                                    )} />
                                                                    <span className={cn(
                                                                        "text-xs font-bold",
                                                                        context.similarityReport.score >= 70 ? "text-emerald-400" : "text-red-400"
                                                                    )}>
                                                                        {context.similarityReport.score}% Clean
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="text-xs text-zinc-300 leading-relaxed bg-zinc-950 p-2.5 border border-zinc-900 rounded font-sans">
                                                                <div className="text-zinc-500 text-[9px] font-mono uppercase mb-1">Audit Counsel Recommendation:</div>
                                                                {context.similarityReport.recommendation}
                                                            </div>

                                                            {context.similarityReport.literalOverlapBlocks.length > 0 && (
                                                                <div className="space-y-1">
                                                                    <div className="text-[9px] text-red-500 font-mono uppercase">Flagged structures:</div>
                                                                    {context.similarityReport.literalOverlapBlocks.map((blk, idx) => (
                                                                        <div key={idx} className="text-[9px] bg-red-950/20 text-red-200 p-1 border border-red-500/10 truncate font-mono">
                                                                            "{blk}"
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="text-zinc-650 text-[11px] font-mono italic p-2 text-center">No similarity evaluation run yet. Runs automatically on drafting.</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="border border-dashed border-zinc-800 p-4 text-center rounded bg-black/20">
                                    <HelpCircle className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                                    <div className="text-[11px] font-mono text-zinc-400">No Lead Seed Customization</div>
                                    <p className="text-[10px] text-zinc-500 max-w-xs mx-auto mt-2 leading-relaxed">
                                        Germans UrhG laws restrict rewriting TechCrunch inputs. Recommend nominating a "Lead Seed" article in Zone 1 to activate atomic claims extraction & independent validation layers.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-b border-zinc-700">
                            <NewsroomLabel type="header" className="text-[10px] mb-2">Editorial Directive (Optional)</NewsroomLabel>
                            <textarea 
                                value={workbenchContext}
                                onChange={e => setWorkbenchContext(e.target.value)}
                                placeholder="E.g. Focus exclusively on the financial implications..."
                                className="w-full bg-black border border-zinc-600 p-3 text-sm text-emerald-400 font-mono focus:border-emerald-500/50 outline-none min-h-[80px]"
                            />
                            <NewsroomButton 
                                variant="tactical" 
                                className="mt-4 w-full"
                                onClick={() => generateWorkbenchAngles(workbenchContext)}
                                disabled={activeWorkbenchSession.status === 'processing'}
                                icon={activeWorkbenchSession.status === 'processing' ? Loader2 : Sparkles}
                                loading={activeWorkbenchSession.status === 'processing'}
                            >
                                Generate Narrative Angles
                            </NewsroomButton>
                        </div>

                        <div className="p-6 flex-1">
                            <NewsroomLabel type="header" className="text-[10px] mb-4">Generated Angles</NewsroomLabel>
                            <div className="space-y-4">
                                {storyAngles.length === 0 && activeWorkbenchSession.status !== 'processing' ? (
                                    <div className="text-zinc-600 text-xs font-mono italic">No angles generated yet. Click generate above.</div>
                                ) : null}
                                
                                {storyAngles.map(angle => (
                                    <div 
                                        key={angle._id}
                                        onClick={() => toggleStoryAngle(angle._id, !angle.selected)}
                                        className={cn(
                                            "p-4 border cursor-pointer transition-all",
                                            angle.selected ? "border-[#ccff00] bg-[#ccff00]/5" : "border-zinc-600 bg-black hover:border-zinc-700"
                                        )}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className={cn("font-bold text-sm", angle.selected ? "text-[#ccff00]" : "text-white")}>{angle.title}</h4>
                                            {angle.selected && <div className="w-2 h-2 rounded-full bg-[#ccff00] mt-1 shrink-0" />}
                                        </div>
                                        <p className="text-xs text-zinc-400 leading-relaxed font-sans">{angle.summary}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {storyAngles.length > 0 && (
                            <div className="p-4 border-t border-zinc-700 bg-zinc-950 sticky bottom-0">
                                <NewsroomButton 
                                    variant="tactical"
                                    className="w-full justify-between disabled:opacity-50"
                                    disabled={selectedCount === 0 || activeWorkbenchSession.status === 'processing'}
                                    onClick={executeDraftFromWorkbench}
                                    icon={Send}
                                >
                                    Draft Selected Angles ({selectedCount})
                                    <ChevronRight className="w-4 h-4" />
                                </NewsroomButton>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="p-8 flex flex-col items-center justify-center flex-1 text-center opacity-70">
                        <Activity className="w-12 h-12 text-zinc-600 mb-4" />
                        <div className="text-[12px] font-mono text-zinc-400 uppercase tracking-widest">Workbench Idle</div>
                        <div className="text-[11px] text-zinc-500 mt-2 max-w-xs leading-relaxed">
                            Select signals from Zone 1 to initialize a semantic session here.
                        </div>
                    </div>
                )}
            </div>

            {/* ZONE 3: Editorial Press */}
            <div className="flex-[1] flex flex-col custom-scrollbar relative bg-zinc-950">
                <div className="p-4 border-b border-zinc-700 sticky top-0 bg-zinc-950 z-10">
                    <NewsroomLabel type="header" className="text-[12px] opacity-60 mb-1 block">ZONE 3</NewsroomLabel>
                    <div className="text-[16px] font-mono font-bold text-white tracking-widest uppercase">Editorial Press</div>
                    <div className="text-[11px] text-zinc-400 mt-2 font-mono">Final drafts and handover.</div>
                </div>
                <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-4">
                    {drafts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center opacity-70 mt-10">
                            <MessageSquare className="w-12 h-12 text-zinc-600 mb-4" />
                            <div className="text-[12px] font-mono text-zinc-400 uppercase tracking-widest">Press is Waiting</div>
                        </div>
                    ) : (
                        drafts.map(d => (
                            <BriefingCard 
                                key={d._id} 
                                draft={d} 
                                onSelect={() => {
                                    setDraftId(d._id);
                                    setStep('EDITORIAL_BOARD');
                                }} 
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
