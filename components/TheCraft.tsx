
import React, { useState } from 'react';
import { StoryArtifact } from '../types';

interface TheCraftProps {
  story: StoryArtifact;
}

const VIEW_MODES = ['DRAFT', 'REWRITE', 'DIFF'] as const;
type ViewMode = typeof VIEW_MODES[number];

const HeadlineCard: React.FC<{ 
    candidate: string; 
    isSelected: boolean; 
    log?: any; 
}> = ({ candidate, isSelected, log }) => {
    return (
        <div className={`p-4 border rounded-sm transition-all duration-300 ${isSelected ? 'bg-neutral-900 border-accent shadow-[0_0_15px_rgba(208,0,0,0.1)] relative z-10' : 'border-neutral-800 bg-[#0A0A0A] opacity-60 hover:opacity-100 hover:border-neutral-600'}`}>
            <h4 className={`font-display text-xl mb-2 leading-tight ${isSelected ? 'text-white' : 'text-neutral-400'}`}>{candidate}</h4>
            
            {isSelected && log && (
                <div className="mt-3 pt-3 border-t border-neutral-800 flex gap-4">
                     <div className="flex gap-2 items-center">
                         <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider">Risk</span>
                         <span className="font-mono text-[10px] text-red-400 font-bold">{log.risk_score}/10</span>
                     </div>
                     <div className="flex gap-2 items-center">
                         <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider">Volt</span>
                         <span className="font-mono text-[10px] text-accent font-bold">{log.cultural_voltage_score}/10</span>
                     </div>
                </div>
            )}
        </div>
    );
};

export const TheCraft: React.FC<TheCraftProps> = ({ story }) => {
    const [viewMode, setViewMode] = useState<ViewMode>('DIFF');
    
    // Separate hover and selection states for robust interaction
    const [hoveredCritiqueId, setHoveredCritiqueId] = useState<number | null>(null);
    const [selectedCritiqueId, setSelectedCritiqueId] = useState<number | null>(null);
    
    // Headline Data
    const candidates = story.headline_candidates;
    const selectedHeadline = story.headline;
    const log = story.headline_log;

    // Rewrite Data
    const draftParagraphs = story.rewrite_chain?.draft.text || ["No draft available."];
    const rewriteParagraphs = story.rewrite_chain?.rewrite.text || ["No rewrite available."];
    const critique = story.rewrite_chain?.rewrite.critique;
    const structuredCritique = story.rewrite_chain?.rewrite.structured_critique;
    const hasRewriteChain = !!story.rewrite_chain;

    // Determine active indices based on priority: Hover > Selected
    const activeCritiqueId = hoveredCritiqueId !== null ? hoveredCritiqueId : selectedCritiqueId;
    
    const activeIndices = activeCritiqueId !== null && structuredCritique 
        ? structuredCritique[activeCritiqueId].paragraph_indices 
        : [];

    const hasActiveHighlight = activeIndices.length > 0;

    const renderParagraphs = (paragraphs: string[], highlights: number[] = [], highlightColor = 'bg-accent/10') => {
        return paragraphs.map((p, i) => {
            const isHighlighted = highlights.includes(i);
            const isDimmed = hasActiveHighlight && !isHighlighted;
            
            return (
                <p 
                    key={i} 
                    className={`mb-6 transition-all duration-300 rounded px-4 -mx-4 border-l-2 ${
                        isHighlighted 
                            ? `${highlightColor} border-accent text-white shadow-[0_4px_20px_rgba(0,0,0,0.3)] z-10 relative scale-[1.01]` 
                            : isDimmed
                                ? 'border-transparent text-neutral-600 blur-[0.5px]'
                                : 'border-transparent text-neutral-300'
                    }`}
                >
                    {p}
                </p>
            );
        });
    };

    return (
        <div className="flex h-full bg-[#050505] text-white overflow-hidden">
            
            {/* COLUMN 1: HEADLINE FORGE (Fixed 360px) */}
            <div className="w-[360px] bg-[#080808] border-r border-neutral-800 flex flex-col shrink-0">
                <div className="p-4 border-b border-neutral-800 bg-black/40">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Headline Forge</span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">
                    {/* Selected (Winner) */}
                    <div>
                        <span className="block text-[10px] uppercase tracking-widest text-accent mb-3 font-bold">Selected Artifact</span>
                        <HeadlineCard candidate={selectedHeadline} isSelected={true} log={log} />
                    </div>

                    {/* Candidates */}
                    {candidates && (
                        <>
                            <div>
                                <span className="block text-[10px] uppercase tracking-widest text-neutral-600 mb-3 font-bold">Vogue Verdicts</span>
                                <div className="space-y-3">
                                    {candidates.vogue_verdict.filter(c => c !== selectedHeadline).map((c, i) => (
                                        <HeadlineCard key={i} candidate={c} isSelected={false} />
                                    ))}
                                </div>
                            </div>
                            <div>
                                <span className="block text-[10px] uppercase tracking-widest text-neutral-600 mb-3 font-bold">New Yorker Wit</span>
                                <div className="space-y-3">
                                    {candidates.new_yorker_wit.filter(c => c !== selectedHeadline).map((c, i) => (
                                        <HeadlineCard key={i} candidate={c} isSelected={false} />
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* COLUMN 2: COMPARE BAY (Flexible) */}
            <div className="flex-1 flex flex-col bg-[#050505] min-w-[500px]">
                <div className="p-4 border-b border-neutral-800 bg-black/20 flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Draft Inspector</span>
                    {hasRewriteChain ? (
                        <div className="flex gap-1 bg-neutral-900/80 p-0.5 rounded border border-neutral-800">
                            {VIEW_MODES.map(m => (
                                <button 
                                    key={m}
                                    onClick={() => setViewMode(m)}
                                    className={`px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-colors ${viewMode === m ? 'bg-neutral-100 text-black' : 'text-neutral-500 hover:text-white'}`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <span className="text-[10px] text-neutral-600">No Chain</span>
                    )}
                </div>

                <div className="flex-1 overflow-hidden relative">
                    <div className="h-full overflow-y-auto custom-scrollbar p-10 pb-56">
                         {hasRewriteChain ? (
                             <>
                                {viewMode === 'DIFF' ? (
                                    <div className="grid grid-cols-2 gap-12">
                                        <div className="opacity-60 hover:opacity-100 transition-opacity">
                                            <div className="flex justify-between border-b border-red-900/30 pb-3 mb-6">
                                                <span className="text-[10px] uppercase tracking-widest text-red-500 font-bold">Draft v1 (Initial)</span>
                                            </div>
                                            <div className="font-serif text-base leading-loose text-neutral-400 whitespace-pre-wrap">
                                                {renderParagraphs(draftParagraphs)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between border-b border-emerald-900/30 pb-3 mb-6">
                                                <span className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold">Rewrite v2 (Final)</span>
                                            </div>
                                            <div className="font-serif text-base leading-loose text-white whitespace-pre-wrap">
                                                {renderParagraphs(rewriteParagraphs, activeIndices)}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="max-w-4xl mx-auto">
                                        <div className="font-serif text-xl leading-loose text-white whitespace-pre-wrap">
                                            {viewMode === 'DRAFT' 
                                                ? renderParagraphs(draftParagraphs)
                                                : renderParagraphs(rewriteParagraphs, activeIndices)
                                            }
                                        </div>
                                    </div>
                                )}
                             </>
                         ) : (
                             <div className="flex flex-col items-center justify-center h-64 text-neutral-600">
                                 <p className="text-sm font-mono">No rewrite chain data available.</p>
                             </div>
                         )}
                    </div>

                    {/* CRITIQUE FOOTER */}
                    {hasRewriteChain && (
                        <div className="absolute bottom-0 left-0 right-0 bg-[#080808] border-t border-neutral-800 p-6 shadow-2xl max-h-[240px] overflow-y-auto custom-scrollbar z-20">
                            {structuredCritique && structuredCritique.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <span className="block text-[10px] uppercase tracking-widest text-accent font-bold">Senior Editor Critique</span>
                                        <span className="text-[10px] text-neutral-500 font-medium">(Hover to locate, Click to lock)</span>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {structuredCritique.map((point, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedCritiqueId(selectedCritiqueId === idx ? null : idx)}
                                                onMouseEnter={() => setHoveredCritiqueId(idx)}
                                                onMouseLeave={() => setHoveredCritiqueId(null)}
                                                className={`text-xs px-4 py-2.5 rounded border transition-all text-left font-mono leading-tight max-w-[500px] truncate ${
                                                    activeCritiqueId === idx 
                                                    ? 'bg-accent/10 text-accent border-accent shadow-[0_0_10px_rgba(208,0,0,0.2)]' 
                                                    : selectedCritiqueId !== null && selectedCritiqueId !== idx
                                                        ? 'bg-neutral-900/20 text-neutral-600 border-neutral-800'
                                                        : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-600 hover:text-white'
                                                }`}
                                                title={point.point}
                                            >
                                                <span className="font-bold mr-2 text-neutral-500">{idx + 1}.</span>
                                                {point.point}
                                            </button>
                                        ))}
                                    </div>
                                    {critique && (
                                        <div className="mt-5 pt-4 border-t border-neutral-900">
                                            <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest block mb-2">General Notes</span>
                                            <p className="text-xs text-neutral-400 italic leading-relaxed max-w-4xl">{critique}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // Fallback to general critique
                                <div className="flex gap-8">
                                    <div className="w-1/4 shrink-0">
                                        <span className="block text-[10px] uppercase tracking-widest text-accent mb-2 font-bold">Senior Editor Critique</span>
                                        <span className="text-xs text-neutral-500 font-mono">Automated QA Pass</span>
                                    </div>
                                    <p className="text-sm text-neutral-300 leading-relaxed font-mono pl-6 border-l border-neutral-800">
                                        "{critique}"
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};
