import React, { createContext, useContext, useState } from 'react';
import { AspectRatio, EditorialDepartment } from '../types';

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
}

const ParameterContext = createContext<ParameterContextType | undefined>(undefined);

export const ParameterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sources, setSources] = useState({ github: true, arxiv: true, techcrunch: true });
  const [noiseFilter, setNoiseFilter] = useState(50);
  const [editorialDepartment, setEditorialDepartment] = useState<EditorialDepartment>('Fashion');
  const [wordCount, setWordCount] = useState('Standard (600 words)');
  const [visualStyle, setVisualStyle] = useState('Editorial Photography');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');

  return (
    <ParameterContext.Provider value={{
      sources, setSources,
      noiseFilter, setNoiseFilter,
      editorialDepartment, setEditorialDepartment,
      wordCount, setWordCount,
      visualStyle, setVisualStyle,
      aspectRatio, setAspectRatio
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
