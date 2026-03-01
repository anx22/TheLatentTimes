import React, { useState, useEffect } from 'react';
import { useNewsroom } from '../../hooks/useNewsroom';
import { AnglesView } from './AnglesView';
import { DraftView } from './DraftView';

export const TheBullpen: React.FC = () => {
  const { step, draft, angles } = useNewsroom();
  const [view, setView] = useState<'ANGLES' | 'DRAFT'>('DRAFT');

  useEffect(() => {
    if (step === 'EDITORIAL_BOARD' && !draft) setView('ANGLES');
    if (step === 'EDITORIAL_BOARD' && draft) setView('DRAFT');
  }, [step, draft]);

  // If we don't have a draft, but we have angles, default to angles
  useEffect(() => {
    if (!draft && angles.length > 0 && view === 'DRAFT') {
      setView('ANGLES');
    }
  }, [draft, angles, view]);

  return (
    <div className="flex-1 h-full overflow-hidden bg-[#0a0a0a]">
      {view === 'ANGLES' ? <AnglesView /> : <DraftView />}
    </div>
  );
};

