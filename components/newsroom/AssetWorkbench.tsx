
import React, { useState } from 'react';
import { StoryArtifact, Proposal, DebateArtifact, SignatureBlock, ToneProfile } from '../../types';
import { TheCraft } from '../TheCraft';
import { useNewsroom } from '../../hooks/useNewsroom';
import { ToneEQSlider, JsonInspector } from './ui-primitives';

interface AssetWorkbenchProps {
    story?: StoryArtifact;
    debate?: DebateArtifact;
    onApplyProposal: (proposal: Proposal, modifiers: { strict: boolean; toneLock: boolean }) => void;
    onApproveStory: (storyId: string) => void;
    onClose: () => void;
}

// UI: Signature Block Renderer
const SignatureBlockItem: React.FC<{ block: SignatureBlock }> = ({ block }) => {
    let borderColor = 'border-l-zinc-600';
    if (block.type === 'VERDICT') borderColor = 'border-l-white';
    if (block.type === 'COUNTERPOINT') borderColor = 'border-l-red-500';
    if (block.type === 'DELTA') borderColor = 'border-l-emerald-500';

    return (
        <div className={`mb-4 pl-3 border-l-2 ${borderColor}`}>
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-1">{block.heading || block.type}</span>
            <p className="text-xs text-zinc-300 leading-snug font-serif italic">
                "{block.content}"
            </p>
        </div>
    );
};

// UI: Proposal Card (Dark Mode)
const ProposalCard: React.FC<{ p: Proposal; onClick: () => void }> = ({ p, onClick }) => (
    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-sm shadow-sm hover:border-zinc-600 transition-all cursor-pointer group mb-3">
        <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${p.agent === 'CRITIC' ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                <span className="text-[10px] font-bold uppercase text-zinc-400">{p.agent}</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 border border-zinc-800 px-1.5 rounded">{p.type}</span>
        </div>
        <h4 className="font-medium text-sm text-zinc-200 leading-snug mb-3">{p.label}</h4>
        <div className="flex justify-between items-center pt-2 border-t border-zinc-800">
            <div className="flex gap-2">
                 <span className="text-[9px] font-medium text-emerald-400 bg-emerald-900/20 px-1.5 py-0.5 rounded">{p.impact}</span>
                 {p.cost_estimate && <span className="text-[9px] font-medium text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">Cost: {p.cost_estimate}</span>}
            </div>
            <button 
                onClick={onClick}
                className="text-[10px] font-bold uppercase text-zinc-500 hover:text-white transition-colors"
            >
                Apply
            </button>
        </div>
    </div>
);

// UI: Drift Monitor
const DriftMonitor: React.FC<{ 
    metric: StoryArtifact['drift_metric']; 
    onRun: () => void 
}> = ({ metric, onRun }) => {
    const score = metric?.score || 0;
    const isGood = score > 80;
    
    return (
        <div className="p-4 bg-zinc-900 rounded border border-zinc-800 mb-6">
            <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Drift Watch</span>
                {metric && <span className="text-[9px] font-mono text-zinc-500">{new Date(metric.last_check).toLocaleTimeString()}</span>}
            </div>
            
            {metric ? (
                <div className="flex items-center gap-4 mb-4">
                     <div className="relative w-12 h-12 flex items-center justify-center">
                         <svg className="w-full h-full transform -rotate-90">
                             <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-zinc-800" />
                             <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" 
                                className={isGood ? "text-emerald-500" : "text-amber-500"}
                                strokeDasharray={125}
                                strokeDashoffset={125 - (125 * score) / 100}
                             />
                         </svg>
                         <span className="absolute text-[10px] font-bold text-white">{score}</span>
                     </div>
                     <div className="flex-1">
                         <span className={`text-xs font-bold block ${isGood ? 'text-emerald-500' : 'text-amber-500'}`}>
                             {isGood ? 'Tone Aligned' : 'Drift Detected'}
                         </span>
                         <span className="text-[10px] text-zinc-500 leading-tight">
                             {metric.contradictions.length} potential issues found.
                         </span>
                     </div>
                </div>
            ) : (
                <div className="text-[10px] text-zinc-600 italic mb-4 text-center">No audit data available.</div>
            )}
            
            <button 
                onClick={onRun}
                className="w-full py-1.5 bg-zinc-800 border border-zinc-700 hover:border-zinc-500 text-zinc-300 text-[10px] font-bold uppercase tracking-wide rounded transition-colors"
            >
                Run Drift Audit
            </button>
        </div>
    );
};

export const AssetWorkbench: React.FC<AssetWorkbenchProps> = ({ story, debate, onApplyProposal, onApproveStory, onClose }) => {
    const [strictMode, setStrictMode] = useState(false);
    const [toneLock, setToneLock] = useState(true);
    const { runDriftCheck } = useNewsroom(); 

    const generatedProposals: Proposal[] = story ? [
        { id: 'p1', type: 'REWRITE', label: 'Sharpen the lede. Remove passive voice.', impact: 'Tone +12%', agent: 'EDITOR', scope: 'BODY', cost_estimate: 'Low' },
        { id: 'p2', type: 'HEADLINE_GEN', label: 'Generate higher voltage headlines.', impact: 'Risk +5%', agent: 'CRITIC', scope: 'HEADLINE', cost_estimate: 'Low' },
    ] : [];

    const proposals = story?.pending_proposals && story.pending_proposals.length > 0 
        ? story.pending_proposals 
        : generatedProposals;

    const tone = story?.tone_profile || { drama: 3, precision: 3, metaphor_density: 3, adjective_budget: 50, sentence_mode: 'MIXED' };

    if (!story) return null;

    return (
        <div className="flex w-full h-full bg-[#050505] text-white overflow-hidden">
            
            {/* COLUMN 1: EVIDENCE RAIL & SIGNATURE BLOCKS */}
            <div className="w-[300px] border-r border-zinc-800 bg-[#0A0A0A] flex flex-col shrink-0">
                <div className="h-12 border-b border-zinc-800 flex items-center px-4 bg-zinc-900/50 shrink-0">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Modules</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                    
                    {/* SIGNATURE BLOCKS */}
                    {story.signature_blocks && story.signature_blocks.length > 0 && (
                        <div>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-400 mb-3 block">Editor's Signature</span>
                            {story.signature_blocks.map(b => (
                                <SignatureBlockItem key={b.id} block={b} />
                            ))}
                        </div>
                    )}

                    {/* EVIDENCE */}
                    <div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-3 block">Evidence Locker</span>
                        {debate?.dossier.claims.map((c, i) => (
                            <div key={i} className="bg-zinc-900 p-3 border border-zinc-800 rounded-sm text-sm text-zinc-400 leading-relaxed hover:border-zinc-600 mb-2 transition-colors">
                                <div className="flex justify-between items-center mb-2">
                                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 border rounded ${
                                        c.status === 'VERIFIED' ? 'border-emerald-900/50 text-emerald-500 bg-emerald-900/10' : 
                                        c.status === 'DISPUTED' ? 'border-red-900/50 text-red-500 bg-red-900/10' : 
                                        'border-amber-900/50 text-amber-500 bg-amber-900/10'
                                    }`}>{c.status}</span>
                                    <span className="text-[9px] font-mono text-zinc-600">SRC:{c.supporting_sources[0]}</span>
                                </div>
                                <p className="line-clamp-4 text-xs font-mono">{c.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* COLUMN 2: EDITOR CANVAS (Full Height, No Paper) */}
            <div className="flex-1 flex flex-col bg-[#050505] relative z-10 min-w-0">
                {/* Canvas Toolbar */}
                <div className="h-12 border-b border-zinc-800 flex justify-between items-center px-6 bg-[#050505] shrink-0 sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">Drafting</span>
                        <span className="text-zinc-700">/</span>
                        <span className="text-xs font-semibold text-zinc-300">{story.category}</span>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="text-xs font-medium text-zinc-500 hover:text-white px-2 py-1 rounded hover:bg-zinc-800 transition-colors">Exit</button>
                    </div>
                </div>

                {/* The Editor Surface */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#050505] w-full">
                    {/* TheCraft component now sits directly in the dark container, taking full width/height */}
                    <div className="min-h-full">
                        <TheCraft story={story} />
                    </div>
                </div>
                
                {/* Bottom Action Bar */}
                <div className="h-16 border-t border-zinc-800 flex items-center justify-between px-8 bg-[#080808] shrink-0">
                    <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                        <span>Words: {story.body.join(' ').split(' ').length}</span>
                        <span>Read: 3m</span>
                    </div>
                    <button 
                        onClick={() => onApproveStory(story.id)}
                        disabled={story.status === 'APPROVED'}
                        className="bg-white text-black px-6 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] disabled:bg-zinc-800 disabled:text-zinc-500 disabled:shadow-none"
                    >
                        {story.status === 'APPROVED' ? 'Locked & Approved' : 'Approve Artifact'}
                    </button>
                </div>
            </div>

            {/* COLUMN 3: CONTROL RAIL (Dark Mode) */}
            <div className="w-[340px] border-l border-zinc-800 bg-[#0A0A0A] flex flex-col shrink-0">
                {/* Module 1: Tone Physics */}
                <div className="p-6 border-b border-zinc-800 shrink-0">
                    <DriftMonitor 
                        metric={story.drift_metric} 
                        onRun={() => runDriftCheck(story.id, () => {})} 
                    />
                    
                    <h3 className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 mb-4">Tone Physics</h3>
                    <div className="bg-zinc-900 p-4 rounded-sm border border-zinc-800">
                        <ToneEQSlider label="Drama" value={tone.drama} max={5} />
                        <ToneEQSlider label="Precision" value={tone.precision} max={5} />
                        <ToneEQSlider label="Metaphor" value={tone.metaphor_density} max={5} />
                        <div className="mt-4 flex justify-between">
                            <span className="text-[9px] font-bold uppercase text-zinc-500">Adj. Budget</span>
                            <span className="text-[9px] font-mono font-bold text-zinc-400">{tone.adjective_budget}%</span>
                        </div>
                        <div className="w-full bg-zinc-800 h-1 rounded-full mt-1">
                            <div className="bg-zinc-500 h-1 rounded-full" style={{width: `${tone.adjective_budget}%`}}></div>
                        </div>
                    </div>
                </div>

                {/* Module 2: Proposals */}
                <div className="flex-1 overflow-y-auto p-6 bg-[#050505]">
                    <h3 className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 mb-4">Proposal Engine</h3>
                    {proposals.map(p => (
                        <ProposalCard key={p.id} p={p} onClick={() => onApplyProposal(p, { strict: strictMode, toneLock })} />
                    ))}
                </div>

                {/* Module 3: Raw Data */}
                <div className="p-4 border-t border-zinc-800 bg-[#0A0A0A] shrink-0">
                    <JsonInspector data={story} label="Artifact JSON" />
                </div>

                {/* Module 4: Variants */}
                <div className="p-4 border-t border-zinc-800 bg-[#0A0A0A] shrink-0">
                    <h3 className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 mb-3">Versions</h3>
                    <div className="space-y-1">
                        <div className="flex justify-between items-center p-2.5 bg-blue-900/20 border border-blue-900/50 rounded-sm">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                <span className="text-xs font-semibold text-blue-200">v{story.variants?.length ? story.variants.length + 1 : '1'}.0 Current</span>
                            </div>
                            <span className="text-[10px] font-mono text-blue-400">NOW</span>
                        </div>
                        {(story.variants || []).slice(-2).reverse().map(v => (
                            <div key={v.id} className="flex justify-between items-center p-2.5 hover:bg-zinc-900 rounded-sm cursor-pointer border border-transparent hover:border-zinc-800 transition-colors">
                                <span className="text-xs font-medium text-zinc-400 pl-3.5">v{v.id.split('_')[1]?.slice(-3) || 'Old'}</span>
                                <span className="text-[10px] font-mono text-zinc-600">{new Date(v.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
};
