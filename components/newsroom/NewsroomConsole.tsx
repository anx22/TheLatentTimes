
import React, { useState, useEffect } from 'react';
import { LogStream, ToggleGroup } from './ui-primitives';
import { AgentLog, Lead, StoryArtifact, IssueContent } from '../../types';

interface NewsroomConsoleProps {
  logs: AgentLog[];
  isProcessing: boolean;
  selectedLead: Lead | undefined;
  activeStory: StoryArtifact | undefined;
  latestIssue: IssueContent | null;
  onCommission: (config: any) => void;
  onAutopilot: () => void;
  onPublish: (issue: IssueContent) => void;
  onPublishArtifact?: (artifact: StoryArtifact) => void;
  onReset?: () => void; // New Reset Prop
  // Autopilot
  isAutopilotActive?: boolean;
  onToggleAutopilot?: () => void;
}

export const NewsroomConsole: React.FC<NewsroomConsoleProps> = ({
  logs, isProcessing, selectedLead, activeStory, latestIssue, onCommission, onAutopilot, onPublish, onPublishArtifact, onReset,
  isAutopilotActive, onToggleAutopilot
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

  return (
    <div className="w-[380px] bg-[#050505] flex flex-col border-l border-neutral-900 shrink-0">
        <div className="flex-1 p-5 flex flex-col overflow-y-auto custom-scrollbar">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-6 block border-b border-neutral-900 pb-3">Commissioning Console</span>
            
            {/* Action Card */}
            <div className="bg-[#080808] border border-neutral-800 p-5 mb-6 rounded-sm shadow-sm">
                {isProcessing ? (
                    <div className="text-center py-8">
                        <div className="w-8 h-8 border-2 border-neutral-800 border-t-accent rounded-full animate-spin mx-auto mb-4"></div>
                        <span className="text-[10px] text-accent font-bold uppercase tracking-widest animate-pulse">Orchestrating Agents...</span>
                    </div>
                ) : activeStory ? (
                    <div className="space-y-5">
                        <div className="flex items-center gap-3 mb-2 bg-neutral-900 p-2 rounded">
                            <span className={`w-2 h-2 rounded-full ${isShipped ? 'bg-emerald-500' : 'bg-accent'}`}></span>
                            <span className="text-[10px] font-bold uppercase text-white tracking-wider">
                                {isShipped ? 'Artifact Live' : 'Publish Ready'}
                            </span>
                        </div>
                        
                        {isShipped ? (
                            <>
                                <p className="text-xs text-emerald-500 leading-relaxed font-medium">
                                    Artifact successfully deployed to the live content stream.
                                </p>
                                <button 
                                  onClick={onReset}
                                  className="w-full border border-neutral-700 hover:bg-white hover:text-black text-white py-3.5 font-bold uppercase tracking-widest text-[10px] transition-all rounded-sm"
                                >
                                    Initialize Next Assignment
                                </button>
                            </>
                        ) : (
                            <>
                                <p className="text-xs text-neutral-400 leading-relaxed font-medium">
                                    Final artifact generated and verified. Ready for deployment.
                                </p>
                                <button 
                                  onClick={handleShipToLive}
                                  className="w-full bg-white hover:bg-neutral-200 text-black py-3.5 font-bold uppercase tracking-widest text-[10px] transition-all rounded-sm shadow-lg shadow-white/5"
                                >
                                    Deploy to Live Stream
                                </button>
                            </>
                        )}
                    </div>
                ) : selectedLead ? (
                    <div className="space-y-4">
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

                        <button 
                          onClick={handleCommissionClick}
                          className="w-full bg-accent hover:bg-red-600 text-white py-4 font-bold uppercase tracking-widest text-[10px] transition-colors shadow-lg shadow-accent/20 mt-4 rounded-sm"
                        >
                            Commission Agents
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-12 opacity-40">
                        <span className="text-[10px] uppercase tracking-widest block mb-2">Console Idle</span>
                        <p className="text-xs text-neutral-600">Select a lead to configure.</p>
                    </div>
                )}
            </div>
            
            {/* Autopilot Button */}
            {onToggleAutopilot ? (
                <button 
                    onClick={onToggleAutopilot}
                    className={`w-full border py-4 font-bold uppercase tracking-widest text-[10px] transition-all mb-4 flex items-center justify-center gap-2 rounded-sm ${isAutopilotActive ? 'bg-accent/10 border-accent text-accent animate-pulse shadow-[0_0_15px_rgba(208,0,0,0.2)]' : 'border-neutral-800 hover:border-accent/50 text-neutral-500 hover:text-white hover:bg-neutral-900'}`}
                >
                    <span className={`w-2 h-2 rounded-full ${isAutopilotActive ? 'bg-accent' : 'bg-neutral-600'}`}></span>
                    {isAutopilotActive ? 'AUTOPILOT ENGAGED (5m CYCLE)' : 'ENGAGE AUTOPILOT'}
                </button>
            ) : (
                <button 
                    onClick={onAutopilot}
                    className="w-full border border-neutral-800 hover:border-accent/50 hover:bg-accent/5 text-neutral-500 hover:text-accent py-4 font-bold uppercase tracking-widest text-[10px] transition-colors mb-4 flex items-center justify-center gap-2 rounded-sm"
                >
                    <span className="w-1.5 h-1.5 bg-current rounded-full"></span>
                    Engage Autopilot (Single Run)
                </button>
            )}

        </div>
        
        {/* Logs */}
        <LogStream logs={logs} />
    </div>
  );
};
