
import React, { useState } from 'react';
import { ToggleGroup, ToneEQSlider } from './ui-primitives';
import { AgentLog, Lead, StoryArtifact, IssueContent, AgentJob, AgentRole, SourceMix, ToneProfile, Proposal } from '../../types';
import { AgentGrid } from './AgentGrid';
import { AGENT_ROSTER } from '../../services/agent-registry';

export interface CommissionConfigState {
    depth: 'Standard' | 'Deep';
    timeWindow: '24h' | '7d' | '30d';
    risk: 'Low' | 'Mid' | 'High';
    focusQuery: string;
    bannedWords: string;
    audience: 'General' | 'Expert' | 'Insider';
    temperature: number;
    sourceMix: SourceMix;
    toneProfile: ToneProfile;
    agentOverrides: Record<string, string>;
    activePreset: string;
}

export const DEFAULT_COMMISSION_CONFIG: CommissionConfigState = {
    depth: 'Standard',
    timeWindow: '7d',
    risk: 'Mid',
    focusQuery: '',
    bannedWords: '',
    audience: 'Expert',
    temperature: 0.7,
    sourceMix: { mainstream: true, indie: true, academic: false, social: false },
    toneProfile: { drama: 3, precision: 3, metaphor_density: 3, adjective_budget: 50, sentence_mode: 'MIXED' },
    agentOverrides: {},
    activePreset: 'Modus'
};

const TONE_PRESETS: Record<string, ToneProfile> = {
    'Modus': { drama: 3, precision: 3, metaphor_density: 3, adjective_budget: 50, sentence_mode: 'MIXED' },
    'Gonzo': { drama: 5, precision: 1, metaphor_density: 5, adjective_budget: 90, sentence_mode: 'LONG' },
    'Academic': { drama: 1, precision: 5, metaphor_density: 1, adjective_budget: 20, sentence_mode: 'TIGHT' },
    'Minimalist': { drama: 2, precision: 4, metaphor_density: 2, adjective_budget: 10, sentence_mode: 'TIGHT' }
};

const ProposalCard: React.FC<{ p: Proposal; onClick: () => void }> = ({ p, onClick }) => (
    <div className="p-3 bg-white border border-zinc-200 rounded-md shadow-sm hover:shadow-md transition-all cursor-pointer mb-2">
        <div className="flex justify-between items-start">
            <span className="text-[9px] font-bold uppercase text-zinc-500 bg-zinc-50 px-1 rounded">{p.agent}</span>
            <span className="text-[9px] font-mono text-zinc-400">{p.type}</span>
        </div>
        <p className="text-xs font-medium text-zinc-800 leading-tight my-2">{p.label}</p>
        <div className="flex justify-between items-center">
            <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1.5 rounded">{p.impact}</span>
            <button onClick={onClick} className="text-[9px] font-bold uppercase text-indigo-600 hover:underline">Apply</button>
        </div>
    </div>
);

interface NewsroomConsoleProps {
  logs: AgentLog[];
  isProcessing: boolean; 
  isCommissioning?: boolean; 
  selectedLead: Lead | undefined;
  activeStory: StoryArtifact | undefined;
  latestIssue: IssueContent | null;
  commissionConfig: CommissionConfigState;
  setCommissionConfig: (cfg: CommissionConfigState) => void;
  onCommission: () => void; 
  onAutopilot: () => void;
  onPublish: (issue: IssueContent) => void;
  onPublishArtifact?: (artifact: StoryArtifact) => void;
  isAutopilotActive?: boolean;
  onToggleAutopilot?: (active: boolean, theme: string, useDemo: boolean, onUpdate: (partial: IssueContent) => void) => void;
  agentJobs: Record<AgentRole, AgentJob>;
  currentTemplate: string;
  onSwitchTemplate: (key: string) => void;
  onApplyProposal: (p: Proposal, mods: { strict: boolean; toneLock: boolean }) => void;
  onApproveStory: (id: string) => void;
}

export const NewsroomConsole: React.FC<NewsroomConsoleProps> = ({
  isProcessing, isCommissioning = false, selectedLead, activeStory, 
  commissionConfig, setCommissionConfig, onCommission, 
  isAutopilotActive, agentJobs, onApplyProposal, onApproveStory
}) => {
  const [selectedAgent, setSelectedAgent] = useState<AgentRole | null>(null);

  const updateConfig = (updates: Partial<CommissionConfigState>) => {
      setCommissionConfig({ ...commissionConfig, ...updates });
  };

  const handlePresetChange = (presetName: string) => {
      if (TONE_PRESETS[presetName]) {
          updateConfig({ activePreset: presetName, toneProfile: TONE_PRESETS[presetName] });
      }
  };

  const updateTone = (key: keyof ToneProfile, value: number | string) => {
      updateConfig({ activePreset: 'Custom', toneProfile: { ...commissionConfig.toneProfile, [key]: value } });
  };

  const isDisabled = isCommissioning || (isProcessing && !isCommissioning) || isAutopilotActive;

  const proposals = activeStory?.pending_proposals && activeStory.pending_proposals.length > 0 
      ? activeStory.pending_proposals 
      : (activeStory ? [
          { id: 'p1', type: 'REWRITE', label: 'Sharpen the lede. Remove passive voice.', impact: 'Tone +12%', agent: 'EDITOR', scope: 'BODY', cost_estimate: 'Low' },
          { id: 'p2', type: 'HEADLINE_GEN', label: 'Generate higher voltage headlines.', impact: 'Risk +5%', agent: 'CRITIC', scope: 'HEADLINE', cost_estimate: 'Low' },
      ] : []);

  return (
    <div className="bg-white flex flex-col h-full relative z-20">
        
        {/* HEADER */}
        <div className="p-5 border-b border-zinc-200 bg-white flex justify-between items-center shrink-0">
            <h3 className="text-xs font-bold uppercase tracking-wide text-zinc-900 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Mission Control
            </h3>
            {isProcessing && <span className="text-[9px] font-mono text-zinc-400 animate-pulse">AGENTS BUSY</span>}
        </div>

        {/* TOP: AGENT GRID */}
        <div className="p-5 border-b border-zinc-100 bg-white shrink-0">
            <AgentGrid jobs={agentJobs} onAgentClick={(role) => setSelectedAgent(role)} />
        </div>

        {/* SCROLLABLE CONTEXT (Config or Story Tools) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 bg-zinc-50/50">
            
            {/* MODE 1: STORY EDITOR (Active Artifact) */}
            {activeStory && (
                <div className="animate-fade-in space-y-6">
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-500">Proposal Engine</span>
                            <span className="text-[9px] font-mono text-zinc-400">{proposals.length} Ready</span>
                        </div>
                        <div className="bg-white rounded border border-zinc-200 p-2 shadow-sm">
                            {proposals.map((p: any) => (
                                <ProposalCard key={p.id} p={p} onClick={() => onApplyProposal(p, { strict: false, toneLock: true })} />
                            ))}
                        </div>
                    </div>

                    <div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 block mb-3">Tone Physics</span>
                        <div className="bg-white p-4 rounded border border-zinc-200 shadow-sm">
                            <ToneEQSlider label="Drama" value={commissionConfig.toneProfile.drama} max={5} onChange={(v) => updateTone('drama', v)} />
                            <ToneEQSlider label="Precision" value={commissionConfig.toneProfile.precision} max={5} onChange={(v) => updateTone('precision', v)} />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button 
                            onClick={() => onApproveStory(activeStory.id)}
                            disabled={activeStory.status === 'APPROVED'}
                            className="w-full bg-zinc-900 text-white py-3 rounded text-xs font-bold uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50"
                        >
                            {activeStory.status === 'APPROVED' ? 'Approved' : 'Approve Artifact'}
                        </button>
                    </div>
                </div>
            )}

            {/* MODE 2: COMMISSIONING (Active Lead) */}
            {selectedLead && !activeStory && (
                 <div className="space-y-6 animate-fade-in">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wide text-indigo-600">Commission Config</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                              <label className="block text-[9px] font-bold text-zinc-400 mb-1.5 uppercase">Research Depth</label>
                              <div className="flex bg-white rounded border border-zinc-200 overflow-hidden">
                                  {['Standard', 'Deep'].map(m => (
                                      <button 
                                        key={m}
                                        onClick={() => updateConfig({ depth: m as any })}
                                        className={`flex-1 py-2 text-[10px] font-bold uppercase transition-all ${commissionConfig.depth === m ? 'bg-zinc-100 text-black' : 'text-zinc-400 hover:text-zinc-600'}`}
                                      >
                                          {m}
                                      </button>
                                  ))}
                              </div>
                          </div>
                          <div>
                              <label className="block text-[9px] font-bold text-zinc-400 mb-1.5 uppercase">Time Window</label>
                              <div className="flex bg-white rounded border border-zinc-200 overflow-hidden">
                                  {['24h', '7d', '30d'].map(t => (
                                      <button 
                                        key={t}
                                        onClick={() => updateConfig({ timeWindow: t as any })}
                                        className={`flex-1 py-2 text-[10px] font-bold uppercase transition-all ${commissionConfig.timeWindow === t ? 'bg-zinc-100 text-black' : 'text-zinc-400 hover:text-zinc-600'}`}
                                      >
                                          {t}
                                      </button>
                                  ))}
                              </div>
                          </div>
                        </div>

                        {/* TONE PHYSICS EQ */}
                        <div className="bg-white p-4 rounded border border-zinc-200 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Tone EQ</span>
                                <div className="flex gap-1">
                                    {Object.keys(TONE_PRESETS).map(preset => (
                                        <button
                                            key={preset}
                                            onClick={() => handlePresetChange(preset)}
                                            className={`px-2 py-1 text-[9px] font-bold uppercase rounded border transition-all ${
                                                commissionConfig.activePreset === preset 
                                                ? 'bg-black text-white border-black' 
                                                : 'bg-white text-zinc-400 border-zinc-100 hover:border-zinc-300'
                                            }`}
                                        >
                                            {preset}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <ToneEQSlider label="Drama" value={commissionConfig.toneProfile.drama} max={5} onChange={(v) => updateTone('drama', v)} />
                            <ToneEQSlider label="Precision" value={commissionConfig.toneProfile.precision} max={5} onChange={(v) => updateTone('precision', v)} />
                        </div>

                        <div className="pt-2">
                            <button 
                                onClick={onCommission}
                                disabled={isDisabled}
                                className="w-full bg-zinc-900 text-white hover:bg-black py-3 font-bold uppercase tracking-widest rounded text-xs transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:shadow-none"
                            >
                                Initialize Commission
                            </button>
                        </div>
                 </div>
            )}

            {/* MODE 3: EMPTY STATE (Wire Instructions) */}
            {!selectedLead && !activeStory && (
                <div className="h-full flex flex-col items-center justify-center text-zinc-400 opacity-60">
                    <div className="text-center">
                        <span className="block text-[10px] font-bold uppercase tracking-widest mb-1">Status: Idle</span>
                        <span className="text-[9px] font-mono">Select a signal from the Wire to begin.</span>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};
