import React, { useState, useEffect } from 'react';
import { useNewsroom } from '../../hooks/useNewsroom';
import { AnglesView } from './AnglesView';
import { DraftView } from './DraftView';
import { Dossier } from './Dossier';
import { FileText, Target } from 'lucide-react';

export const TheBullpen: React.FC = () => {
  const { step, draft, angles, topic, context } = useNewsroom();
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
    <div className="flex-1 flex gap-6 p-6 h-full overflow-hidden">
      {/* LEFT RAIL: CONTEXT (Source Material) */}
      <div className="w-80 shrink-0 flex flex-col gap-4 h-full overflow-y-auto custom-scrollbar pb-20">
        <div className="bg-zinc-950 border border-zinc-800 rounded p-4 shadow-lg">
          <div className="flex items-center gap-2 mb-3 border-b border-zinc-800 pb-2">
            <Target className="w-4 h-4 text-emerald-500" />
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Source Signal</h3>
          </div>
          <p className="text-sm font-bold text-white mb-2 leading-snug">{topic}</p>
          {context && (
            <div className="text-xs text-zinc-500 italic bg-zinc-900/50 p-3 rounded border border-zinc-800/50">
              "{context.slice(0, 150)}..."
            </div>
          )}
        </div>

        {/* Selected Angle (if any) */}
        {draft && (
          <div className="bg-zinc-950 border border-zinc-800 rounded p-4 shadow-lg animate-fade-in">
            <div className="flex items-center gap-2 mb-3 border-b border-zinc-800 pb-2">
              <FileText className="w-4 h-4 text-purple-500" />
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Selected Lens</h3>
            </div>
            <p className="text-sm font-bold text-white mb-1">{draft.headline}</p>
            <p className="text-xs text-zinc-500">{draft.deck}</p>
          </div>
        )}
      </div>

      {/* CENTER: THE DOSSIER (Work Surface) */}
      <div className="flex-1 h-full overflow-hidden">
        <Dossier 
          title={draft ? draft.headline : "EDITORIAL BRIEF"}
          status={step === 'EDITORIAL_BOARD' ? (draft ? "DRAFTING" : "DEBATING") : "ARCHIVED"}
          classification="INTERNAL ONLY"
        >
          {view === 'ANGLES' ? <AnglesView /> : <DraftView />}
        </Dossier>
      </div>
    </div>
  );
};

