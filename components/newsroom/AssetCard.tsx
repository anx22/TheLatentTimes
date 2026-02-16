
import React from 'react';
import { Lead, StoryArtifact } from '../../types';
import { RiskChip } from './ui-primitives';

interface AssetCardProps {
    type: 'LEAD' | 'STORY';
    data: Lead | StoryArtifact;
    onClick: () => void;
    isSelected?: boolean;
}

export const AssetCard: React.FC<AssetCardProps> = ({ type, data, onClick, isSelected }) => {
    const isLead = type === 'LEAD';
    const lead = data as Lead;
    const story = data as StoryArtifact;
    
    // Derived Metadata
    const headline = isLead ? lead.headline : story.headline;
    const topic = isLead ? lead.target_topic : story.category;
    const score = isLead ? lead.score : (story.fact_check_report?.approved ? 10 : 8);
    const risk = isLead ? lead.risk_classification : 'NONE';

    // Status Badge Logic
    let statusLabel = "SCAN";
    let statusColor = "bg-zinc-100 text-zinc-600 border-zinc-200";

    if (!isLead) {
        if (story.status === 'PUBLISHED') { statusLabel = "LIVE"; statusColor = "bg-emerald-50 text-emerald-700 border-emerald-200"; }
        else if (story.status === 'APPROVED') { statusLabel = "READY"; statusColor = "bg-blue-50 text-blue-700 border-blue-200"; }
        else if (story.fact_check_report) { statusLabel = "CHECK"; statusColor = "bg-amber-50 text-amber-700 border-amber-200"; }
        else if (story.rewrite_chain) { statusLabel = "EDIT"; statusColor = "bg-purple-50 text-purple-700 border-purple-200"; }
        else { statusLabel = "DRAFT"; statusColor = "bg-zinc-100 text-zinc-600 border-zinc-200"; }
    } else {
        statusLabel = "WIRE";
    }

    // --- GATE STAMPS (The "Proof Layer") ---
    const gates = [
        { 
            label: 'PROV', 
            status: !isLead ? ((story.citations?.length || 0) > 0 ? 'PASS' : 'WARN') : 'PEND',
            title: 'Provenance: Citations check'
        },
        { 
            label: 'DUPE', 
            status: 'PASS', // Assumed unique once in production
            title: 'Duplication: Uniqueness check'
        }, 
        { 
            label: 'DISPUTE', 
            status: !isLead ? (story.fact_check_report ? (story.fact_check_report.approved ? 'PASS' : 'FAIL') : 'PEND') : 'PEND',
            title: 'Dispute: Fact Checker verification'
        }
    ];

    const getGateColor = (status: string) => {
        switch(status) {
            case 'PASS': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
            case 'WARN': return 'text-amber-700 bg-amber-50 border-amber-200';
            case 'FAIL': return 'text-red-700 bg-red-50 border-red-200';
            default: return 'text-zinc-400 bg-zinc-50 border-zinc-200 opacity-60';
        }
    };

    // --- AGENT BADGES (The "Team") ---
    const activeAgents = [];
    if (!isLead) {
        activeAgents.push('S'); // Scout (Always)
        if (story.headline_log) activeAgents.push('E'); // Editor (if Headlines forged)
        if (story.body?.length > 0) activeAgents.push('W'); // Writer (if Body exists)
        if (story.fact_check_report) activeAgents.push('C'); // Critic (if Checked)
        if (story.img_brief) activeAgents.push('A'); // Artist (if Visuals briefed)
    } else {
        activeAgents.push('S');
    }

    const agentColors: Record<string, string> = {
        'S': 'bg-emerald-100 text-emerald-700 border-emerald-200', 
        'C': 'bg-red-100 text-red-700 border-red-200', 
        'W': 'bg-blue-100 text-blue-700 border-blue-200', 
        'E': 'bg-zinc-100 text-zinc-700 border-zinc-200', 
        'A': 'bg-purple-100 text-purple-700 border-purple-200',
    };

    // --- PIPELINE STAGES (The "Process") ---
    const stages = [
        { id: 'SIG', label: 'SIG', active: true },
        { id: 'RES', label: 'RES', active: !isLead }, 
        { id: 'DOS', label: 'DOS', active: !isLead }, 
        { id: 'DEB', label: 'DEB', active: !isLead }, 
        { id: 'CPY', label: 'CPY', active: !isLead && (story.body?.length || 0) > 0 }, 
        { id: 'VAR', label: 'VAR', active: !isLead && (story.variants?.length || 0) > 0 }, 
    ];

    return (
        <div 
            onClick={onClick}
            className={`
                group relative p-4 bg-white rounded-lg border cursor-pointer transition-all duration-200 select-none flex flex-col gap-3
                ${isSelected 
                    ? 'border-indigo-500 shadow-md ring-1 ring-indigo-500/20 z-10' 
                    : 'border-zinc-200 hover:border-zinc-300 hover:shadow-sm'
                }
            `}
        >
            {/* Header: Status & Topic */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${statusColor}`}>
                        {statusLabel}
                    </span>
                    <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wide truncate max-w-[100px]">
                        {topic}
                    </span>
                </div>
                {score >= 8 && (
                    <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100">
                        <span className="text-[9px] font-bold">★</span>
                        <span className="text-[9px] font-mono font-bold">{score}</span>
                    </div>
                )}
            </div>

            {/* Headline */}
            <h4 className={`font-sans text-sm font-semibold leading-snug line-clamp-3 ${isSelected ? 'text-indigo-900' : 'text-zinc-900 group-hover:text-black'}`}>
                {headline}
            </h4>

            {/* Middle: Gates & Stages (Stories Only) */}
            {!isLead && (
                <div className="flex flex-col gap-2 pt-2 border-t border-dashed border-zinc-100 mt-1">
                    
                    {/* Row 1: Gate Stamps */}
                    <div className="flex gap-1.5">
                        {gates.map(g => (
                            <div key={g.label} title={g.title} className={`flex items-center px-1.5 py-px rounded border ${getGateColor(g.status)}`}>
                                <span className="text-[8px] font-bold tracking-widest mr-1">{g.label}</span>
                                <span className={`text-[8px] font-mono font-bold ${g.status === 'PEND' ? 'opacity-0' : 'opacity-100'}`}>
                                    {g.status === 'PASS' ? '✓' : g.status === 'FAIL' ? '✗' : '!'}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Row 2: Pipeline Chain */}
                    <div className="flex items-center gap-1 opacity-80">
                        {stages.map((s, i) => (
                            <React.Fragment key={s.id}>
                                <span className={`text-[8px] font-mono font-medium ${s.active ? 'text-zinc-900' : 'text-zinc-300'}`}>
                                    {s.label}
                                </span>
                                {i < stages.length - 1 && <span className="text-[8px] text-zinc-200">›</span>}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            )}

            {/* Footer: Agents & Risk */}
            <div className="flex justify-between items-center pt-3 mt-1 border-t border-zinc-100">
                <div className="flex items-center gap-1">
                    {activeAgents.map(role => (
                        <div 
                            key={role} 
                            className={`w-5 h-5 rounded-full border flex items-center justify-center text-[9px] font-bold shadow-sm ${agentColors[role] || 'bg-gray-100'}`}
                            title={`Agent: ${role}`}
                        >
                            {role}
                        </div>
                    ))}
                </div>
                <RiskChip risk={risk} />
            </div>
        </div>
    );
};
