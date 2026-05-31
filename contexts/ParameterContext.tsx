import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../frontendApi";
import { AspectRatio, EditorialDepartment } from '../types';

interface EngineSchedule {
  morning: string; // "08:00"
  midday: string;  // "13:00"
  evening: string; // "19:00"
  enabled: boolean;
}

interface ParameterContextType {
  sources: { github: boolean; arxiv: boolean; techcrunch: boolean };
  setSources: (s: { github: boolean; arxiv: boolean; techcrunch: boolean }) => void;
  noiseFilter: number;
  setNoiseFilter: (n: number) => void;
  editorialDepartment: EditorialDepartment;
  setEditorialDepartment: (d: EditorialDepartment) => void;
  wordCount: string;
  setWordCount: (w: string) => void;
  visualStyle: string;
  setVisualStyle: (s: string) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (r: AspectRatio) => void;
  engineSchedule: EngineSchedule;
  setEngineSchedule: (s: EngineSchedule) => void;
  isSaving: boolean;
}

const ParameterContext = createContext<ParameterContextType | undefined>(undefined);

export const ParameterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const persistedState = useQuery(api.newsroom.queries.getNewsroomStateByKey, { key: "settings" });
  const saveState = useMutation(api.newsroom.mutations.saveNewsroomState);
  const [isSaving, setIsSaving] = useState(false);

  // Local state initialized with defaults
  const [sources, setSources] = useState({ github: true, arxiv: true, techcrunch: true });
  const [noiseFilter, setNoiseFilter] = useState(50);
  const [editorialDepartment, setEditorialDepartment] = useState<EditorialDepartment>('Fashion');
  const [wordCount, setWordCount] = useState('Standard (600 words)');
  const [visualStyle, setVisualStyle] = useState('Editorial Photography');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [engineSchedule, setEngineSchedule] = useState<EngineSchedule>({
    morning: "08:00",
    midday: "13:00",
    evening: "19:00",
    enabled: true
  });

  // Hydrate from persistence
  useEffect(() => {
    if (persistedState) {
      if (persistedState.sources) setSources(persistedState.sources);
      if (persistedState.noiseFilter !== undefined) setNoiseFilter(persistedState.noiseFilter);
      if (persistedState.editorialDepartment) setEditorialDepartment(persistedState.editorialDepartment);
      if (persistedState.wordCount) setWordCount(persistedState.wordCount);
      if (persistedState.visualStyle) setVisualStyle(persistedState.visualStyle);
      if (persistedState.aspectRatio) setAspectRatio(persistedState.aspectRatio);
      if (persistedState.engineSchedule) setEngineSchedule(persistedState.engineSchedule);
    }
  }, [persistedState]);

  // Persistence triggers
  useEffect(() => {
    const timer = setTimeout(async () => {
      setIsSaving(true);
      try {
        await saveState({
          key: "settings",
          data: {
            sources,
            noiseFilter,
            editorialDepartment,
            wordCount,
            visualStyle,
            aspectRatio,
            engineSchedule
          }
        });
      } finally {
        setIsSaving(false);
      }
    }, 1000); // Debounce saves
    return () => clearTimeout(timer);
  }, [sources, noiseFilter, editorialDepartment, wordCount, visualStyle, aspectRatio, engineSchedule, saveState]);

  return (
    <ParameterContext.Provider value={{
      sources, setSources,
      noiseFilter, setNoiseFilter,
      editorialDepartment, setEditorialDepartment,
      wordCount, setWordCount,
      visualStyle, setVisualStyle,
      aspectRatio, setAspectRatio,
      engineSchedule, setEngineSchedule,
      isSaving
    }}>
      {children}
    </ParameterContext.Provider>
  );
};

export const useParameters = () => {
  const context = useContext(ParameterContext);
  if (!context) {
    throw new Error('useParameters must be used within a ParameterProvider');
  }
  return context;
};
