
import React, { useState } from 'react';
import { NewsroomSidebar } from './NewsroomSidebar';
import { NewsroomBoard } from './NewsroomBoard';
import { NewsroomConsole, CommissionConfigState, DEFAULT_COMMISSION_CONFIG } from './NewsroomConsole';
import { AssetWorkbench } from './AssetWorkbench';
import { Lead, StoryArtifact, DebateArtifact, AgentLog, IssueContent, Proposal } from '../../types';

interface ContentModeProps {
    leads: Lead[];
    working: StoryArtifact[];
    basket: StoryArtifact[];
    activeLead: Lead | undefined;
    activeStory: StoryArtifact | undefined;
    activeDebate: DebateArtifact | undefined;
    
    logs: AgentLog[];
    isProcessing: boolean;
    isScanning: boolean;
    isCommissioning: boolean;
    
    onSelectLead: (id: string | null) => void;
    onSelectStory: (id: string | null) => void;
    onShipBatch: () => void;
    
    // Sidebar Props
    targets: string;
    setTargets: (val: string) => void;
    onScan: (override?: string) => void;
    onFeedScan: () => void;
    useDemo: boolean;
    channels: string[];
    onAddChannel: (t: string) => void;
    onRemoveChannel: (t: string) => void;
    
    // Console Props
    latestIssue: IssueContent | null;
    onCommission: (config: any) => void;
    onAutopilot: () => void;
    onPublish: (issue: IssueContent) => void;
    agentJobs: any;
    currentTemplate: string;
    onSwitchTemplate: (key: string) => void;
    
    // Workbench Props
    onApplyProposal: (p: Proposal, mods: { strict: boolean; toneLock: boolean }) => void;
    onApproveStory: (id: string) => void;
}

export const ContentMode: React.FC<ContentModeProps> = ({
    leads, working, basket, activeLead, activeStory, activeDebate, logs,
    isProcessing, isScanning, isCommissioning,
    onSelectLead, onSelectStory, onShipBatch,
    targets, setTargets, onScan, onFeedScan, useDemo, channels, onAddChannel, onRemoveChannel,
    latestIssue, onCommission, onAutopilot, onPublish, agentJobs, currentTemplate, onSwitchTemplate,
    onApplyProposal, onApproveStory
}) => {
    
    // Commission State hosted here to allow CTAs in the main view
    const [commissionConfig, setCommissionConfig] = useState<CommissionConfigState>(DEFAULT_COMMISSION_CONFIG);

    const handleExecuteCommission = () => {
        // Flatten config for the hook
        onCommission({
            depth: commissionConfig.depth,
            timeWindow: commissionConfig.timeWindow,
            risk: commissionConfig.risk,
            focusQuery: commissionConfig.focusQuery,
            bannedWords: commissionConfig.bannedWords,
            audience: commissionConfig.audience,
            temperature: commissionConfig.temperature,
            sourceMix: commissionConfig.sourceMix,
            voicePreset: commissionConfig.activePreset,
            toneProfile: commissionConfig.toneProfile,
            agentModifiers: commissionConfig.agentOverrides
        });
    };

    // Safe handler to prevent 'never' type inference error during build
    // We explicitly cast 's' to 'any' to bypass strict inference issues on empty arrays
    const handleStorySelect = (s: any) => {
        if (s && typeof s.id === 'string') {
            onSelectStory(s.id);
        }
    };

    const isWorkbenchMode = !!(activeLead || activeStory);

    // Safe ID getters
    const activeLeadId = activeLead && typeof activeLead.id === 'string' ? activeLead.id : null;
    const activeStoryId = activeStory && typeof activeStory.id === 'string' ? activeStory.id : undefined;

    return (
        <div className="flex-1 flex overflow-hidden">
            {/* COL 1: SIDEBAR */}
            <div className="w-[280px] border-r border-zinc-200 bg-white flex flex-col shrink-0 z-10">
                <NewsroomSidebar 
                    targets={targets}
                    setTargets={setTargets}
                    onScan={onScan}
                    onFeedScan={onFeedScan}
                    leads={leads} 
                    selectedLeadId={activeLeadId}
                    onSelectLead={onSelectLead}
                    useDemo={useDemo}
                    channels={channels}
                    onAddChannel={onAddChannel}
                    onRemoveChannel={onRemoveChannel}
                    isScanning={isScanning}
                />
            </div>

            {/* DYNAMIC WORKSPACE */}
            <div className="flex-1 flex overflow-hidden relative bg-zinc-50/50">
                {isWorkbenchMode ? (
                    // --- WORKBENCH VIEW ---
                    <div className="w-full h-full flex animate-fade-in">
                        {activeStory ? (
                            <AssetWorkbench 
                                story={activeStory}
                                debate={activeDebate}
                                onApplyProposal={onApplyProposal}
                                onApproveStory={onApproveStory}
                                onClose={() => onSelectStory(null)}
                            />
                        ) : activeLead ? (
                            // Commissioning View
                            <div className="w-full flex h-full">
                                <div className="flex-1 p-8 overflow-y-auto bg-zinc-50 flex items-center justify-center">
                                    <div className="max-w-2xl w-full bg-white p-10 rounded-lg shadow-sm border border-zinc-200 flex flex-col">
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-6">
                                                <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wide">
                                                    Incoming Signal
                                                </span>
                                                <span className={`text-xs font-mono font-bold ${activeLead.score > 8 ? 'text-emerald-600' : 'text-zinc-400'}`}>
                                                    SCORE: {activeLead.score}/10
                                                </span>
                                            </div>
                                            <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 mb-6 leading-tight">{activeLead.headline}</h2>
                                            <p className="text-zinc-600 text-base leading-relaxed mb-8">{activeLead.context}</p>
                                            <div className="flex items-center gap-4 text-xs text-zinc-500 border-t border-zinc-100 pt-6">
                                                <span className="font-medium text-zinc-900">Source:</span> 
                                                <span className="font-mono bg-zinc-100 px-2 py-1 rounded">{activeLead.source_ref}</span>
                                            </div>
                                        </div>

                                        {/* --- PRIMARY CTA AREA --- */}
                                        <div className="mt-8 pt-8 border-t border-zinc-100">
                                            <div className="flex items-center justify-between bg-zinc-50 p-4 rounded-lg border border-zinc-200">
                                                <div>
                                                    <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Configuration</span>
                                                    <span className="text-xs font-semibold text-zinc-900">
                                                        {commissionConfig.activePreset} Mode • {commissionConfig.depth} Research
                                                    </span>
                                                </div>
                                                <button 
                                                    onClick={handleExecuteCommission}
                                                    disabled={isProcessing || isCommissioning}
                                                    className="bg-black hover:bg-zinc-800 text-white px-6 py-3 rounded text-xs font-bold uppercase tracking-widest shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                                                >
                                                    {isCommissioning ? (
                                                        <>
                                                            <span className="animate-spin">●</span>
                                                            <span>Initializing...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span>Initialize Commission</span>
                                                            <span>→</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Right Panel Commission Controls */}
                                <div className="w-[380px] border-l border-zinc-200 bg-white">
                                    <NewsroomConsole 
                                        logs={logs}
                                        isProcessing={isProcessing}
                                        isCommissioning={isCommissioning}
                                        selectedLead={activeLead}
                                        activeStory={undefined}
                                        latestIssue={latestIssue}
                                        commissionConfig={commissionConfig}
                                        setCommissionConfig={setCommissionConfig}
                                        onCommission={handleExecuteCommission}
                                        onAutopilot={onAutopilot}
                                        onPublish={onPublish}
                                        agentJobs={agentJobs}
                                        currentTemplate={currentTemplate}
                                        onSwitchTemplate={onSwitchTemplate}
                                    />
                                </div>
                            </div>
                        ) : null}
                    </div>
                ) : (
                    // --- BOARD VIEW ---
                    <div className="w-full h-full flex">
                        <div className="flex-1 overflow-hidden">
                            <NewsroomBoard 
                                working={working}
                                basket={basket}
                                onSelectStory={handleStorySelect}
                                activeItemId={activeStoryId}
                                onShipBatch={onShipBatch}
                            />
                        </div>
                        
                        {/* Persistent System Console */}
                        <div className="w-[360px] bg-white flex flex-col border-l border-zinc-200 shadow-[0_0_20px_rgba(0,0,0,0.02)] z-10">
                            <NewsroomConsole 
                                logs={logs}
                                isProcessing={isProcessing}
                                isCommissioning={isCommissioning}
                                selectedLead={undefined}
                                activeStory={undefined}
                                latestIssue={latestIssue}
                                commissionConfig={commissionConfig}
                                setCommissionConfig={setCommissionConfig}
                                onCommission={handleExecuteCommission}
                                onAutopilot={() => {}}
                                onPublish={onPublish}
                                agentJobs={agentJobs}
                                currentTemplate={currentTemplate}
                                onSwitchTemplate={onSwitchTemplate}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
