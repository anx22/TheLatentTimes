import React, { useState, useEffect } from 'react';
import { useNewsroom } from '../../hooks/useNewsroom';
import { AnglesView } from './AnglesView';
import { DraftView } from './DraftView';

export const TheBullpen: React.FC = () => {
  const { step, draft, angles } = useNewsroom();
  const [view, setView] = useState<'ANGLES' | 'DRAFT'>('DRAFT');

  useEffect(() => {
    if (step === 'DEBATING') setView('ANGLES');
    if (step === 'WRITING') setView('DRAFT');
  }, [step]);

  // If we don't have a draft, but we have angles, default to angles
  useEffect(() => {
    if (!draft && angles.length > 0 && view === 'DRAFT') {
      setView('ANGLES');
    }
  }, [draft, angles, view]);

  return (
    <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full p-6">
      {/* Navigation Toggle */}
      <div className="flex border-b border-zinc-800 mb-6 shrink-0">
        <button 
          onClick={() => setView('ANGLES')} 
          disabled={angles.length === 0 && step !== 'DEBATING'}
          className={`px-6 py-3 text-xs font-bold tracking-widest transition-colors disabled:opacity-30 ${view === 'ANGLES' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          1. EDITORIAL BOARD (ANGLES)
        </button>
        <button 
          onClick={() => setView('DRAFT')} 
          disabled={!draft && step !== 'WRITING'}
          className={`px-6 py-3 text-xs font-bold tracking-widest transition-colors disabled:opacity-30 ${view === 'DRAFT' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          2. THE COLUMNIST (DRAFT)
        </button>
      </div>

      <div className="flex-1 overflow-y-auto relative">
        {view === 'ANGLES' ? <AnglesView /> : <DraftView />}
      </div>
    </div>
  );
};

