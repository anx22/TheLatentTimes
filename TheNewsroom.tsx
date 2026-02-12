
import React, { useState } from 'react';
import { IssueContent, AgentLog, Lead, DebateArtifact, StoryArtifact, Proposal } from '../types';
import { RunConfig, DbStatus } from '../hooks/useNewsroom'; 
import { NewsroomConsole } from './newsroom/NewsroomConsole';
import { NewsroomSidebar } from './newsroom/NewsroomSidebar';
import { NewsroomBoard } from './newsroom/NewsroomBoard';
import { AssetWorkbench } from './newsroom/AssetWorkbench';

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
  // NEW: Pass current template info
  currentTemplate: string;
  onSwitchTemplate: (key: string) => void;
}

export const TheNewsroom: React.FC<NewsroomProps> = ({ 
    logs, isProcessing, isScanning = false, isCommissioning = false, dbStatus, scanWire, commissionStory, runAutopilot, runProposal, approveStory, shipBatch, leads, onPublish, onCancel,
    channels, onAddChannel, onRemoveChannel, onPublishArtifact, isAutopilotActive, onToggleAutopilot, agentJobs,
    currentTemplate, onSwitchTemplate
}) => {
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
              setActiveItemId(newest.id); 
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
    <div className="fixed inset-0 bg-paper text-foreground font-sans z-50 flex flex-col antialiased selection:bg-accent selection:text-white">
      
      {/* VOGUE HEADER */}
      <header className="h-16 border-b border-border bg-white flex justify-between items-center px-8 shrink-0 select-none z-20 relative shadow-sm">
          <div className="flex items-baseline gap-6">
              <span className="font-display font-bold text-3xl tracking-tight">VOGUE <span className="text-accent font-light italic">/ AI</span></span>
              <div className="flex gap-6 text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400 mt-1">
                  <span className="text-black">Workbench</span>
                  <span className="hover:text-black cursor-pointer transition-colors">Archive</span>
                  <span className="hover:text-black cursor-pointer transition-colors">Personnel</span>
                  <span className="hover:text-black cursor-pointer transition-colors">Studio</span>
              </div>
          </div>
          <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${isScanning || isProcessing ? 'bg-accent animate-pulse' : 'bg-green-500'}`}></div>
                  <span className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase">
                      {isScanning ? 'Wire Active' : isProcessing ? 'Agents Working' : 'GPU Cluster: Idle'}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-300">|</span>
                  <span className="text-[10px] font-mono text-neutral-400">SENSORS 12MS</span>
              </div>
              <button className="bg-accent text-white px-4 py-2 text-[10px] font-bold tracking-[0.15em] uppercase hover:bg-black transition-colors">
                  Issue 4402 Preview
              </button>
              <button onClick={onCancel} className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-[10px] font-bold text-neutral-500 hover:bg-black hover:text-white transition-colors">
                  EV
              </button>
          </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden relative">
          
          {/* LEFT: SIDEBAR */}
          <div className="w-[60px] hover:w-[320px] transition-all duration-300 border-r border-border bg-white z-10 flex flex-col group overflow-hidden shadow-[4px_0_20px_rgba(0,0,0,0.02)]">
               <div className="h-full w-[320px] shrink-0">
                  <NewsroomSidebar 
                    targets={targets}
                    setTargets={setTargets}
                    onScan={handleScan}
                    onFeedScan={() => scanWire(['FEEDS'], useDemo)}
                    leads={[]} 
                    selectedLeadId={null}
                    onSelectLead={() => {}}
                    useDemo={useDemo}
                    channels={channels}
                    onAddChannel={onAddChannel}
                    onRemoveChannel={onRemoveChannel}
                    isScanning={isScanning}
                  />
               </div>
          </div>

          {/* CENTER: KANBAN BOARD */}
          <NewsroomBoard 
             inbox={inbox}
             working={working}
             basket={basket}
             onSelectLead={(l) => setActiveItemId(l.id)}
             onSelectStory={(s) => setActiveItemId(s.id)}
             activeItemId={activeItemId || undefined}
             onShipBatch={handleShipBatch}
          />

          {/* RIGHT: SLIDING WORKBENCH */}
          <div 
             className={`
                fixed inset-y-0 right-0 bg-white shadow-2xl transition-transform duration-500 ease-out z-30 flex
                ${activeItemId ? 'translate-x-0 w-[calc(100%-60px)] md:w-[75%]' : 'translate-x-full w-0'}
             `}
             style={{ top: '4rem', bottom: '2.5rem' }} // Below header, above footer
          >
             {/* If Lead selected: Show Commission Console */}
             {activeLead && (
                 <div className="flex w-full">
                     <div className="flex-1 p-12 overflow-y-auto bg-paper">
                        <div className="max-w-3xl mx-auto bg-white p-12 shadow-sm border border-neutral-100 min-h-full">
                            <span className="text-[10px] font-bold text-accent tracking-[0.2em] uppercase mb-4 block">Incoming Signal</span>
                            <h2 className="text-5xl font-display font-medium mb-8 leading-[1.1]">{activeLead.headline}</h2>
                            <p className="text-neutral-600 font-display text-xl leading-relaxed">{activeLead.context}</p>
                            
                            <div className="mt-12 grid grid-cols-2 gap-8 border-t border-neutral-100 pt-8">
                                <div>
                                    <span className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-2 font-bold">Source</span>
                                    <div className="font-mono text-xs text-black">{activeLead.source_ref || "Unknown Source"}</div>
                                </div>
                                <div>
                                    <span className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-2 font-bold">Why Now</span>
                                    <div className="font-sans text-xs text-black">{activeLead.why_now}</div>
                                </div>
                            </div>
                        </div>
                     </div>
                     <div className="w-[400px] border-l border-border bg-white">
                        <NewsroomConsole 
                             logs={logs}
                             isProcessing={isProcessing}
                             isCommissioning={isCommissioning}
                             selectedLead={activeLead}
                             activeStory={undefined}
                             latestIssue={latestIssue}
                             onCommission={handleCommission}
                             onAutopilot={() => {}}
                             onPublish={onPublish}
                             agentJobs={agentJobs}
                             currentTemplate={currentTemplate}
                             onSwitchTemplate={onSwitchTemplate}
                        />
                     </div>
                     <button onClick={() => setActiveItemId(null)} className="absolute top-6 right-6 text-2xl text-neutral-400 hover:text-black transition-colors">×</button>
                 </div>
             )}

             {/* If Story selected: Show Workbench */}
             {activeStory && (
                 <div className="w-full h-full">
                     <AssetWorkbench 
                        story={activeStory}
                        debate={activeDebate}
                        onApplyProposal={handleApplyProposal}
                        onApproveStory={handleApprove}
                        onClose={() => setActiveItemId(null)}
                     />
                 </div>
             )}
          </div>

      </div>

      {/* FOOTER STATUS BAR */}
      <div className="h-10 bg-neutral-900 text-white flex items-center justify-between px-6 text-[9px] font-mono tracking-wider shrink-0 z-50">
          <div className="flex gap-6">
              <span className="flex items-center gap-2 text-accent">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
                  LIVE SYNC
              </span>
              <span className="text-neutral-500">AUTO-SAVED 12S AGO</span>
          </div>
          <div className="flex gap-6 text-neutral-500">
              <span>{activeStory ? `DRAFT: ${activeStory.id.toUpperCase()}` : 'NO ACTIVE ARTIFACT'}</span>
              <span>WORDS: {activeStory ? activeStory.body.join(' ').split(' ').length : 0}</span>
          </div>
      </div>
    </div>
  );
};
