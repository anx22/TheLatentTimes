
import React, { useState } from 'react';
import { NewsroomSidebar } from './NewsroomSidebar';
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

    const isWorkbenchMode = !!(activeLead || activeStory);
    const activeLeadId = activeLead && typeof activeLead.id === 'string' ? activeLead.id : null;

    return (
        <div className="flex-1 flex overflow-hidden w-full h-full bg-white">
            {/* COL 1: SIDEBAR (Navigation & Comms) */}
            <div className="w-[300px] border-r border-zinc-200 bg-zinc-50/50 flex flex-col shrink-0 z-20">
                <NewsroomSidebar 
                    targets={targets}
                    setTargets={setTargets}
                    onScan={onScan}
                    onFeedScan={onFeedScan}
                    channels={channels}
                    onAddChannel={onAddChannel}
                    onRemoveChannel={onRemoveChannel}
                    isScanning={isScanning}
                    logs={logs} // Pass logs to Sidebar
                />
            </div>

            {/* COL 2: MAIN CANVAS (The Wire & The Work) */}
            <div className="flex-1 flex flex-col overflow-hidden relative bg-white shadow-xl z-10">
                <NewsroomCanvas 
                    currentView={canvasView}
                    setViewMode={setCanvasView}
                    selectedLead={activeLead}
                    activeDebate={activeDebate || null}
                    activeStory={activeStory}
                    
                    // Wire Data
                    leads={leads}
                    working={working}
                    basket={basket}
                    onSelectLead={onSelectLead}
                    onSelectStory={onSelectStory} // Pass story selection
                    
                    isScanning={isScanning}
                    isCommissioning={isCommissioning}
                    logs={logs}
                />
            </div>

            {/* COL 3: CONSOLE (Controls) */}
            <div className="w-[380px] bg-white flex flex-col border-l border-zinc-200 shrink-0 z-20">
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
