
import React, { useState } from 'react';
import { IssueContent, AgentLog, Lead, StoryArtifact, Proposal } from '../types';
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
}

export const TheNewsroom: React.FC<NewsroomProps> = ({ 
    logs, isProcessing, isScanning = false, isCommissioning = false, dbStatus, scanWire, commissionStory, runAutopilot, runProposal, approveStory, shipBatch, leads, onPublish, onCancel,
    channels, onAddChannel, onRemoveChannel, onPublishArtifact, isAutopilotActive, onToggleAutopilot, agentJobs,
    currentTemplate, onSwitchTemplate
}) => {
  // MODE SWITCHER STATE
  const [activeMode, setActiveMode] = useState<'CONTENT' | 'LAYOUT'>('CONTENT');

  const [theme] = useState("The Synthetic Real");
  const [targets, setTargets] = useState(""); 
  const [useDemo] = useState(false);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [latestIssue, setLatestIssue] = useState<IssueContent | null>(null);

  const inbox = leads; 
  const working = latestIssue ? [...latestIssue.features, ...latestIssue.columns].filter(s => s.status !== 'PUBLISHED' && s.status !== 'APPROVED') : [];
  const basket = latestIssue ? [...latestIssue.features, ...latestIssue.columns].filter(s => s.status === 'APPROVED') : [];

  const activeLead = inbox.find(l => l.id === activeItemId);
  const activeStory = latestIssue ? [...latestIssue.features, ...latestIssue.columns].find(s => s.id === activeItemId) : undefined;
  const activeDebate = latestIssue?.debates.find(d => d.id === activeStory?.signal_id);
  
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
          const newStories = [...partial.features, ...partial.columns];
          if (newStories.length > 0) {
              const newest = newStories[newStories.length - 1];
              if (activeLead && newest.signal_id.includes(activeLead.id.replace('lead_',''))) {
                  setActiveItemId(newest.id); 
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
    <div className="fixed inset-0 bg-zinc-50 text-zinc-900 font-sans z-50 flex flex-col antialiased">
      
      {/* HEADER: Clean SaaS Style with Tabs */}
      <header className="h-14 border-b border-zinc-200 bg-white flex justify-between items-center px-6 shrink-0 z-20 shadow-sm">
          <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-black rounded flex items-center justify-center text-white font-display font-bold text-xs">M</div>
                  <span className="font-semibold text-sm tracking-tight text-zinc-900">Modus <span className="text-zinc-400 font-normal">/ OPS</span></span>
              </div>
              <div className="h-4 w-px bg-zinc-200 mx-2"></div>
              
              {/* MODE TABS */}
              <div className="flex bg-zinc-100 p-1 rounded-md gap-1">
                  <button 
                    onClick={() => setActiveMode('CONTENT')}
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all ${activeMode === 'CONTENT' ? 'bg-white shadow-sm text-black' : 'text-zinc-500 hover:text-zinc-900'}`}
                  >
                      1. Content Mode
                  </button>
                  <button 
                    onClick={() => setActiveMode('LAYOUT')}
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all ${activeMode === 'LAYOUT' ? 'bg-white shadow-sm text-black' : 'text-zinc-500 hover:text-zinc-900'}`}
                  >
                      2. Layout Mode
                  </button>
              </div>
          </div>
          
          <div className="flex items-center gap-6">
              {/* Status Pills */}
              <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full border ${isScanning ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-white border-zinc-200 text-zinc-500'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${isScanning ? 'bg-amber-500 animate-pulse' : 'bg-zinc-300'}`}></div>
                      <span className="text-[10px] font-semibold tracking-wide">WIRE</span>
                  </div>
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full border ${isProcessing ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-zinc-200 text-zinc-500'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${isProcessing ? 'bg-indigo-500 animate-pulse' : 'bg-zinc-300'}`}></div>
                      <span className="text-[10px] font-semibold tracking-wide">AGENTS</span>
                  </div>
              </div>
              
              <div className="h-4 w-px bg-zinc-200"></div>

              <button onClick={onCancel} className="text-zinc-400 hover:text-zinc-900 transition-colors">
                  <span className="text-xl leading-none">×</span>
              </button>
          </div>
      </header>

      {/* DUAL MODE VIEWPORT */}
      {activeMode === 'CONTENT' ? (
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
              onSelectLead={(id) => setActiveItemId(id)}
              onSelectStory={(id) => setActiveItemId(id)}
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
              issue={latestIssue || {
                  meta: { run_id: 'init', issue_id: '', vol: '', theme: '', date: '', editor: '', status: 'COLLECTING' },
                  ticker: [], cover: { eyebrow: '', title: '', deck: '', coverlines: [], imgPrompt: '' },
                  features: [], columns: [], drops: [], edit: [], atelier: [], debates: [], index_keys: [], colophon: { contributors: [], sources: [], corrections: [] }
              }}
              onUpdateIssue={(updated) => setLatestIssue(updated)}
              currentTemplate={currentTemplate}
              onSwitchTemplate={onSwitchTemplate}
          />
      )}

      {/* STATUS BAR */}
      <div className="h-8 border-t border-zinc-200 bg-white flex items-center justify-between px-6 text-[10px] font-medium text-zinc-500 shrink-0">
          <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${dbStatus === 'CONNECTED' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
              <span>Database: {dbStatus === 'CONNECTED' ? 'Connected' : 'Offline'}</span>
          </div>
          <div className="font-mono">{activeItemId ? `ID: ${activeItemId}` : 'IDLE'}</div>
      </div>
    </div>
  );
};
