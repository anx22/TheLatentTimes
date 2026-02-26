import React, { useState, useEffect } from 'react';
import { useNewsroom } from '../../hooks/useNewsroom';
import { MagazineItem } from '../../types';
import { X } from 'lucide-react';
import { TheWire } from './TheWire';
import { TheBullpen } from './TheBullpen';
import { TheDarkroom } from './TheDarkroom';
import { ThePress } from './ThePress';
import { RightPanel } from './RightPanel';
import { SystemLog } from './SystemLog';

interface NewsroomFloorProps {
  onClose: () => void;
}

type Department = 'THE WIRE' | 'THE BULLPEN' | 'THE DARKROOM' | 'THE PRESS';

export const NewsroomFloor: React.FC<NewsroomFloorProps> = ({ onClose }) => {
  const { 
    step, draft, image, error, reset, tickerItems
  } = useNewsroom();
  
  const [activeDept, setActiveDept] = useState<Department>('THE WIRE');

  // Auto-switch tabs based on pipeline step
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (step === 'DEBATING' || step === 'WRITING') setActiveDept('THE BULLPEN');
    else if (step === 'VISUALIZING') setActiveDept('THE DARKROOM');
    else if (step === 'REVIEW') setActiveDept('THE PRESS');
    else if (step === 'IDLE' && draft) setActiveDept('THE PRESS'); 
  }, [step, draft]);

  // Derive department status
  const getDeptStatus = (dept: Department) => {
    switch (dept) {
      case 'THE WIRE':
        return step === 'SCOUTING' ? { label: 'SCANNING', color: 'text-purple-400', items: 0 } : { label: 'LISTENING', color: 'text-emerald-500', items: tickerItems.length };
      case 'THE BULLPEN':
        if (step === 'DEBATING') return { label: 'DEBATING', color: 'text-purple-400', items: 0 };
        return step === 'WRITING' ? { label: 'DRAFTING', color: 'text-amber-400', items: 1 } : { label: draft ? 'DONE' : 'IDLE', color: draft ? 'text-emerald-500' : 'text-zinc-600', items: draft ? 1 : 0 };
      case 'THE DARKROOM':
        return step === 'VISUALIZING' ? { label: 'DEVELOPING', color: 'text-amber-400', items: 1 } : { label: image ? 'DONE' : 'IDLE', color: image ? 'text-emerald-500' : 'text-zinc-600', items: image ? 1 : 0 };
      case 'THE PRESS':
        return step === 'REVIEW' ? { label: 'NEEDS REVIEW', color: 'text-red-400', items: 1 } : { label: 'IDLE', color: 'text-zinc-600', items: 0 };
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-950 text-zinc-50 z-50 flex flex-col font-mono text-sm">
      {/* HEADER */}
      <header className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-950 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="font-bold tracking-widest text-xs">MODUS OPERATIONS FLOOR</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-px h-4 bg-zinc-800" />
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* THE EDITORIAL CHAIN (TABS) */}
      <div className="flex border-b border-zinc-800 bg-zinc-900/50 shrink-0">
        {(['THE WIRE', 'THE BULLPEN', 'THE DARKROOM', 'THE PRESS'] as Department[]).map((dept) => {
          const status = getDeptStatus(dept);
          const isActive = activeDept === dept;
          return (
            <button
              key={dept}
              onClick={() => setActiveDept(dept)}
              className={`flex-1 p-4 border-r border-zinc-800 text-left transition-colors relative ${isActive ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'}`}
            >
              {isActive && <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />}
              <div className="flex justify-between items-start mb-2">
                <span className={`font-bold tracking-widest text-xs ${isActive ? 'text-white' : 'text-zinc-400'}`}>{dept}</span>
                <span className="text-[10px] bg-zinc-950 px-2 py-0.5 rounded text-zinc-500">{status.items} ITEMS</span>
              </div>
              <div className={`text-[10px] font-bold tracking-wider ${status.color}`}>
                {status.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* WORKSPACE (MAIN AREA) */}
      <main className="flex-1 overflow-hidden flex relative bg-zinc-900/20">
        
        {/* LEFT: MAIN CONTENT AREA */}
        <div className="flex-1 overflow-y-auto flex flex-col relative">
          {activeDept === 'THE WIRE' && <TheWire />}
          {activeDept === 'THE BULLPEN' && <TheBullpen />}
          {activeDept === 'THE DARKROOM' && <TheDarkroom />}
          {activeDept === 'THE PRESS' && <ThePress />}
        </div>

        {/* RIGHT: PERSISTENT PANEL (AGENTS / PARAMETERS) */}
        <RightPanel activeDept={activeDept} />

      </main>

      {/* THE DEBUG CONSOLE (SYSTEM LOG) */}
      <SystemLog />

      {/* ERROR OVERLAY */}
      {error && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded shadow-2xl flex items-center gap-4 z-50">
          <span className="font-bold text-sm">SYSTEM FAILURE:</span>
          <span className="text-sm">{error}</span>
          <button onClick={reset} className="ml-4 bg-black/20 px-3 py-1 rounded text-xs hover:bg-black/40">DISMISS</button>
        </div>
      )}
    </div>
  );
};
