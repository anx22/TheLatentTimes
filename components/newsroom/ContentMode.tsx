
import React, { useState } from 'react';
import { NewsroomSidebar } from './NewsroomSidebar';
import { NewsroomBoard } from './NewsroomBoard';
import { NewsroomConsole, CommissionConfigState, DEFAULT_COMMISSION_CONFIG } from './NewsroomConsole';
import { NewsroomCanvas } from './NewsroomCanvas';
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
    
    targets: string;
    setTargets: (val: string) => void;
    onScan: (override?: string) => void;
    onFeedScan: () => void;
    useDemo: boolean;
    channels: string[];
    onAddChannel: (t: string) => void;
    onRemoveChannel: (t: string) => void;
    
    latestIssue: IssueContent | null;
    onCommission: (config: any) => void;
    onAutopilot: () => void;
    onPublish: (issue: IssueContent) => void;
    agentJobs: any;
    currentTemplate: string;
    onSwitchTemplate: (key: string) => void;
    
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
    
    const [commissionConfig, setCommissionConfig] = useState<CommissionConfigState>(DEFAULT_COMMISSION_CONFIG);
    const [canvasView, setCanvasView] = useState<'INSPECT' | 'DOSSIER' | 'ARTIFACT'>('INSPECT');

    const handleExecuteCommission = () => {
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

    const handleStorySelect = (s: any) => {
        if (s && typeof s.id === 'string') {
            onSelectStory(s.id);
        }
    };

    const isWorkbenchMode = !!(activeLead || activeStory);
    const activeLeadId = activeLead && typeof activeLead.id === 'string' ? activeLead.id : null;
    const activeStoryId = activeStory && typeof activeStory.id === 'string' ? activeStory.id : undefined;

    return (
        <div className="flex-1 flex overflow-hidden w-full h-full bg-zinc-50">
            {/* COL 1: SIDEBAR (Navigation) */}
            <div className="w-[260px] border-r border-zinc-200 bg-white flex flex-col shrink-0 z-10">
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

            {/* COL 2: MAIN CANVAS (The Work) */}
            <div className="flex-1 flex flex-col overflow-hidden relative bg-zinc-100 shadow-inner">
                {isWorkbenchMode ? (
                    <NewsroomCanvas 
                        currentView={canvasView}
                        setViewMode={setCanvasView}
                        selectedLead={activeLead}
                        activeDebate={activeDebate || null}
                        activeStory={activeStory}
                        isScanning={isScanning}
                        isCommissioning={isCommissioning}
                        logs={logs}
                    />
                ) : (
                    // Board View
                    <NewsroomBoard 
                        working={working}
                        basket={basket}
                        onSelectStory={handleStorySelect}
                        activeItemId={activeStoryId}
                        onShipBatch={onShipBatch}
                    />
                )}
            </div>

            {/* COL 3: CONSOLE (Controls & Chat) - EXPANDED WIDTH */}
            <div className="w-[420px] bg-white flex flex-col border-l border-zinc-200 shadow-[0_0_20px_rgba(0,0,0,0.02)] z-10 shrink-0">
                <NewsroomConsole 
                    logs={logs}
                    isProcessing={isProcessing}
                    isCommissioning={isCommissioning}
                    selectedLead={activeLead}
                    activeStory={activeStory}
                    latestIssue={latestIssue}
                    commissionConfig={commissionConfig}
                    setCommissionConfig={setCommissionConfig}
                    onCommission={handleExecuteCommission}
                    onAutopilot={onAutopilot}
                    onPublish={onPublish}
                    agentJobs={agentJobs}
                    currentTemplate={currentTemplate}
                    onSwitchTemplate={onSwitchTemplate}
                    onApplyProposal={onApplyProposal}
                    onApproveStory={onApproveStory}
                />
            </div>
        </div>
    );
};
