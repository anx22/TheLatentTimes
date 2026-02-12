
import { useState, useRef, useEffect } from 'react';
import { IssueOrchestrator } from '../services/engine-orchestrator';
import { IssueContent, AgentLog, Lead, StoryArtifact, DropArtifact, AgentJob, AgentRole, AgentStatus, SignalDossier, DebateArtifact, RecipeArtifact, IssueMeta, Proposal, SourceMix, ToneProfile } from '../types';
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
  sourceMix?: SourceMix; 
  toneProfile?: ToneProfile; // NEW: Custom Tone Physics
  agentModifiers?: Record<string, string>; // NEW: Per-Agent instructions
  overrides?: {
      focusQuery?: string;
      bannedWords?: string;
      additionalInstructions?: string;
      audienceLevel?: 'General' | 'Expert' | 'Insider';
      modelTemperature?: number;
      strictMode?: boolean;
      toneLock?: boolean;
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

    const history = {
        headlines: new Set([
            ...storiesRef.current.map(s => s.headline),
            ...storiesRef.current.map(s => s.deck),
            ...dropsRef.current.map(d => d.headline)
        ]),
        urls: new Set<string>() 
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

  const syncUI = (onUpdate: (partial: IssueContent) => void) => {
      if (!metaRef.current) return;
      const newIssue: IssueContent = {
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
      };
      onUpdate(newIssue);
  };

  // --- RUN PROPOSAL ---
  const runProposal = async (
      storyId: string, 
      proposal: Proposal,
      overrides: { strict: boolean; toneLock: boolean }, // Modifiers
      onUpdate: (partial: IssueContent) => void
  ) => {
      setIsCommissioning(true);
      
      const storyIndex = storiesRef.current.findIndex(s => s.id === storyId);
      if (storyIndex === -1) {
          setIsCommissioning(false);
          return;
      }
      
      const story = storiesRef.current[storyIndex];
      const config: RunConfig = { 
          deepResearch: false, timeWindow: '7d', voicePreset: 'Modus', riskTolerance: 'Mid', qualityPass: false, includeAtelier: false, generateImages: true,
          overrides: {
              strictMode: overrides.strict,
              toneLock: overrides.toneLock
          }
      };
      
      const updatedStory = await orchestratorRef.current?.executeProposal(story, proposal, config);
      
      if (updatedStory) {
          storiesRef.current[storyIndex] = updatedStory;
          syncUI(onUpdate);
      }
      
      setIsCommissioning(false);
  };

  // --- NEW: DRIFT WATCHER ---
  const runDriftCheck = async (storyId: string, onUpdate: (partial: IssueContent) => void) => {
      const storyIndex = storiesRef.current.findIndex(s => s.id === storyId);
      if (storyIndex === -1) return;
      
      setIsCommissioning(true);
      const story = storiesRef.current[storyIndex];
      const dossier = signalsRef.current.find(s => s.id === story.signal_id);
      const debate = debatesRef.current.find(d => d.id === story.signal_id);
      
      if (story && dossier && debate && debate.verdict) {
          const updatedStory = await orchestratorRef.current?.runDriftCheck(story, dossier, debate.verdict);
          if (updatedStory) {
              storiesRef.current[storyIndex] = updatedStory;
              syncUI(onUpdate);
          }
      }
      setIsCommissioning(false);
  };

  // --- APPROVAL & SHIPPING ---
  const approveStory = (storyId: string, onUpdate: (partial: IssueContent) => void) => {
      const storyIndex = storiesRef.current.findIndex(s => s.id === storyId);
      if (storyIndex !== -1) {
          storiesRef.current[storyIndex].status = 'APPROVED';
          syncUI(onUpdate);
      }
  };

  const shipBatch = async (onUpdate: (partial: IssueContent) => void) => {
      setIsCommissioning(true);
      
      // 1. Move all APPROVED -> PUBLISHED
      let batchCount = 0;
      storiesRef.current.forEach(s => {
          if (s.status === 'APPROVED') {
              s.status = 'PUBLISHED';
              batchCount++;
          }
      });

      // 2. Persist entire issue state
      if (metaRef.current) {
          metaRef.current.status = 'PUBLISHED';
      }
      
      syncUI(onUpdate);
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

      updateAgent('EDITOR', 'DONE', `Batch Shipped (${batchCount} artifacts)`, 100);
      setIsCommissioning(false);
  };

  const runAutopilot = async (
      targets: string[], theme: string, useDemo: boolean, 
      onUpdate: (partial: IssueContent) => void
  ) => {
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

  const toggleAutopilot = async (active: boolean, theme: string) => {
      const status = active ? 'RUNNING' : 'IDLE';
      await setOpsState(status, {
          targets: channels,
          theme: theme,
          mode: 'REMOTE'
      });
      setRemoteOpsState(prev => prev ? { ...prev, status } : null);
  };

  const publishArtifact = async (artifact: StoryArtifact | DropArtifact) => {
      artifact.status = 'PUBLISHED';
      if (metaRef.current) metaRef.current.status = 'PUBLISHED';
      // Reuse shipBatch logic mostly, but specifically for one artifact
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
    isAutopilotActive, 
    toggleAutopilot,
    dbStatus,
    dbError,
    scanWire,
    commissionStory,
    runProposal,
    runDriftCheck, // Exported
    approveStory, 
    shipBatch,
    runAutopilot,
    publishArtifact,
    shipCurrentIssue: async () => null,
    remoteOpsState
  };
};
