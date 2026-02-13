
import React, { useState } from 'react';
import { ToggleGroup, TeamStream, ToneEQSlider, JsonInspector } from './ui-primitives';
import { AgentLog, Lead, StoryArtifact, IssueContent, AgentJob, AgentRole, SourceMix, ToneProfile } from '../../types';
import { AgentGrid } from './AgentGrid';
import { AGENT_ROSTER } from '../../services/agent-registry';
import { TEMPLATE_REGISTRY } from '../../services/templates';

// --- SHARED CONFIG DEFINITIONS ---
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

interface NewsroomConsoleProps {
  logs: AgentLog[];
  isProcessing: boolean; 
  isCommissioning?: boolean; 
  selectedLead: Lead | undefined;
  activeStory: StoryArtifact | undefined;
  latestIssue: IssueContent | null;
  
  // Controlled Config Props
  commissionConfig: CommissionConfigState;
  setCommissionConfig: (cfg: CommissionConfigState) => void;
  onCommission: () => void; // Trigger action

  onAutopilot: () => void;
  onPublish: (issue: IssueContent) => void;
  onPublishArtifact?: (artifact: StoryArtifact) => void;
  isAutopilotActive?: boolean;
  onToggleAutopilot?: (active: boolean, theme: string, useDemo: boolean, onUpdate: (partial: IssueContent) => void) => void;
  agentJobs: Record<AgentRole, AgentJob>;
  currentTemplate: string;
  onSwitchTemplate: (key: string) => void;
}

export const NewsroomConsole: React.FC<NewsroomConsoleProps> = ({
  logs, isProcessing, isCommissioning = false, selectedLead, activeStory, latestIssue, 
  commissionConfig, setCommissionConfig, onCommission, 
  onAutopilot, onPublish, onPublishArtifact, 
  isAutopilotActive, onToggleAutopilot, agentJobs, currentTemplate, onSwitchTemplate
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentRole | null>(null);

  // Helper to update specific fields
  const updateConfig = (updates: Partial<CommissionConfigState>) => {
      setCommissionConfig({ ...commissionConfig, ...updates });
  };

  // Tone Handlers
  const handlePresetChange = (presetName: string) => {
      if (TONE_PRESETS[presetName]) {
          updateConfig({ 
              activePreset: presetName, 
              toneProfile: TONE_PRESETS[presetName] 
          });
      }
  };

  const updateTone = (key: keyof ToneProfile, value: number | string) => {
      updateConfig({
          activePreset: 'Custom',
          toneProfile: { ...commissionConfig.toneProfile, [key]: value }
      });
  };

  const toggleSource = (key: keyof SourceMix) => {
      updateConfig({
          sourceMix: { ...commissionConfig.sourceMix, [key]: !commissionConfig.sourceMix[key] }
      });
  };

  const setAgentOverride = (role: string, val: string) => {
      updateConfig({
          agentOverrides: { ...commissionConfig.agentOverrides, [role]: val }
      });
  };

  const isDisabled = isCommissioning || (isProcessing && !isCommissioning) || isAutopilotActive;

  return (
    <div className="bg-white flex flex-col h-full border-l border-zinc-200 shadow-sm relative z-20">
        
        {/* HEADER */}
        <div className="p-5 border-b border-zinc-200 bg-white">
            <h3 className="text-xs font-bold uppercase tracking-wide text-zinc-900 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Mission Control
            </h3>
        </div>

        {/* METAMORPHOSIS ENGINE (Template Switcher) */}
        <div className="px-5 pt-5 border-b border-zinc-100 pb-5">
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 block mb-3">Layout Metamorphosis</span>
            <div className="space-y-2">
                {Object.values(TEMPLATE_REGISTRY).map(tpl => (
                    <button
                        key={tpl.key}
                        onClick={() => onSwitchTemplate(tpl.key)}
                        className={`w-full text-left px-3 py-2 rounded border transition-all text-xs flex justify-between items-center ${
                            currentTemplate === tpl.key 
                            ? 'bg-zinc-900 text-white border-black shadow-md' 
                            : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
                        }`}
                    >
                        <span className="font-bold">{tpl.name}</span>
                        {currentTemplate === tpl.key && <span className="text-[9px] uppercase tracking-widest text-zinc-400">Active</span>}
                    </button>
                ))}
            </div>
        </div>

        {/* AGENT ROSTER */}
        <div className="px-5 pt-5 pb-2">
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 block mb-3">Active Personnel</span>
            <AgentGrid jobs={agentJobs} onAgentClick={(role) => setSelectedAgent(role)} />
        </div>

        {/* AGENT INSPECTOR OVERLAY */}
        {selectedAgent && (
            <div className="absolute inset-0 z-30 bg-white/95 backdrop-blur-sm p-6 flex flex-col animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <span className={`text-lg p-2 rounded-md bg-zinc-100 text-zinc-600`}>
                            {AGENT_ROSTER[selectedAgent].icon}
                        </span>
                        <div>
                            <h4 className="font-display text-xl font-bold">{AGENT_ROSTER[selectedAgent].name}</h4>
                            <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">{AGENT_ROSTER[selectedAgent].role} Unit</span>
                        </div>
                    </div>
                    <button onClick={() => setSelectedAgent(null)} className="p-2 hover:bg-zinc-100 rounded-full">×</button>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                    <div className="mb-6">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-2">Prime Directive</span>
                        <p className="p-4 bg-zinc-50 border border-zinc-200 rounded text-sm text-zinc-700 leading-relaxed font-serif italic">
                            "{AGENT_ROSTER[selectedAgent].description}"
                        </p>
                    </div>

                    <div className="mb-6">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-2">Current Status</span>
                        <div className="p-3 border border-zinc-200 rounded flex justify-between items-center">
                            <span className="text-xs font-medium">{agentJobs[selectedAgent].status}</span>
                            <span className="text-[10px] font-mono text-zinc-400">Last Active: {new Date(agentJobs[selectedAgent].lastActive).toLocaleTimeString()}</span>
                        </div>
                    </div>

                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 block mb-2">Override Directive</span>
                        <textarea 
                            className="w-full p-3 text-xs border border-zinc-300 rounded focus:border-indigo-500 focus:outline-none min-h-[100px]"
                            placeholder={`Inject temporary instruction for ${AGENT_ROSTER[selectedAgent].name}...`}
                            value={commissionConfig.agentOverrides[selectedAgent] || ''}
                            onChange={(e) => setAgentOverride(selectedAgent, e.target.value)}
                        />
                    </div>
                </div>
            </div>
        )}

        {/* DYNAMIC CONTENT AREA */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-5 pb-5">
            
            {/* COMMISSIONING FORM */}
            {selectedLead && !activeStory && (
                 <div className="space-y-6 animate-fade-in border-t border-zinc-100 pt-6 mt-2">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wide text-indigo-600">Commission Config</span>
                        </div>
                        
                        {/* BASIC SETTINGS */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-[10px] font-semibold text-zinc-500 mb-2 uppercase">Research</label>
                              <div className="flex bg-zinc-100 p-1 rounded-md border border-zinc-200">
                                  {['Standard', 'Deep'].map(m => (
                                      <button 
                                        key={m}
                                        onClick={() => updateConfig({ depth: m as any })}
                                        className={`flex-1 py-1.5 text-[10px] font-medium transition-all rounded-sm ${commissionConfig.depth === m ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}
                                      >
                                          {m}
                                      </button>
                                  ))}
                              </div>
                          </div>
                          <div>
                              <label className="block text-[10px] font-semibold text-zinc-500 mb-2 uppercase">Window</label>
                              <div className="flex bg-zinc-100 p-1 rounded-md border border-zinc-200">
                                  {['24h', '7d', '30d'].map(t => (
                                      <button 
                                        key={t}
                                        onClick={() => updateConfig({ timeWindow: t as any })}
                                        className={`flex-1 py-1.5 text-[10px] font-medium transition-all rounded-sm ${commissionConfig.timeWindow === t ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}
                                      >
                                          {t}
                                      </button>
                                  ))}
                              </div>
                          </div>
                        </div>

                        {/* TONE PHYSICS EQ */}
                        <div className="bg-zinc-50 p-4 rounded border border-zinc-100">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Tone EQ</span>
                                <div className="flex gap-1">
                                    {Object.keys(TONE_PRESETS).map(preset => (
                                        <button
                                            key={preset}
                                            onClick={() => handlePresetChange(preset)}
                                            className={`px-2 py-0.5 text-[8px] font-bold uppercase rounded border transition-all ${
                                                commissionConfig.activePreset === preset 
                                                ? 'bg-indigo-600 text-white border-indigo-600' 
                                                : 'bg-white text-zinc-400 border-zinc-200 hover:border-zinc-300'
                                            }`}
                                        >
                                            {preset}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <ToneEQSlider label="Drama" value={commissionConfig.toneProfile.drama} max={5} onChange={(v) => updateTone('drama', v)} />
                            <ToneEQSlider label="Precision" value={commissionConfig.toneProfile.precision} max={5} onChange={(v) => updateTone('precision', v)} />
                            <ToneEQSlider label="Metaphor" value={commissionConfig.toneProfile.metaphor_density} max={5} onChange={(v) => updateTone('metaphor_density', v)} />
                            
                            <div className="mt-4 flex justify-between">
                                <span className="text-[9px] font-bold uppercase text-zinc-400">Adj. Budget</span>
                                <span className="text-[9px] font-mono font-bold text-zinc-600">{commissionConfig.toneProfile.adjective_budget}%</span>
                            </div>
                            <div className="w-full bg-zinc-200 h-1 rounded-full mt-1 relative cursor-pointer" onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = e.clientX - rect.left;
                                const percent = Math.round((x / rect.width) * 100);
                                updateTone('adjective_budget', Math.max(0, Math.min(100, percent)));
                            }}>
                                <div className="bg-zinc-500 h-1 rounded-full transition-all" style={{width: `${commissionConfig.toneProfile.adjective_budget}%`}}></div>
                            </div>
                        </div>

                        {/* ADVANCED TOGGLE */}
                        <button 
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="w-full text-center text-[10px] uppercase font-bold text-zinc-400 hover:text-zinc-600 border-b border-zinc-100 pb-2"
                        >
                            {showAdvanced ? 'Hide Advanced' : 'Show Advanced Settings'}
                        </button>

                        {/* ADVANCED SETTINGS */}
                        {showAdvanced && (
                            <div className="space-y-6 animate-fade-in">
                                <div>
                                    <label className="block text-[10px] font-semibold text-zinc-500 mb-2 uppercase">Source Vectors</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.keys(commissionConfig.sourceMix).map(key => {
                                            const k = key as keyof SourceMix;
                                            const active = commissionConfig.sourceMix[k];
                                            return (
                                                <button 
                                                    key={key}
                                                    onClick={() => toggleSource(k)}
                                                    className={`
                                                        flex items-center justify-between px-2 py-1.5 border rounded text-[10px] font-medium uppercase transition-all
                                                        ${active ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-zinc-200 text-zinc-400'}
                                                    `}
                                                >
                                                    {key}
                                                    <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-indigo-500' : 'bg-zinc-200'}`}></div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-[10px] font-semibold text-zinc-500 mb-2 uppercase">Negative Prompt</label>
                                    <input 
                                        value={commissionConfig.bannedWords}
                                        onChange={(e) => updateConfig({ bannedWords: e.target.value })}
                                        placeholder="Words to ban (comma separated)..."
                                        className="w-full border border-zinc-300 rounded px-2 py-1.5 text-xs focus:border-black outline-none"
                                    />
                                </div>

                                {/* LEAD INSPECTOR */}
                                <JsonInspector data={selectedLead} label="Raw Signal Data" />
                            </div>
                        )}
                        
                        <div className="pt-2 opacity-50 hover:opacity-100 transition-opacity">
                            <button 
                                onClick={onCommission}
                                disabled={isDisabled}
                                className="w-full border border-zinc-300 text-zinc-500 hover:text-black py-2 font-semibold rounded-md text-xs transition-colors"
                            >
                                Execute (Secondary)
                            </button>
                        </div>
                 </div>
            )}
        </div>

        {/* TEAM CHAT (Sticky Bottom) */}
        <div className="border-t border-zinc-200 bg-zinc-50 flex flex-col h-[200px]">
            <div className="px-4 py-2 border-b border-zinc-200 bg-white flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Team Comms</span>
                {isProcessing && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
            </div>
            <TeamStream logs={logs.slice(-50)} className="flex-1" />
        </div>
    </div>
  );
};
