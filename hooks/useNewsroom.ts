
import { useState, useRef, useEffect } from 'react';
import { IssueOrchestrator } from '../services/engine-orchestrator';
import { IssueContent, AgentLog, Lead, StoryArtifact, DropArtifact, AgentJob, AgentRole, AgentStatus, SignalDossier, DebateArtifact, RecipeArtifact, IssueMeta } from '../types';
import { saveLogs, loadLogs, saveIssue, getOpsState, setOpsState, subscribeToOps, OpsState } from '../services/storage';
import { DEFAULT_CHANNELS } from '../services/curation-seed';
import { AGENT_ROSTER } from '../services/agent-registry';

export interface RunConfig {
  deepResearch: boolean;
  timeWindow: '24h' | '7d' | '30d';
  voicePreset: 'Modus' | 'Gonzo' | 'Academic' | 'Minimalist';
  riskTolerance: 'Low' | 'Mid' | 'High';
  qualityPass: boolean;
  includeAtelier: boolean;
  generateImages: boolean; 
  overrides?: {
      focusQuery?: string;
      bannedWords?: string;
      additionalInstructions?: string;
      audienceLevel?: 'General' | 'Expert' | 'Insider';
      modelTemperature?: number;
  }
}

export type DbStatus = 'CONNECTING' | 'CONNECTED' | 'ERROR' | 'OFFLINE';

export const useNewsroom = () => {
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isCommissioning, setIsCommissioning] = useState(false);
  
  // CORE DATA STATE
  const [leads, setLeads] = useState<Lead[]>([]); 
  const signalsRef = useRef<SignalDossier[]>([]);
  const debatesRef = useRef<DebateArtifact[]>([]);
  const storiesRef = useRef<StoryArtifact[]>([]);
  const recipesRef = useRef<RecipeArtifact[]>([]);
  const dropsRef = useRef<DropArtifact[]>([]);
  const metaRef = useRef<IssueMeta | undefined>(undefined);

  const [dbStatus, setDbStatus] = useState<DbStatus>('CONNECTING');
  const [dbError, setDbError] = useState<string | null>(null);
  const [channels, setChannels] = useState<string[]>([]);
  
  // REMOTE AUTOPILOT STATE
  const [remoteOpsState, setRemoteOpsState] = useState<OpsState | null>(null);
  
  // Derived state: Is the Cloud Agent running?
  const isAutopilotActive = remoteOpsState?.status === 'RUNNING';

  // NEW: Agent Visualization State
  const [agentJobs, setAgentJobs] = useState<Record<AgentRole, AgentJob>>({
      SCOUT: { agentId: 'agent_scout', status: 'IDLE', currentTask: '', progress: 0, lastActive: 0 },
      CRITIC: { agentId: 'agent_critic', status: 'IDLE', currentTask: '', progress: 0, lastActive: 0 },
      EDITOR: { agentId: 'agent_editor', status: 'IDLE', currentTask: '', progress: 0, lastActive: 0 },
      WRITER: { agentId: 'agent_writer', status: 'IDLE', currentTask: '', progress: 0, lastActive: 0 },
      ARTIST: { agentId: 'agent_artist', status: 'IDLE', currentTask: '', progress: 0, lastActive: 0 },
      ENGINEER: { agentId: 'agent_engineer', status: 'IDLE', currentTask: '', progress: 0, lastActive: 0 },
  });

  const orchestratorRef = useRef<IssueOrchestrator | null>(null);

  // Initial Load & Subscription
  useEffect(() => {
    const init = async () => {
        const savedLogs = await loadLogs();
        if (savedLogs && savedLogs.length > 0) setLogs(savedLogs);
        
        const storedChannels = localStorage.getItem('modus_active_channels');
        if (storedChannels) setChannels(JSON.parse(storedChannels));
        else setChannels(DEFAULT_CHANNELS);

        // Fetch initial remote state
        const ops = await getOpsState();
        if (ops) setRemoteOpsState(ops);
    };
    init();

    // SUBSCRIBE TO REMOTE OPS (Cloud Agent)
    const sub = subscribeToOps((newState) => {
        setRemoteOpsState(newState);
        // If remote task updates, we can update a generic 'Cloud Agent' job visualizer here if we wanted
        if (newState.current_task) {
            updateAgent('EDITOR', 'WORKING', newState.current_task, 50);
        }
        if (newState.status === 'IDLE') {
            updateAgent('EDITOR', 'IDLE', 'Cloud Agent Idle', 0);
        }
    });

    return () => { sub.unsubscribe(); };
  }, []);
  
  useEffect(() => {
     if (channels.length > 0) localStorage.setItem('modus_active_channels', JSON.stringify(channels));
  }, [channels]);

  useEffect(() => {
    if (logs.length > 0) {
        saveLogs(logs).then(result => {
            setDbStatus(result.success ? 'CONNECTED' : 'ERROR');
            if (result.error) setDbError(result.error.message);
        });
    }
  }, [logs]);

  // UPDATE AGENT JOB HELPER
  const updateAgent = (role: AgentRole, status: AgentStatus, task: string = '', progress: number = 0) => {
      setAgentJobs(prev => ({
          ...prev,
          [role]: {
              ...prev[role],
              status,
              currentTask: task,
              progress,
              lastActive: Date.now()
          }
      }));
  };

  if (!orchestratorRef.current) {
    orchestratorRef.current = new IssueOrchestrator({
        onLog: (log) => setLogs(prev => [...prev, log]),
        onAgentStart: (role, task) => updateAgent(role, 'WORKING', task, 0),
        onAgentUpdate: (role, task, progress) => updateAgent(role, 'WORKING', task, progress),
        onAgentFinish: (role) => updateAgent(role, 'DONE', 'Waiting for tasks...', 100),
        onAgentFail: (role, err) => updateAgent(role, 'ERROR', err, 0)
    });
  }
  
  const addChannel = (topic: string) => {
      if (!channels.includes(topic)) setChannels(p => [...p, topic]);
  };
  
  const removeChannel = (topic: string) => {
      setChannels(p => p.filter(c => c !== topic));
  };

  const scanWire = async (targets: string[], useDemo: boolean) => {
    setLeads([]);
    setIsScanning(true);

    // Build History Context for Deduplication
    const history = {
        headlines: new Set([
            ...storiesRef.current.map(s => s.headline),
            ...storiesRef.current.map(s => s.deck), // Also check decks just in case
            ...dropsRef.current.map(d => d.headline)
        ]),
        urls: new Set<string>() // Add URL tracking if needed
    };

    const newLeads = await orchestratorRef.current?.scan(targets, useDemo, history) || [];
    setLeads(newLeads);
    setIsScanning(false);
  };

  const commissionStory = async (
    lead: Lead, theme: string, useDemo: boolean, config: RunConfig,
    onUpdate: (partial: IssueContent) => void
  ) => {
    setIsCommissioning(true);
    
    const context = {
        signals: signalsRef.current,
        debates: debatesRef.current,
        stories: storiesRef.current,
        recipes: recipesRef.current,
        drops: dropsRef.current,
        meta: metaRef.current
    };

    const result = await orchestratorRef.current?.commission(lead, theme, useDemo, config, onUpdate, context);
    
    if (result) {
        metaRef.current = result.meta;
    }
    
    setIsCommissioning(false);
    return result;
  };

  const runAutopilot = async (
      targets: string[], theme: string, useDemo: boolean, 
      onUpdate: (partial: IssueContent) => void
  ) => {
      // Legacy Manual Run (Client Side)
      setIsScanning(true);
      setIsCommissioning(true);
      
      const config: RunConfig = {
          deepResearch: false,
          timeWindow: '7d',
          voicePreset: 'Modus',
          riskTolerance: 'Mid',
          qualityPass: true,
          includeAtelier: false,
          generateImages: false
      };
      
      const context = {
        signals: signalsRef.current,
        debates: debatesRef.current,
        stories: storiesRef.current,
        recipes: recipesRef.current,
        drops: dropsRef.current,
        meta: metaRef.current,
        theme
      };

      const result = await orchestratorRef.current?.autoPilot(targets, useDemo, config, onUpdate, context);
      
      setIsScanning(false);
      setIsCommissioning(false);
      
      if (result) {
          metaRef.current = result.issue.meta;
          return { issue: result.issue, publishedCount: result.publishedCount };
      }
      return null;
  };

  // REMOTE CONTROL: Toggle Cloud Agent via DB
  const toggleAutopilot = async (active: boolean, theme: string) => {
      const status = active ? 'RUNNING' : 'IDLE';
      
      // We set the Config in the DB so the Edge Function knows what to do
      await setOpsState(status, {
          targets: channels,
          theme: theme,
          mode: 'REMOTE'
      });

      // Optimistic update
      setRemoteOpsState(prev => prev ? { ...prev, status } : null);
  };

  const publishArtifact = async (artifact: StoryArtifact | DropArtifact) => {
      artifact.status = 'PUBLISHED';
      if (metaRef.current) metaRef.current.status = 'PUBLISHED';
      await saveIssue({
          meta: metaRef.current!,
          ticker: [], 
          cover: { eyebrow: '', title: '', deck: '', coverlines: [], imgPrompt: '' },
          features: storiesRef.current.filter(s => ['COVER', 'FEATURE'].includes(s.placement)),
          columns: storiesRef.current.filter(s => s.placement === 'COLUMN'),
          drops: dropsRef.current,
          edit: [],
          atelier: recipesRef.current,
          debates: debatesRef.current,
          index_keys: [],
          colophon: { contributors: [], sources: [], corrections: [] }
      });
      return null; 
  };

  return {
    logs,
    agentJobs, 
    leads,
    channels,
    addChannel,
    removeChannel,
    isProcessing: isScanning || isCommissioning, 
    isScanning,
    isCommissioning,
    isAutopilotActive, // Now reflects Remote Ops State
    toggleAutopilot,
    dbStatus,
    dbError,
    scanWire,
    commissionStory,
    runAutopilot, // Legacy Manual
    publishArtifact,
    shipCurrentIssue: async () => null,
    remoteOpsState // New: Full remote state
  };
};
