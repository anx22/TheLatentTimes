
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
        <div className={`p-3 border rounded-sm transition-all duration-300 ${isSelected ? 'bg-neutral-900 border-accent shadow-[0_0_15px_rgba(208,0,0,0.1)] relative z-10' : 'border-neutral-800 bg-[#0A0A0A] opacity-60 hover:opacity-100 hover:border-neutral-600'}`}>
            <h4 className={`font-display text-lg mb-1 leading-tight ${isSelected ? 'text-white' : 'text-neutral-400'}`}>{candidate}</h4>
            
            {isSelected && log && (
                <div className="mt-2 pt-2 border-t border-neutral-800 flex gap-4">
                     <div className="flex gap-1 items-center">
                         <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-wider">Risk</span>
                         <span className="font-mono text-[9px] text-red-400">{log.risk_score}</span>
                     </div>
                     <div className="flex gap-1 items-center">
                         <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-wider">Volt</span>
                         <span className="font-mono text-[9px] text-accent">{log.cultural_voltage_score}</span>
                     </div>
                </div>
            )}
        </div>
    );
};

export const TheCraft: React.FC<TheCraftProps> = ({ story }) => {
    const [viewMode, setViewMode] = useState<ViewMode>('DIFF');
    const [activeCritiqueId, setActiveCritiqueId] = useState<number | null>(null);
    
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

    const activeIndices = activeCritiqueId !== null && structuredCritique 
        ? structuredCritique[activeCritiqueId].paragraph_indices 
        : [];

    const renderParagraphs = (paragraphs: string[], highlights: number[] = [], highlightColor = 'bg-accent/20') => {
        return paragraphs.map((p, i) => (
            <p 
                key={i} 
                className={`mb-4 transition-all duration-300 rounded px-1 -mx-1 border-l-2 ${
                    highlights.includes(i) 
                        ? `${highlightColor} border-accent text-white shadow-sm` 
                        : 'border-transparent'
                }`}
            >
                {p}
            </p>
        ));
    };

    return (
        <div className="flex h-full bg-[#050505] text-white overflow-hidden">
            
            {/* COLUMN 1: HEADLINE FORGE (Fixed 300px) */}
            <div className="w-[300px] bg-[#080808] border-r border-neutral-800 flex flex-col shrink-0">
                <div className="p-3 border-b border-neutral-800 bg-black/40">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Headline Forge</span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                    {/* Selected (Winner) */}
                    <div>
                        <span className="block text-[9px] uppercase tracking-widest text-accent mb-2 font-bold">Selected Artifact</span>
                        <HeadlineCard candidate={selectedHeadline} isSelected={true} log={log} />
                    </div>

                    {/* Candidates */}
                    {candidates && (
                        <>
                            <div>
                                <span className="block text-[9px] uppercase tracking-widest text-neutral-600 mb-2 font-bold">Vogue Verdicts</span>
                                <div className="space-y-2">
                                    {candidates.vogue_verdict.filter(c => c !== selectedHeadline).map((c, i) => (
                                        <HeadlineCard key={i} candidate={c} isSelected={false} />
                                    ))}
                                </div>
                            </div>
                            <div>
                                <span className="block text-[9px] uppercase tracking-widest text-neutral-600 mb-2 font-bold">New Yorker Wit</span>
                                <div className="space-y-2">
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
            <div className="flex-1 flex flex-col bg-[#050505] min-w-[400px]">
                <div className="p-3 border-b border-neutral-800 bg-black/20 flex justify-between items-center">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Draft Inspector</span>
                    {hasRewriteChain ? (
                        <div className="flex gap-1 bg-neutral-900/80 p-0.5 rounded border border-neutral-800">
                            {VIEW_MODES.map(m => (
                                <button 
                                    key={m}
                                    onClick={() => setViewMode(m)}
                                    className={`px-3 py-1 rounded-sm text-[9px] font-bold uppercase tracking-widest transition-colors ${viewMode === m ? 'bg-neutral-100 text-black' : 'text-neutral-500 hover:text-white'}`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <span className="text-[9px] text-neutral-600">No Chain</span>
                    )}
                </div>

                <div className="flex-1 overflow-hidden relative">
                    <div className="h-full overflow-y-auto custom-scrollbar p-8 pb-48">
                         {hasRewriteChain ? (
                             <>
                                {viewMode === 'DIFF' ? (
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="opacity-60 hover:opacity-100 transition-opacity">
                                            <div className="flex justify-between border-b border-red-900/30 pb-2 mb-4">
                                                <span className="text-[9px] uppercase tracking-widest text-red-500 font-bold">Draft v1</span>
                                            </div>
                                            <div className="font-serif text-sm leading-loose text-neutral-400 whitespace-pre-wrap">
                                                {renderParagraphs(draftParagraphs)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between border-b border-emerald-900/30 pb-2 mb-4">
                                                <span className="text-[9px] uppercase tracking-widest text-emerald-500 font-bold">Final v2</span>
                                            </div>
                                            <div className="font-serif text-sm leading-loose text-white whitespace-pre-wrap">
                                                {renderParagraphs(rewriteParagraphs, activeIndices)}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="max-w-3xl mx-auto">
                                        <div className="font-serif text-lg leading-loose text-white whitespace-pre-wrap">
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
                        <div className="absolute bottom-0 left-0 right-0 bg-[#080808] border-t border-neutral-800 p-4 shadow-2xl max-h-[160px] overflow-y-auto custom-scrollbar z-20">
                            {structuredCritique && structuredCritique.length > 0 ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <span className="block text-[9px] uppercase tracking-widest text-accent font-bold">Specific Improvements</span>
                                        <span className="text-[9px] text-neutral-500">(Hover or click to highlight)</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {structuredCritique.map((point, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setActiveCritiqueId(activeCritiqueId === idx ? null : idx)}
                                                onMouseEnter={() => setActiveCritiqueId(idx)}
                                                onMouseLeave={() => setActiveCritiqueId(null)}
                                                className={`text-[10px] px-3 py-1.5 rounded border transition-all text-left font-mono leading-tight max-w-[300px] truncate ${
                                                    activeCritiqueId === idx 
                                                    ? 'bg-accent/20 text-accent border-accent shadow-[0_0_10px_rgba(208,0,0,0.2)]' 
                                                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-600 hover:text-white'
                                                }`}
                                                title={point.point}
                                            >
                                                {point.point}
                                            </button>
                                        ))}
                                    </div>
                                    {critique && <p className="text-[10px] text-neutral-600 pt-2 border-t border-neutral-900 mt-2 italic">{critique}</p>}
                                </div>
                            ) : (
                                // Fallback to general critique
                                <div className="flex gap-4">
                                    <div className="w-1/4 shrink-0">
                                        <span className="block text-[9px] uppercase tracking-widest text-accent mb-1 font-bold">Senior Editor Critique</span>
                                        <span className="text-[10px] text-neutral-500 font-mono">Automated QA Pass</span>
                                    </div>
                                    <p className="text-xs text-neutral-300 leading-relaxed font-mono pl-4 border-l border-neutral-700">
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
