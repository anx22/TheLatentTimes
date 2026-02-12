
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
    <div className="w-[300px] bg-[#050505] flex flex-col border-l border-neutral-900">
        <div className="flex-1 p-4 flex flex-col overflow-y-auto custom-scrollbar">
            <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500 mb-4 block border-b border-neutral-800 pb-2">Commissioning Console</span>
            
            {/* Action Card */}
            <div className="bg-[#0A0A0A] border border-neutral-800 p-4 mb-4">
                {isProcessing ? (
                    <div className="text-center py-4">
                        <div className="w-6 h-6 border-2 border-neutral-700 border-t-accent rounded-full animate-spin mx-auto mb-3"></div>
                        <span className="text-[9px] text-accent font-bold uppercase tracking-widest animate-pulse">Agents Active</span>
                    </div>
                ) : activeStory ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`w-2 h-2 rounded-full ${isShipped ? 'bg-emerald-500' : 'bg-accent'}`}></span>
                            <span className="text-[10px] font-bold uppercase text-white">
                                {isShipped ? 'Artifact Live' : 'Publish Ready'}
                            </span>
                        </div>
                        
                        {isShipped ? (
                            <>
                                <p className="text-[10px] text-emerald-500 leading-relaxed font-bold">
                                    Successfully shipped to live stream.
                                </p>
                                <button 
                                  onClick={onReset}
                                  className="w-full border border-neutral-800 hover:bg-white hover:text-black text-white py-3 font-bold uppercase tracking-widest text-[9px] transition-colors"
                                >
                                    Next Assignment
                                </button>
                            </>
                        ) : (
                            <>
                                <p className="text-[10px] text-neutral-400 leading-relaxed">
                                    Artifact generated. Ship to live stream immediately?
                                </p>
                                <button 
                                  onClick={handleShipToLive}
                                  className="w-full bg-white hover:bg-neutral-200 text-black py-3 font-bold uppercase tracking-widest text-[9px] transition-colors"
                                >
                                    Ship to Live Stream
                                </button>
                            </>
                        )}
                    </div>
                ) : selectedLead ? (
                    <div className="space-y-2">
                        {/* STANDARD CONTROLS */}
                        <div className="grid grid-cols-2 gap-4 mb-2">
                          <div className="col-span-1">
                              <label className="block text-[9px] font-bold text-neutral-500 mb-2 uppercase tracking-widest">Mode</label>
                              <button 
                                  onClick={() => setDepth(d => d === 'Standard' ? 'Deep' : 'Standard')} 
                                  className={`w-full py-1.5 border text-[9px] font-bold uppercase rounded-sm transition-colors ${depth === 'Deep' ? 'bg-neutral-800 text-white border-neutral-600' : 'border-neutral-800 text-neutral-500'}`}
                              >
                                  {depth}
                              </button>
                          </div>
                          <div className="col-span-1">
                              <label className="block text-[9px] font-bold text-neutral-500 mb-2 uppercase tracking-widest">Window</label>
                              <button 
                                  onClick={() => setTimeWindow(t => t === '24h' ? '7d' : t === '7d' ? '30d' : '24h')} 
                                  className="w-full py-1.5 border border-neutral-800 text-neutral-400 hover:text-white text-[9px] font-bold uppercase rounded-sm"
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
                          className="w-full text-[9px] font-bold uppercase tracking-widest text-neutral-500 hover:text-white py-2 flex items-center justify-between border-t border-neutral-800 mt-2"
                        >
                          <span>Fine-Tune</span>
                          <span>{showAdvanced ? '-' : '+'}</span>
                        </button>

                        {showAdvanced && (
                          <div className="space-y-4 pt-2 border-t border-neutral-800 animate-fade-in">
                              {/* AUDIENCE SELECTOR */}
                              <ToggleGroup 
                                  label="Audience" 
                                  options={['General', 'Expert', 'Insider']} 
                                  value={audience} 
                                  onChange={setAudience} 
                              />
                              
                              {/* SEARCH OVERRIDE */}
                              <div>
                                  <label className="block text-[9px] font-bold text-neutral-500 mb-2 uppercase tracking-widest">Focus Query</label>
                                  <input 
                                      value={focusQuery}
                                      onChange={(e) => setFocusQuery(e.target.value)}
                                      placeholder="Override search term..."
                                      className="w-full bg-neutral-900 border border-neutral-800 p-2 text-[10px] text-white focus:border-accent outline-none font-mono placeholder-neutral-700"
                                  />
                              </div>

                              {/* NEGATIVE PROMPTS */}
                              <div>
                                  <label className="block text-[9px] font-bold text-neutral-500 mb-2 uppercase tracking-widest">Banned Words</label>
                                  <input 
                                      value={bannedWords}
                                      onChange={(e) => setBannedWords(e.target.value)}
                                      placeholder="delve, tapestry..."
                                      className="w-full bg-neutral-900 border border-neutral-800 p-2 text-[10px] text-white focus:border-accent outline-none font-mono placeholder-neutral-700"
                                  />
                              </div>
                              
                              {/* TEMPERATURE */}
                              <div>
                                  <div className="flex justify-between mb-2">
                                      <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Temperature</label>
                                      <span className="text-[9px] font-mono text-neutral-400">{temperature}</span>
                                  </div>
                                  <input 
                                      type="range" 
                                      min="0" max="1" step="0.1"
                                      value={temperature}
                                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                                      className="w-full h-1 bg-neutral-800 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:bg-accent"
                                  />
                              </div>
                          </div>
                        )}

                        <button 
                          onClick={handleCommissionClick}
                          className="w-full bg-accent hover:bg-red-600 text-white py-3 font-bold uppercase tracking-widest text-[9px] transition-colors shadow-lg shadow-accent/10 mt-2"
                        >
                            Commission
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-8 opacity-30">
                        <span className="text-[9px] uppercase tracking-widest">System Idle</span>
                    </div>
                )}
            </div>
            
            {/* Autopilot Button */}
            {onToggleAutopilot ? (
                <button 
                    onClick={onToggleAutopilot}
                    className={`w-full border py-3 font-bold uppercase tracking-widest text-[9px] transition-colors mb-4 flex items-center justify-center gap-2 ${isAutopilotActive ? 'bg-accent/10 border-accent text-accent animate-pulse' : 'border-neutral-800 hover:border-accent/50 text-neutral-500 hover:text-white'}`}
                >
                    <span className={`w-1.5 h-1.5 rounded-full ${isAutopilotActive ? 'bg-accent' : 'bg-neutral-500'}`}></span>
                    {isAutopilotActive ? 'AUTOPILOT ENGAGED (60s LOOP)' : 'ENGAGE AUTOPILOT'}
                </button>
            ) : (
                <button 
                    onClick={onAutopilot}
                    className="w-full border border-neutral-800 hover:border-accent/50 hover:bg-accent/5 text-neutral-500 hover:text-accent py-2 font-bold uppercase tracking-widest text-[9px] transition-colors mb-4 flex items-center justify-center gap-2"
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
