
import React, { useState } from 'react';
import { IssueContent, AgentLog, Lead, DebateArtifact, StoryArtifact } from '../types';
import { RunConfig, DbStatus } from '../hooks/useNewsroom'; 
import { NewsroomSidebar } from './newsroom/NewsroomSidebar';
import { NewsroomCanvas } from './newsroom/NewsroomCanvas';
import { NewsroomConsole } from './newsroom/NewsroomConsole';

interface NewsroomProps {
  logs: AgentLog[];
  isProcessing: boolean;
  dbStatus?: DbStatus;
  dbError?: string | null;
  scanWire: (targets: string[], useDemo: boolean) => Promise<void>;
  commissionStory: (lead: Lead, theme: string, useDemo: boolean, config: RunConfig, onUpdate: (partial: IssueContent) => void) => Promise<any>;
  runAutopilot: (targets: string[], theme: string, useDemo: boolean, onUpdate: (partial: IssueContent) => void) => Promise<any>;
  leads: Lead[];
  onPublish: (issue: IssueContent) => void;
  onCancel: () => void;
  // New props
  channels: string[];
  onAddChannel: (t: string) => void;
  onRemoveChannel: (t: string) => void;
  onPublishArtifact: (artifact: StoryArtifact) => Promise<any>;
  // Autopilot Control
  isAutopilotActive?: boolean;
  onToggleAutopilot?: (active: boolean, theme: string, useDemo: boolean, onUpdate: (partial: IssueContent) => void) => void;
}

export const TheNewsroom: React.FC<NewsroomProps> = ({ 
    logs, isProcessing, dbStatus, dbError, scanWire, commissionStory, runAutopilot, leads, onPublish, onCancel,
    channels, onAddChannel, onRemoveChannel, onPublishArtifact, isAutopilotActive, onToggleAutopilot
}) => {
  // Global State
  const [theme, setTheme] = useState("The Synthetic Real");
  const [targets, setTargets] = useState(""); 
  const [useDemo, setUseDemo] = useState(false);
  
  // Selection State
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [activeDebate, setActiveDebate] = useState<DebateArtifact | null>(null);
  const [latestIssue, setLatestIssue] = useState<IssueContent | null>(null);
  
  // Tracking State
  const [processedLeadIds, setProcessedLeadIds] = useState<Set<string>>(new Set());

  // View Mode Logic
  const [viewModeOverride, setViewModeOverride] = useState<'INSPECT' | 'DOSSIER' | 'ARTIFACT' | null>(null);
  
  const selectedLead = leads.find(l => l.id === selectedLeadId);
  const activeStory = latestIssue?.features?.[latestIssue.features.length - 1];

  // Computed View Mode
  const currentView = viewModeOverride || (activeStory ? 'ARTIFACT' : activeDebate ? 'DOSSIER' : 'INSPECT');

  const handleCommission = async (configData: any) => {
      if (!selectedLead) return;
      setActiveDebate(null); 
      setLatestIssue(null);
      setViewModeOverride('DOSSIER');
      
      const config: RunConfig = {
          deepResearch: configData.depth === 'Deep',
          timeWindow: configData.timeWindow,
          voicePreset: configData.voice,
          riskTolerance: configData.risk,
          qualityPass: true,
          includeAtelier: true,
          generateImages: false,
          overrides: {
            focusQuery: configData.focusQuery || undefined,
            bannedWords: configData.bannedWords || undefined,
            audienceLevel: configData.audience,
            modelTemperature: configData.temperature
          }
      };

      const result = await commissionStory(selectedLead, theme, useDemo, config, (partial) => {
          if (partial.debates && partial.debates.length > 0) {
              setActiveDebate(partial.debates[partial.debates.length - 1]);
          }
      });

      if (result) {
          setLatestIssue(result);
          setViewModeOverride('ARTIFACT');
          // Mark lead as processed locally so we don't re-run it immediately
          setProcessedLeadIds(prev => new Set(prev).add(selectedLead.id));
      }
  };

  const handleScan = async () => {
      if (!targets.trim()) return;
      const targetList = targets.split(',').map(s => s.trim());
      await scanWire(targetList, useDemo);
  };
  
  const handleAutopilot = async () => {
      // Manual single-run triggered from Console (kept for backward compat or manual override)
      if (!targets.trim()) return;
      const targetList = targets.split(',').map(s => s.trim());
      const result = await runAutopilot(targetList, theme, useDemo, (partial) => {
           if (partial.debates && partial.debates.length > 0) {
              setActiveDebate(partial.debates[partial.debates.length - 1]);
          }
      });
      if (result) {
          setLatestIssue(result);
          setViewModeOverride('ARTIFACT');
      }
  };
  
  const handleToggleAutopilot = () => {
      if (onToggleAutopilot) {
          // Toggle logic
          onToggleAutopilot(!isAutopilotActive, theme, useDemo, (partial) => {
              // Update local state when Autopilot finds something
              if (partial.features && partial.features.length > 0) {
                  setLatestIssue(partial);
                  // Don't override view mode aggressively in background mode
              }
          });
      }
  };

  const handlePublishArtifact = async (artifact: StoryArtifact) => {
      const updatedIssue = await onPublishArtifact(artifact);
      if (updatedIssue) {
          onPublish(updatedIssue);
      }
  };
  
  const handleResetWorkspace = () => {
      setLatestIssue(null);
      setActiveDebate(null);
      setSelectedLeadId(null);
      setViewModeOverride('INSPECT');
  };

  return (
    <div className="fixed inset-0 bg-black text-white font-mono z-50 flex flex-col text-sm antialiased selection:bg-accent selection:text-white">
      
      {/* GLOBAL HEADER */}
      <header className="h-14 border-b border-neutral-900 bg-[#0A0A0A] flex justify-between items-center px-6 shrink-0 select-none">
          <div className="flex items-center gap-8">
              <span className="font-bold tracking-[0.2em] text-white text-base">MODUS <span className="text-neutral-600">//</span> OPS</span>
              <div className="h-4 w-px bg-neutral-800"></div>
              <span className="text-xs text-neutral-500 font-sans tracking-widest uppercase">
                  UNIT: <span className="text-neutral-300">{theme.toUpperCase()}</span>
              </span>
          </div>
          <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-3 py-1 bg-neutral-900 rounded-full border border-neutral-800">
                  <div className={`w-2 h-2 rounded-full ${dbStatus === 'CONNECTED' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`}></div>
                  <span className="text-[10px] font-bold text-neutral-400 tracking-wider">{dbStatus}</span>
              </div>
              
              <button 
                onClick={onCancel} 
                className="text-xs font-bold text-neutral-500 hover:text-white border border-transparent hover:border-neutral-700 px-3 py-1 rounded transition-all"
              >
                  ESC
              </button>
          </div>
      </header>

      {/* 3-COLUMN LAYOUT */}
      <div className="flex-1 flex overflow-hidden">
          
          <NewsroomSidebar 
            targets={targets}
            setTargets={setTargets}
            onScan={handleScan}
            onFeedScan={() => scanWire(['FEEDS'], useDemo)}
            leads={leads}
            selectedLeadId={selectedLeadId}
            onSelectLead={setSelectedLeadId}
            useDemo={useDemo}
            channels={channels}
            onAddChannel={onAddChannel}
            onRemoveChannel={onRemoveChannel}
            processedLeadIds={processedLeadIds}
          />

          <NewsroomCanvas 
            currentView={currentView}
            setViewMode={setViewModeOverride}
            selectedLead={selectedLead}
            activeDebate={activeDebate}
            activeStory={activeStory}
            isProcessing={isProcessing}
          />

          <NewsroomConsole 
             logs={logs}
             isProcessing={isProcessing}
             selectedLead={selectedLead}
             activeStory={activeStory}
             latestIssue={latestIssue}
             onCommission={handleCommission}
             onAutopilot={handleAutopilot}
             onPublish={onPublish}
             onPublishArtifact={handlePublishArtifact}
             onReset={handleResetWorkspace}
             isAutopilotActive={isAutopilotActive}
             onToggleAutopilot={handleToggleAutopilot}
          />
      </div>
    </div>
  );
};
