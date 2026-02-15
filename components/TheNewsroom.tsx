
import React, { useState, useEffect } from 'react';
import { IssueContent, AgentLog, Lead, StoryArtifact, Proposal, DebateArtifact } from '../types';
import { RunConfig, DbStatus } from '../hooks/useNewsroom'; 
import { ContentMode } from './newsroom/ContentMode';
import { LayoutMode } from './newsroom/LayoutMode';

interface NewsroomProps {
  logs: AgentLog[];
  isProcessing: boolean;
  isScanning?: boolean;
  isCommissioning?: boolean;
  dbStatus?: DbStatus;
  dbError?: string | null;
  scanWire: (targets: string[], useDemo: boolean) => Promise<void>;
  commissionStory: (lead: Lead, theme: string, useDemo: boolean, config: RunConfig, onUpdate: (partial: IssueContent) => void) => Promise<any>;
  runAutopilot: (targets: string[], theme: string, useDemo: boolean, onUpdate: (partial: IssueContent) => void) => Promise<any>;
  runProposal: (storyId: string, proposal: Proposal, modifiers: { strict: boolean; toneLock: boolean }, onUpdate: (partial: IssueContent) => void) => Promise<any>;
  approveStory: (storyId: string, onUpdate: (partial: IssueContent) => void) => void;
  shipBatch: (onUpdate: (partial: IssueContent) => void) => Promise<void>;
  
  leads: Lead[];
  onPublish: (issue: IssueContent) => void;
  onCancel: () => void;
  channels: string[];
  onAddChannel: (t: string) => void;
  onRemoveChannel: (t: string) => void;
  onPublishArtifact: (artifact: StoryArtifact) => Promise<any>;
  isAutopilotActive?: boolean;
  onToggleAutopilot?: (active: boolean, theme: string, useDemo: boolean, onUpdate: (partial: IssueContent) => void) => void;
  agentJobs: any;
  currentTemplate: string;
  onSwitchTemplate: (key: string) => void;
  initialIssue: IssueContent; 
}

export const TheNewsroom: React.FC<NewsroomProps> = ({ 
    logs, isProcessing, isScanning = false, isCommissioning = false, dbStatus, scanWire, commissionStory, runAutopilot, runProposal, approveStory, shipBatch, leads, onPublish, onCancel,
    channels, onAddChannel, onRemoveChannel, onPublishArtifact, isAutopilotActive, onToggleAutopilot, agentJobs,
    currentTemplate, onSwitchTemplate, initialIssue
}) => {
  // MODE SWITCHER STATE
  const [activeMode, setActiveMode] = useState<'EDITOR' | 'DESIGNER'>('EDITOR');

  const [theme] = useState("The Synthetic Real");
  const [targets, setTargets] = useState(""); 
  const [useDemo] = useState(false);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  
  // Initialize with the real issue data passed from App
  const [latestIssue, setLatestIssue] = useState<IssueContent | null>(initialIssue);

  // Sync if initialIssue updates externally
  useEffect(() => {
      if (initialIssue) setLatestIssue(initialIssue);
  }, [initialIssue]);

  const inbox: Lead[] = leads; 
  
  const working: StoryArtifact[] = latestIssue ? [...latestIssue.features, ...latestIssue.columns].filter(s => s.status !== 'PUBLISHED' && s.status !== 'APPROVED') : [];
  const basket: StoryArtifact[] = latestIssue ? [...latestIssue.features, ...latestIssue.columns].filter(s => s.status === 'APPROVED') : [];

  // SMART RESOLVER: Determine what is active based on ID
  const activeLead = inbox.find(l => l.id === activeItemId);
  const activeStory = latestIssue ? [...latestIssue.features, ...latestIssue.columns].find(s => s.id === activeItemId) : undefined;
  
  // If we have a story, find its debate/dossier. If we have a lead, we might have a story for it.
  const activeDebate = latestIssue?.debates.find((d: DebateArtifact) => d.id === activeStory?.signal_id);
  
  const handleCommission = async (configData: any) => {
      if (!activeLead) return;
      
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

      await commissionStory(activeLead, theme, useDemo, config, (partial) => {
          setLatestIssue(partial);
          
          // AUTO-SWITCH LOGIC:
          // Check if a story exists for the current lead. If so, switch to it immediately.
          // This handles the "Ghost Story" creation event.
          const allStories = [...partial.features, ...partial.columns];
          // We assume the signal_id in the story matches the lead-derived ID or we check the timestamp/order
          // For robustness, we check if the LAST story added corresponds to our current flow
          if (allStories.length > 0) {
              const newestStory = allStories[allStories.length - 1];
              // Simple heuristic: If we just commissioned, the newest story is likely ours.
              // A safer check: Does this story belong to a signal derived from this lead?
              // Ideally, lead.id and signal.id are linked. 
              // For now, we trust the newest story is the one we just made.
              if (newestStory.status === 'DRAFT' || newestStory.status === 'REVIEW') {
                  setActiveItemId(newestStory.id);
              }
          }
      });
  };

  const handleScan = async (overrideTargets?: string) => {
      const t = overrideTargets || targets;
      if (!t.trim()) return;
      const targetList = t.split(',').map(s => s.trim());
      await scanWire(targetList, useDemo);
  };
  
  const handleApplyProposal = async (p: Proposal, modifiers: { strict: boolean; toneLock: boolean }) => {
      if (!activeStory) return;
      await runProposal(activeStory.id, p, modifiers, (partial) => {
          setLatestIssue(partial);
      });
  };

  const handleApprove = (id: string) => {
      approveStory(id, (partial) => setLatestIssue(partial));
      setActiveItemId(null); 
  };

  const handleShipBatch = async () => {
      await shipBatch((partial) => setLatestIssue(partial));
  };

  return (
    <div className="fixed inset-0 bg-white text-zinc-900 font-sans z-50 flex flex-col antialiased">
      
      {/* HEADER */}
      <header className="h-14 border-b border-zinc-200 bg-white flex justify-between items-center px-4 shrink-0 z-50 shadow-sm relative">
          <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-black rounded flex items-center justify-center text-white font-display font-bold text-xs">M</div>
                  <span className="font-bold text-sm tracking-tight text-zinc-900">Modus <span className="text-zinc-400 font-normal">/ OPS</span></span>
              </div>
              <div className="h-6 w-px bg-zinc-200 mx-2"></div>
              
              {/* ROLE SWITCHER */}
              <div className="flex bg-zinc-100 p-1 rounded-md gap-1">
                  <button 
                    onClick={() => setActiveMode('EDITOR')}
                    className={`px-4 py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all ${activeMode === 'EDITOR' ? 'bg-white shadow-sm text-black ring-1 ring-black/5' : 'text-zinc-500 hover:text-zinc-900'}`}
                  >
                      Editor
                  </button>
                  <button 
                    onClick={() => setActiveMode('DESIGNER')}
                    className={`px-4 py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all ${activeMode === 'DESIGNER' ? 'bg-white shadow-sm text-black ring-1 ring-black/5' : 'text-zinc-500 hover:text-zinc-900'}`}
                  >
                      Designer
                  </button>
              </div>
          </div>
          
          <div className="flex items-center gap-6">
              {/* Status Pills */}
              <div className="flex items-center gap-2">
                  {isScanning && (
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                          <span className="text-[9px] font-bold tracking-wide">SCANNING</span>
                      </div>
                  )}
                  {isCommissioning && (
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                          <span className="text-[9px] font-bold tracking-wide">PROCESSING</span>
                      </div>
                  )}
              </div>
              
              <div className="h-6 w-px bg-zinc-200"></div>

              <button onClick={onCancel} className="text-zinc-400 hover:text-zinc-900 transition-colors hover:bg-zinc-100 p-2 rounded-full">
                  <span className="text-xl leading-none block h-5 w-3">×</span>
              </button>
          </div>
      </header>

      {/* VIEWPORT */}
      {activeMode === 'EDITOR' ? (
          <ContentMode 
              leads={inbox}
              working={working}
              basket={basket}
              activeLead={activeLead}
              activeStory={activeStory}
              activeDebate={activeDebate}
              logs={logs}
              isProcessing={isProcessing}
              isScanning={isScanning}
              isCommissioning={isCommissioning}
              onSelectLead={(id: string | null) => setActiveItemId(id)}
              onSelectStory={(id: string | null) => setActiveItemId(id)}
              onShipBatch={handleShipBatch}
              targets={targets}
              setTargets={setTargets}
              onScan={handleScan}
              onFeedScan={() => scanWire(['FEEDS'], useDemo)}
              useDemo={useDemo}
              channels={channels}
              onAddChannel={onAddChannel}
              onRemoveChannel={onRemoveChannel}
              latestIssue={latestIssue}
              onCommission={handleCommission}
              onAutopilot={() => {}}
              onPublish={onPublish}
              agentJobs={agentJobs}
              currentTemplate={currentTemplate}
              onSwitchTemplate={onSwitchTemplate}
              onApplyProposal={handleApplyProposal}
              onApproveStory={handleApprove}
          />
      ) : (
          <LayoutMode 
              issue={latestIssue || initialIssue}
              onUpdateIssue={(updated) => setLatestIssue(updated)}
              currentTemplate={currentTemplate}
              onSwitchTemplate={onSwitchTemplate}
          />
      )}

      {/* FOOTER BAR */}
      <div className="h-8 border-t border-zinc-200 bg-white flex items-center justify-between px-4 text-[10px] font-medium text-zinc-500 shrink-0 z-50">
          <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${dbStatus === 'CONNECTED' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                  <span>DB: {dbStatus}</span>
              </div>
              <span>v.0.0.9-beta</span>
          </div>
          <div className="font-mono text-zinc-400">{activeItemId ? `REF: ${activeItemId}` : 'IDLE'}</div>
      </div>
    </div>
  );
};
