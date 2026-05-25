import React, { createContext, useContext, useState, useCallback } from 'react';
import { AtelierState, VisualConcept, ColorPalette, AtelierLayoutMode, ImageHistoryItem } from '../types';

interface AtelierContextType {
  atelierState: AtelierState;
  setAtelierState: React.Dispatch<React.SetStateAction<AtelierState>>;
  updateAtelier: (updates: Partial<AtelierState>) => void;
  resetAtelier: () => void;
}

const defaultAtelierState: AtelierState = {
  concepts: [],
  activeConceptId: null,
  layout: 'COVER',
  activePalette: null,
  suggestedPalettes: [],
  customPrompt: '',
  modifiers: [],
  currentImageId: null,
  isGenerating: false,
  history: []
};

const AtelierContext = createContext<AtelierContextType | undefined>(undefined);

export const AtelierProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [atelierState, setAtelierState] = useState<AtelierState>(defaultAtelierState);

  const updateAtelier = useCallback((updates: Partial<AtelierState>) => {
    setAtelierState(prev => ({ ...prev, ...updates }));
  }, []);

  const resetAtelier = useCallback(() => {
    setAtelierState(defaultAtelierState);
  }, []);

  return (
    <AtelierContext.Provider value={{ atelierState, setAtelierState, updateAtelier, resetAtelier }}>
      {children}
    </AtelierContext.Provider>
  );
};

export const useAtelier = () => {
  const context = useContext(AtelierContext);
  if (!context) {
    throw new Error('useAtelier must be used within an AtelierProvider');
  }
  return context;
};
