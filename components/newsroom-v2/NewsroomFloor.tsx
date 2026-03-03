import React, { useState } from 'react';
import { useNewsroom } from '../../hooks/useNewsroom';
import { X, Radio, Users, Type, PenTool, Camera, Check } from 'lucide-react';
import { TheWire } from './news-terminal/TheWire';
import { TheBullpen } from './editorial-board/TheBullpen';
import { TheAtelier } from './atelier/TheAtelier';
import { ThePress } from './printing-press/ThePress';
import { SystemLog } from './SystemLog';
import { NewsroomFooter } from './NewsroomFooter';

interface NewsroomFloorProps {
  onClose: () => void;
}

type Department = 'THE NEWS TERMINAL' | 'THE EDITORIAL BOARD' | 'THE ATELIER' | 'THE PRINTING PRESS';

export const NewsroomFloor: React.FC<NewsroomFloorProps> = ({ onClose }) => {
  const { 
    step, draft, image, error, reset, tickerItems, isGeneratingImage, isScouting, isDebating, isDrafting
  } = useNewsroom();
  
  const [activeDept, setActiveDept] = useState<Department>('THE NEWS TERMINAL');

  // Auto-switch tabs based on pipeline step
  React.useEffect(() => {
    if (step === 'NEWS_TERMINAL') setActiveDept('THE NEWS TERMINAL');
    else if (step === 'EDITORIAL_BOARD') setActiveDept('THE EDITORIAL BOARD');
    else if (step === 'DARKROOM') setActiveDept('THE ATELIER');
    else if (step === 'PRINTING_PRESS') setActiveDept('THE PRINTING PRESS');
    else if (step === 'PUBLISHED') setActiveDept('THE PRINTING PRESS'); 
  }, [step]);

  // Derive department status
  const getDeptStatus = (dept: Department) => {
    switch (dept) {
      case 'THE NEWS TERMINAL':
        return isScouting ? { label: 'SCANNING', color: 'text-purple-400', items: 0 } : { label: 'LISTENING', color: 'text-emerald-500', items: tickerItems.length };
      case 'THE EDITORIAL BOARD':
        if (isDebating || isDrafting) return { label: 'IN SESSION', color: 'text-purple-400', items: 0 };
        return draft ? { label: 'DRAFT READY', color: 'text-emerald-500', items: 1 } : { label: 'IDLE', color: 'text-zinc-600', items: 0 };
      case 'THE ATELIER':
        return isGeneratingImage ? { label: 'DEVELOPING', color: 'text-amber-400', items: 1 } : { label: image ? 'DONE' : 'IDLE', color: image ? 'text-emerald-500' : 'text-zinc-600', items: image ? 1 : 0 };
      case 'THE PRINTING PRESS':
        return step === 'PRINTING_PRESS' ? { label: 'FINAL REVIEW', color: 'text-red-400', items: 1 } : { label: 'IDLE', color: 'text-zinc-600', items: 0 };
    }
  };

  // Define agents per room
  const getRoomAgents = (dept: Department) => {
    switch (dept) {
      case 'THE NEWS TERMINAL':
        return [{ name: 'Scout', icon: Radio }];
      case 'THE EDITORIAL BOARD':
        return [
          { name: 'Board', icon: Users },
          { name: 'Columnist', icon: Type },
          { name: 'Editor', icon: PenTool }
        ];
      case 'THE ATELIER':
        return [{ name: 'Art Director', icon: Camera }];
      case 'THE PRINTING PRESS':
        return [{ name: 'Publisher', icon: Check }];
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-950 text-zinc-50 z-50 flex flex-col font-mono text-sm">
      {/* HEADER */}
      <header className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-950 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="font-bold tracking-widest text-xs">THE LATENT TIMES OPERATIONS FLOOR</span>
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
        {(['THE NEWS TERMINAL', 'THE EDITORIAL BOARD', 'THE ATELIER', 'THE PRINTING PRESS'] as Department[]).map((dept) => {
          const status = getDeptStatus(dept);
          const isActive = activeDept === dept;
          const agents = getRoomAgents(dept);
          
          return (
            <button
              key={dept}
              onClick={() => setActiveDept(dept)}
              className={`flex-1 p-4 border-r border-zinc-800 text-left transition-all relative group ${isActive ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'}`}
            >
              {isActive && <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />}
              
              {/* Room Name & Status */}
              <div className="flex justify-between items-start mb-3">
                <span className={`font-bold tracking-widest text-xs ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-300'}`}>{dept}</span>
                <span className={`text-[10px] font-bold tracking-wider ${status.color}`}>
                  {status.label}
                </span>
              </div>

              {/* Docked Agents */}
              <div className="flex items-center gap-3">
                {agents.map((agent, i) => (
                  <div key={i} className={`flex items-center gap-1.5 ${isActive ? 'text-zinc-300' : 'text-zinc-600'} transition-colors`}>
                    <agent.icon className="w-3 h-3" />
                    <span className="text-[10px] font-medium uppercase tracking-wide">{agent.name}</span>
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* WORKSPACE (MAIN AREA) */}
      <main className="flex-1 overflow-hidden flex relative bg-zinc-900/20">
        
        {/* LEFT: MAIN CONTENT AREA */}
        <div className="flex-1 overflow-y-auto flex flex-col relative w-full">
          {activeDept === 'THE NEWS TERMINAL' && <TheWire />}
          {activeDept === 'THE EDITORIAL BOARD' && <TheBullpen />}
          {activeDept === 'THE ATELIER' && <TheAtelier />}
          {activeDept === 'THE PRINTING PRESS' && <ThePress />}
        </div>

      </main>

      {/* FOOTER: THE BIG BUTTON */}
      <NewsroomFooter />

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
