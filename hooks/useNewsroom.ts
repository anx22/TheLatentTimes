
import { useState, useRef, useEffect } from 'react';
import { IssueOrchestrator } from '../services/engine-orchestrator';
import { IssueContent, AgentLog, Lead, StoryArtifact, DropArtifact } from '../types';
import { saveLogs, loadLogs, saveIssue } from '../services/storage';
import { DEFAULT_CHANNELS } from '../services/curation-seed';

export interface RunConfig {
  // Search Params
  deepResearch: boolean;
  timeWindow: '24h' | '7d' | '30d';
  
  // Tone Params
  voicePreset: 'Modus' | 'Gonzo' | 'Academic' | 'Minimalist';
  riskTolerance: 'Low' | 'Mid' | 'High'; // Controls "Voltage" threshold
  
  // Pipeline Flags
  qualityPass: boolean;
  includeAtelier: boolean;
  generateImages: boolean; 

  // FINE TUNING (NEW)
  overrides?: {
      focusQuery?: string; // Force a specific Google Search query
      bannedWords?: string; // Comma separated list
      additionalInstructions?: string; // "Make it sound like..."
      audienceLevel?: 'General' | 'Expert' | 'Insider';
      modelTemperature?: number; // 0.0 to 1.0 (Precision vs Chaos)
  }
}

export type DbStatus = 'CONNECTING' | 'CONNECTED' | 'ERROR' | 'OFFLINE';

interface DailyStats {
    morning: number;
    noon: number;
    evening: number;
}

const getDailyStats = (): DailyStats => {
    try {
        const key = `modus_autopilot_${new Date().toLocaleDateString()}`;
        const stored = localStorage.getItem(key);
        if (stored) return JSON.parse(stored);
        return { morning: 0, noon: 0, evening: 0 };
    } catch { return { morning: 0, noon: 0, evening: 0 }; }
};

const updateDailyStats = (slot: 'morning'|'noon'|'evening', count: number) => {
    const key = `modus_autopilot_${new Date().toLocaleDateString()}`;
    const stats = getDailyStats();
    stats[slot] += count;
    localStorage.setItem(key, JSON.stringify(stats));
};

export const useNewsroom = () => {
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]); 
  const [dbStatus, setDbStatus] = useState<DbStatus>('CONNECTING');
  const [dbError, setDbError] = useState<string | null>(null);
  
  // Channel State
  const [channels, setChannels] = useState<string[]>([]);
  
  // Autopilot State
  const [isAutopilotActive, setIsAutopilotActive] = useState(false);
  const autopilotTimer = useRef<NodeJS.Timeout | null>(null);

  const orchestratorRef = useRef<IssueOrchestrator | null>(null);

  // Initial Load
  useEffect(() => {
    const init = async () => {
        // Load Logs
        const savedLogs = await loadLogs();
        if (savedLogs && savedLogs.length > 0) {
            setLogs(savedLogs);
        }
        
        // Load Channels from LocalStorage or Default
        const storedChannels = localStorage.getItem('modus_active_channels');
        if (storedChannels) {
            setChannels(JSON.parse(storedChannels));
        } else {
            setChannels(DEFAULT_CHANNELS);
        }
    };
    init();
  }, []);
  
  // Persist Channels
  useEffect(() => {
     if (channels.length > 0) {
        localStorage.setItem('modus_active_channels', JSON.stringify(channels));
     }
  }, [channels]);

  // Strict Sync with Error Reporting
  useEffect(() => {
    if (logs.length > 0) {
        saveLogs(logs).then(result => {
            if (result.success) {
                setDbStatus('CONNECTED');
                setDbError(null);
            } else {
                setDbStatus('ERROR');
                // Extract useful message from Supabase error object
                const msg = result.error?.message || result.error?.code || 'Unknown DB Error';
                setDbError(msg);
            }
        });
    }
  }, [logs]);

  // Cleanup Timer on unmount
  useEffect(() => {
      return () => {
          if (autopilotTimer.current) clearInterval(autopilotTimer.current);
      };
  }, []);

  if (!orchestratorRef.current) {
    orchestratorRef.current = new IssueOrchestrator((log) => {
      setLogs(prev => [...prev, log]);
    });
  }
  
  // Channel Actions
  const addChannel = (topic: string) => {
      if (!channels.includes(topic)) setChannels(p => [...p, topic]);
  };
  
  const removeChannel = (topic: string) => {
      setChannels(p => p.filter(c => c !== topic));
  };

  // Phase 1: Scan
  const scanWire = async (targets: string[], useDemo: boolean) => {
    setLogs([]); // Clear local logs on new run
    setLeads([]);
    setIsProcessing(true);
    const newLeads = await orchestratorRef.current?.scan(targets, useDemo) || [];
    setLeads(newLeads);
    setIsProcessing(false);
  };

  // Phase 2: Commission
  const commissionStory = async (
    lead: Lead, 
    theme: string, 
    useDemo: boolean, 
    config: RunConfig,
    onUpdate: (partial: IssueContent) => void
  ) => {
    setIsProcessing(true);
    const result = await orchestratorRef.current?.commission(lead, theme, useDemo, config, onUpdate);
    setIsProcessing(false);
    return result;
  };

  // Phase 3: Autopilot
  const runAutopilot = async (
      targets: string[], 
      theme: string, 
      useDemo: boolean, 
      onUpdate: (partial: IssueContent) => void
  ) => {
      // Don't clear logs in AP mode, just append
      setIsProcessing(true);
      
      // Use a robust default config for autopilot
      const config: RunConfig = {
          deepResearch: false,
          timeWindow: '7d',
          voicePreset: 'Modus',
          riskTolerance: 'Mid',
          qualityPass: true,
          includeAtelier: false,
          generateImages: false
      };
      
      // Autopilot handles auto-publishing internally if confidence is high
      const result = await orchestratorRef.current?.autoPilot(targets, useDemo, config, onUpdate);
      setIsProcessing(false);
      
      if (result) {
          return { issue: result.issue, publishedCount: result.publishedCount };
      }
      return null;
  };

  // TOGGLE AUTOPILOT LOOP
  const toggleAutopilot = (active: boolean, theme: string, useDemo: boolean, onUpdate: (partial: IssueContent) => void) => {
      if (active) {
          setIsAutopilotActive(true);
          
          // Helper: Check Schedule Quotas
          const checkScheduleAndRun = () => {
              if (isProcessing) return; // Prevent Overlap

              const now = new Date();
              const hour = now.getHours();
              let slot: 'morning' | 'noon' | 'evening' | null = null;
              
              if (hour >= 6 && hour < 12) slot = 'morning';
              else if (hour >= 12 && hour < 18) slot = 'noon';
              else if (hour >= 18 && hour < 22) slot = 'evening';
              
              if (!slot) {
                  setLogs(prev => [...prev, { id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), phase: 'IDLE', agent: 'SYS', message: `Autopilot Idle: Off-hours (${hour}:00)` }]);
                  return;
              }

              const stats = getDailyStats();
              if (stats[slot] >= 2) {
                  setLogs(prev => [...prev, { id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), phase: 'IDLE', agent: 'SYS', message: `Autopilot Idle: Quota Met for ${slot} (${stats[slot]}/2)` }]);
                  return;
              }

              // Proceed with Run
              runAutopilot(channels, theme, useDemo, onUpdate).then(res => {
                  if (res && res.publishedCount > 0 && slot) {
                      updateDailyStats(slot, res.publishedCount);
                  }
              });
          };
          
          // 1. Run Immediately (First run bypasses checks to show activity, or logic can be applied)
          // Let's apply logic immediately to prevent user confusion if they are off-hours
          checkScheduleAndRun();
          
          // 2. Set Interval (5 minutes to prevent token burn)
          if (autopilotTimer.current) clearInterval(autopilotTimer.current);
          autopilotTimer.current = setInterval(() => {
              checkScheduleAndRun();
          }, 300000); // 5 Minutes

      } else {
          setIsAutopilotActive(false);
          if (autopilotTimer.current) clearInterval(autopilotTimer.current);
      }
  };

  // Phase 4: Publish (Single)
  const publishArtifact = async (artifact: StoryArtifact | DropArtifact) => {
      setIsProcessing(true);
      const updatedIssue = await orchestratorRef.current?.publishArtifact(artifact);
      if (updatedIssue) {
          await saveIssue(updatedIssue);
      }
      setIsProcessing(false);
      return updatedIssue;
  };

  // Phase 4: Ship Issue (Finalize & Save)
  const shipCurrentIssue = async () => {
      setIsProcessing(true);
      const finalizedIssue = await orchestratorRef.current?.shipIssue();
      
      if (finalizedIssue) {
          // Persist the published issue to DB/Archive
          await saveIssue(finalizedIssue);
      }
      
      setIsProcessing(false);
      return finalizedIssue;
  };

  return {
    logs,
    leads,
    channels,
    addChannel,
    removeChannel,
    isProcessing,
    isAutopilotActive,
    toggleAutopilot,
    dbStatus,
    dbError,
    scanWire,
    commissionStory,
    runAutopilot,
    publishArtifact,
    shipCurrentIssue
  };
};
