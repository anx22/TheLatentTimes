import { useState, useRef, useEffect } from 'react';
import { IssueOrchestrator } from '../services/engine-orchestrator';
import { IssueContent, AgentLog } from '../types';
import { saveLogs, loadLogs } from '../services/storage';

export interface RunConfig {
  deepResearch: boolean;
  qualityPass: boolean;
  includeAtelier: boolean;
  generateImages: boolean; // NEW
}

export const useNewsroom = () => {
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const orchestratorRef = useRef<IssueOrchestrator | null>(null);

  // Load previous logs on mount
  useEffect(() => {
    const initLogs = async () => {
        const savedLogs = await loadLogs();
        if (savedLogs && savedLogs.length > 0) {
            setLogs(savedLogs);
        }
    };
    initLogs();
  }, []);

  // Save logs whenever they change
  useEffect(() => {
    if (logs.length > 0) {
      saveLogs(logs);
    }
  }, [logs]);

  if (!orchestratorRef.current) {
    orchestratorRef.current = new IssueOrchestrator((log) => {
      setLogs(prev => {
        const newLogs = [...prev, log];
        return newLogs;
      });
    });
  }

  const runCycle = async (
    theme: string, 
    targets: string[], 
    useDemo: boolean, 
    config: RunConfig,
    onUpdate?: (partial: IssueContent) => void
  ): Promise<IssueContent | null> => {
    setLogs([]); 
    setIsProcessing(true);
    const result = await orchestratorRef.current?.startIssueCycle(theme, targets, useDemo, config, onUpdate) || null;
    setIsProcessing(false);
    return result;
  };

  return {
    logs,
    isProcessing,
    runCycle
  };
};