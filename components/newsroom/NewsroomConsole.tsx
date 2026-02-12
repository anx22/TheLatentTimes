
import React, { useState, useEffect } from 'react';
import { LogStream, ToggleGroup } from './ui-primitives';
import { AgentLog, Lead, StoryArtifact, IssueContent, AgentJob, AgentRole } from '../../types';
import { AgentGrid } from './AgentGrid';

interface NewsroomConsoleProps {
  logs: AgentLog[];
  isProcessing: boolean; 
  isCommissioning?: boolean; 
  selectedLead: Lead | undefined;
  activeStory: StoryArtifact | undefined;
  latestIssue: IssueContent | null;
  onCommission: (config: any) => void;
  onAutopilot: () => void;
  onPublish: (issue: IssueContent) => void;
  onPublishArtifact?: (artifact: StoryArtifact) => void;
  onReset?: () => void; 
  // Autopilot
  isAutopilotActive?: boolean;
  onToggleAutopilot?: (active: boolean, theme: string, useDemo: boolean, onUpdate: (partial: IssueContent) => void) => void;
  // NEW: Agent Jobs for Visualization
  agentJobs: Record<AgentRole, AgentJob>;
}

export const NewsroomConsole: React.FC<NewsroomConsoleProps> = ({
  logs, isProcessing, isCommissioning = false, selectedLead, activeStory, latestIssue, onCommission, onAutopilot, onPublish, onPublishArtifact, onReset,
  isAutopilotActive, onToggleAutopilot, agentJobs
}) => {
  // Config State
  const [depth, setDepth] = useState<'Standard' | 'Deep'>('Standard');
  const [timeWindow, setTimeWindow] = useState<'24h' | '7d' | '30d'>('7d');
  const [voice, setVoice] = useState<'Modus' | 'Gonzo' | 'Academic' | 'Minimalist'>('Modus');
  const [risk, setRisk] = useState<'Low' | 'Mid' | 'High'>('Mid');
  
  // Advanced State
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [focusQuery, setFocusQuery] = useState('');
  const [bannedWords, setBannedWords] = useState('');
  const [audience, setAudience] = useState<'General' | 'Expert' | 'Insider'>('Expert');
  const [temperature, setTemperature] = useState(0.7);
  
  // Local UI State
  const [isShipped, setIsShipped] = useState(false);
  const [expandLogs, setExpandLogs] = useState(false);

  useEffect(() => {
      // Reset shipped state when a new story is loaded
      if (activeStory) {
          setIsShipped(false);
      }
  }, [activeStory?.id]);

  const handleCommissionClick = () => {
    setIsShipped(false);
    onCommission({
        depth,
        timeWindow,
        voice,
        risk,
        focusQuery,
        bannedWords,
        audience,
        temperature
    });
  };

  const handleShipToLive = () => {
      if (activeStory && onPublishArtifact) {
          onPublishArtifact(activeStory);
          setIsShipped(true);
      } else if (latestIssue) {
          onPublish(latestIssue);
          setIsShipped(true);
      }
  };

  // NOTE: isProcessing usually tracks local work. 
  // If cloud autopilot is active, we might not be locally processing, 
  // but we should still disable manual controls to prevent collision.
  const isDisabled = isCommissioning || (isProcessing && !isCommissioning) || isAutopilotActive;

  const renderMainButton = () => {
      if (isAutopilotActive) {
          return (
              <div className="w-full bg-accent/10 border border-accent/30 rounded-sm h-14 flex flex-col items-center justify-center gap-1 animate-pulse">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-accent">Remote Uplink Active</span>
                  <span className="text-[9px] font-mono text-neutral-400">Monitoring Cloud Agent...</span>
              </div>
          );
      }

      if (isDisabled) {
          // Find the active agent job
          const activeJob = Object.values(agentJobs).find(j => j.status === 'WORKING');
          const progress = activeJob ? activeJob.progress : 0;
          
          return (
              <div className="w-full bg-neutral-900 border border-neutral-800 rounded-sm relative overflow-hidden h-14 select-none">
                  {/* Progress Bar Background */}
                  <div 
                    className="absolute top-0 left-0 bottom-0 bg-neutral-800 transition-all duration-500 ease-out" 
                    style={{ width: `${progress}%` }}
                  ></div>
                  
                  <div className="relative z-10 w-full h-full flex flex-col items-center justify-center gap-0.5">
                      <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 border-2 border-neutral-500 border-t-accent rounded-full animate-spin"></div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white">
                              {activeJob ? `AGENT: ${activeJob.agentId.replace('agent_', '').toUpperCase()}` : 'ORCHESTRATING...'}
                          </span>
                      </div>
                      <span className="text-[9px] font-mono text-neutral-400 max-w-[90%] truncate px-2">
                          {activeJob?.currentTask || "Initializing neural mesh..."}
                      </span>
                  </div>
              </div>
          );
      }

      if (activeStory) {
          if (isShipped) {
              return (
                  <button 
                    onClick={onReset}
                    className="w-full border border-neutral-700 hover:bg-white hover:text-black text-white py-4 font-bold uppercase tracking-widest text-[10px] transition-all rounded-sm"
                  >
                      Initialize Next Assignment
                  </button>
              );
          }
          return (
              <button 
                onClick={handleShipToLive}
                className="w-full bg-white hover:bg-neutral-200 text-black py-4 font-bold uppercase tracking-widest text-[10px] transition-all rounded-sm shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                  Deploy to Live Stream
              </button>
          );
      }

      if (selectedLead) {
          return (
              <button 
                onClick={handleCommissionClick}
                className="w-full bg-accent hover:bg-red-600 text-white py-4 font-bold uppercase tracking-widest text-[10px] transition-colors shadow-lg shadow-accent/20 rounded-sm"
              >
                  Commission Agents
              </button>
          );
      }

      return (
          <button disabled className="w-full border border-neutral-800 text-neutral-600 py-4 font-bold uppercase tracking-widest text-[10px] cursor-not-allowed rounded-sm">
              Select Signal to Commission
          </button>
      );
  };

  return (
    <div className="w-[380px] bg-[#050505] flex flex-col border-l border-neutral-900 shrink-0 h-full max-h-screen">
        
        {/* SCROLLABLE AREA: Agent Status + Configuration Forms */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-6 block border-b border-neutral-900 pb-3">Commissioning Console</span>
            
            {/* NEW: AGENT VISUALIZATION */}
            <AgentGrid jobs={agentJobs} />

            {/* CONFIGURATION FORM */}
            {!activeStory && selectedLead && !isDisabled && (
                 <div className="space-y-4 animate-fade-in mb-4">
                        {/* STANDARD CONTROLS */}
                        <div className="grid grid-cols-2 gap-4 mb-2">
                          <div className="col-span-1">
                              <label className="block text-[10px] font-bold text-neutral-400 mb-2 uppercase tracking-widest">Mode</label>
                              <button 
                                  onClick={() => setDepth(d => d === 'Standard' ? 'Deep' : 'Standard')} 
                                  className={`w-full py-2.5 border text-[10px] font-bold uppercase rounded-sm transition-colors ${depth === 'Deep' ? 'bg-neutral-800 text-white border-neutral-600' : 'border-neutral-800 text-neutral-500 hover:bg-neutral-900'}`}
                              >
                                  {depth}
                              </button>
                          </div>
                          <div className="col-span-1">
                              <label className="block text-[10px] font-bold text-neutral-400 mb-2 uppercase tracking-widest">Window</label>
                              <button 
                                  onClick={() => setTimeWindow(t => t === '24h' ? '7d' : t === '7d' ? '30d' : '24h')} 
                                  className="w-full py-2.5 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-900 text-[10px] font-bold uppercase rounded-sm transition-colors"
                              >
                                  {timeWindow}
                              </button>
                          </div>
                        </div>

                        <ToggleGroup 
                          label="Editorial Voice" 
                          options={['Modus', 'Gonzo', 'Academic', 'Minimalist']} 
                          value={voice} 
                          onChange={setVoice} 
                        />

                        <ToggleGroup 
                          label="Voltage / Risk" 
                          options={['Low', 'Mid', 'High']} 
                          value={risk} 
                          onChange={setRisk} 
                        />

                        {/* FINE TUNING TOGGLE */}
                        <button 
                          onClick={() => setShowAdvanced(!showAdvanced)}
                          className="w-full text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-white py-3 flex items-center justify-between border-t border-neutral-800 mt-2 hover:bg-neutral-900 px-2 rounded-sm transition-colors"
                        >
                          <span>Fine-Tune Parameters</span>
                          <span>{showAdvanced ? '-' : '+'}</span>
                        </button>

                        {showAdvanced && (
                          <div className="space-y-5 pt-3 border-t border-neutral-800 animate-fade-in px-1">
                              {/* AUDIENCE SELECTOR */}
                              <ToggleGroup 
                                  label="Audience" 
                                  options={['General', 'Expert', 'Insider']} 
                                  value={audience} 
                                  onChange={setAudience} 
                              />
                              
                              {/* SEARCH OVERRIDE */}
                              <div>
                                  <label className="block text-[10px] font-bold text-neutral-400 mb-2 uppercase tracking-widest">Focus Query Override</label>
                                  <input 
                                      value={focusQuery}
                                      onChange={(e) => setFocusQuery(e.target.value)}
                                      placeholder="Force specific search terms..."
                                      className="w-full bg-neutral-900 border border-neutral-800 p-2.5 text-xs text-white focus:border-accent outline-none font-mono placeholder-neutral-600 rounded-sm"
                                  />
                              </div>

                              {/* NEGATIVE PROMPTS */}
                              <div>
                                  <label className="block text-[10px] font-bold text-neutral-400 mb-2 uppercase tracking-widest">Negative Prompts (CSV)</label>
                                  <input 
                                      value={bannedWords}
                                      onChange={(e) => setBannedWords(e.target.value)}
                                      placeholder="delve, tapestry, bustling..."
                                      className="w-full bg-neutral-900 border border-neutral-800 p-2.5 text-xs text-white focus:border-accent outline-none font-mono placeholder-neutral-600 rounded-sm"
                                  />
                              </div>
                              
                              {/* TEMPERATURE */}
                              <div>
                                  <div className="flex justify-between mb-3">
                                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Model Entropy</label>
                                      <span className="text-[10px] font-mono text-neutral-300 bg-neutral-800 px-1.5 rounded">{temperature}</span>
                                  </div>
                                  <input 
                                      type="range" 
                                      min="0" max="1" step="0.1"
                                      value={temperature}
                                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                                      className="w-full h-1.5 bg-neutral-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent"
                                  />
                              </div>
                          </div>
                        )}
                 </div>
            )}
            
            {/* IDLE / DONE STATES IN SCROLL AREA */}
            {!activeStory && !selectedLead && !isDisabled && (
                <div className="text-center py-12 opacity-40 border border-dashed border-neutral-800 rounded-sm">
                    <span className="text-[10px] uppercase tracking-widest block mb-2">Console Idle</span>
                    <p className="text-xs text-neutral-600">Select a lead from the Wire to configure.</p>
                </div>
            )}
            
            {activeStory && (
                 <div className="p-4 bg-neutral-900/50 border border-neutral-800 rounded text-center mb-4">
                     <span className={`text-xs ${isShipped ? 'text-emerald-500' : 'text-neutral-300'} font-bold uppercase tracking-wider`}>
                        {isShipped ? 'Artifact Deployed' : 'Review Complete'}
                     </span>
                 </div>
            )}

        </div>

        {/* FIXED ACTION FOOTER */}
        <div className="p-5 bg-[#0A0A0A] border-t border-neutral-900 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-10">
            {renderMainButton()}
            
            {/* AUTOPILOT TOGGLE (REMOTE MODE) */}
            <div className="mt-3">
                {onToggleAutopilot ? (
                    <button 
                        onClick={() => onToggleAutopilot && onToggleAutopilot(!isAutopilotActive, 'The Synthetic Real', false, () => {})}
                        disabled={isDisabled && !isAutopilotActive}
                        className={`w-full py-3 font-bold uppercase tracking-widest text-[9px] transition-all flex items-center justify-center gap-2 rounded-sm border ${isAutopilotActive ? 'bg-accent text-white border-accent' : 'border-neutral-800 text-neutral-500 hover:text-white hover:border-neutral-600'}`}
                    >
                        <span className={`w-1.5 h-1.5 rounded-full ${isAutopilotActive ? 'bg-white animate-pulse' : 'bg-neutral-600'}`}></span>
                        {isAutopilotActive ? 'KILL SWITCH (STOP AGENT)' : 'START CLOUD AGENT'}
                    </button>
                ) : (
                    <button 
                        onClick={onAutopilot}
                        disabled={isDisabled}
                        className="w-full border border-neutral-800 hover:border-accent/50 text-neutral-600 hover:text-accent py-3 font-bold uppercase tracking-widest text-[9px] transition-colors rounded-sm"
                    >
                        Single Run (Manual)
                    </button>
                )}
                
                {isAutopilotActive && (
                    <div className="mt-2 text-center">
                        <span className="text-[9px] text-emerald-500 font-mono font-bold">● CLOUD UPLINK SECURE</span>
                    </div>
                )}
            </div>
        </div>

        {/* COLLAPSIBLE LOGS */}
        <div className="border-t border-neutral-900 bg-[#050505]">
            <button 
                onClick={() => setExpandLogs(!expandLogs)}
                className="w-full flex justify-between items-center px-4 py-2 text-[9px] uppercase tracking-widest font-bold text-neutral-500 hover:text-white hover:bg-neutral-900 transition-colors"
            >
                <span>System Logs {logs.length > 0 && `(${logs.length})`}</span>
                <span>{expandLogs ? '▼' : '▲'}</span>
            </button>
            
            {expandLogs && (
                <LogStream logs={logs} />
            )}
        </div>
    </div>
  );
};
