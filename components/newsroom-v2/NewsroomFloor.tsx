import React, { useState } from 'react';
import { useNewsroom } from '../../hooks/useNewsroom';
import { X, Radio, Users, Type, PenTool, Camera, Check, ArrowRight, Loader2, RotateCcw } from 'lucide-react';
import { NewsTerminal } from './news-terminal/NewsTerminal';
import { EditorialBoard } from './editorial-board/EditorialBoard';
import { Atelier } from './atelier/Atelier';
import { PrintingPress } from './printing-press/PrintingPress';
import { SystemLog } from './SystemLog';

interface NewsroomFloorProps {
  onClose: () => void;
}

type Department = 'NEWS TERMINAL' | 'EDITORIAL BOARD' | 'ATELIER' | 'PRINTING PRESS';

export const NewsroomFloor: React.FC<NewsroomFloorProps> = ({ onClose }) => {
  const { 
    step, setStep, draft, image, error, reset, tickerItems, isGeneratingImage, isScouting, isDebating, isDrafting,
    topic, runDebate, publish, atelierState
  } = useNewsroom();
  
  const [activeDept, setActiveDept] = useState<Department>('NEWS TERMINAL');

  // Auto-switch tabs based on pipeline step and activity
  React.useEffect(() => {
    if (isScouting) setActiveDept('NEWS TERMINAL');
    else if (isDebating || isDrafting) setActiveDept('EDITORIAL BOARD');
    else if (isGeneratingImage) setActiveDept('ATELIER');
    else if (step === 'NEWS_TERMINAL') setActiveDept('NEWS TERMINAL');
    else if (step === 'EDITORIAL_BOARD') setActiveDept('EDITORIAL BOARD');
    else if (step === 'DARKROOM') setActiveDept('ATELIER');
    else if (step === 'PRINTING_PRESS') setActiveDept('PRINTING PRESS');
    else if (step === 'PUBLISHED') setActiveDept('PRINTING PRESS'); 
  }, [step, isScouting, isDebating, isDrafting, isGeneratingImage]);

  // Derive department status
  const getDeptStatus = (dept: Department) => {
    switch (dept) {
      case 'NEWS TERMINAL':
        return isScouting ? { label: 'SCANNING', color: 'text-purple-400', items: 0 } : { label: 'LISTENING', color: 'text-emerald-500', items: tickerItems.length };
      case 'EDITORIAL BOARD':
        if (isDebating || isDrafting) return { label: 'IN SESSION', color: 'text-purple-400', items: 0 };
        return draft ? { label: 'DRAFT READY', color: 'text-emerald-500', items: 1 } : { label: 'IDLE', color: 'text-zinc-600', items: 0 };
      case 'ATELIER':
        return isGeneratingImage ? { label: 'DEVELOPING', color: 'text-amber-400', items: 1 } : { label: image ? 'DONE' : 'IDLE', color: image ? 'text-emerald-500' : 'text-zinc-600', items: image ? 1 : 0 };
      case 'PRINTING PRESS':
        return step === 'PRINTING_PRESS' ? { label: 'FINAL REVIEW', color: 'text-red-400', items: 1 } : { label: 'IDLE', color: 'text-zinc-600', items: 0 };
    }
  };

  // Define agents per room
  const getRoomAgents = (dept: Department) => {
    switch (dept) {
      case 'NEWS TERMINAL':
        return [{ name: 'Scout', icon: Radio }];
      case 'EDITORIAL BOARD':
        return [
          { name: 'Board', icon: Users },
          { name: 'Columnist', icon: Type },
          { name: 'Editor', icon: PenTool }
        ];
      case 'ATELIER':
        return [{ name: 'Art Director', icon: Camera }];
      case 'PRINTING PRESS':
        return [{ name: 'Publisher', icon: Check }];
    }
  };

  // Get Action Button for Room
  const getRoomAction = (dept: Department) => {
    switch (dept) {
      case 'NEWS TERMINAL':
        if (isScouting) return { label: 'SCOUTING...', disabled: true, loading: true };
        if (topic) return { label: 'CONVENE BOARD', onClick: runDebate, disabled: false, icon: ArrowRight };
        return { label: 'AWAITING SIGNAL', disabled: true };
      
      case 'EDITORIAL BOARD':
        if (isDebating) return { label: 'DEBATING...', disabled: true, loading: true };
        if (isDrafting) return { label: 'DRAFTING...', disabled: true, loading: true };
        if (draft) return { label: 'SEND TO ATELIER', onClick: () => setStep('DARKROOM'), disabled: false, icon: ArrowRight };
        return { label: 'AWAITING DRAFT', disabled: true };

      case 'ATELIER':
        if (isGeneratingImage) return { label: 'DEVELOPING...', disabled: true, loading: true };
        if (atelierState?.currentImageId) return { label: 'SEND TO PRESS', onClick: () => setStep('PRINTING_PRESS'), disabled: false, icon: ArrowRight };
        return { label: 'AWAITING ASSET', disabled: true };

      case 'PRINTING PRESS':
        if (step === 'PUBLISHED') return { label: 'START NEW CYCLE', onClick: reset, disabled: false, icon: RotateCcw };
        if (step === 'PRINTING_PRESS') return { label: 'PUBLISH EDITION', onClick: publish, disabled: false, icon: Check };
        return { label: 'AWAITING LAYOUT', disabled: true };
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
          {/* Global Reset */}
          {step !== 'IDLE' && (
             <button 
               onClick={() => {
                 if (window.confirm('ABORT CURRENT CYCLE? This will clear all progress.')) {
                   reset();
                 }
               }}
               className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded border border-red-500/20 transition-colors text-[10px] font-bold tracking-widest uppercase mr-4"
             >
               <RotateCcw className="w-3 h-3" />
               <span>ABORT</span>
             </button>
          )}
          <div className="w-px h-4 bg-zinc-800" />
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* THE EDITORIAL CHAIN (TABS) */}
      <div className="flex border-b border-zinc-800 bg-zinc-900/50 shrink-0">
        {(['NEWS TERMINAL', 'EDITORIAL BOARD', 'ATELIER', 'PRINTING PRESS'] as Department[]).map((dept) => {
          const status = getDeptStatus(dept);
          const isActive = activeDept === dept;
          const agents = getRoomAgents(dept);
          const action = getRoomAction(dept);
          
          return (
            <div
              key={dept}
              className={`flex-1 flex flex-col border-r border-zinc-800 transition-all relative group ${isActive ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'}`}
            >
              {isActive && <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />}
              
              {/* Tab Click Area */}
              <button 
                onClick={() => setActiveDept(dept)}
                className="flex-1 p-4 text-left w-full"
              >
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

              {/* Room Action Button (Only visible if active) */}
              {isActive && (
                <div className="px-4 pb-4">
                  <button
                    onClick={action.onClick}
                    disabled={action.disabled || action.loading}
                    className={`
                      w-full py-2 flex items-center justify-center gap-2 rounded font-bold tracking-widest text-[10px] uppercase transition-all
                      ${action.disabled 
                        ? 'bg-zinc-900/50 text-zinc-600 cursor-not-allowed border border-zinc-700/50' 
                        : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                      }
                    `}
                  >
                    {action.loading ? <Loader2 className="w-3 h-3 animate-spin" /> : (action.icon && <action.icon className="w-3 h-3" />)}
                    <span>{action.label}</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* WORKSPACE (MAIN AREA) */}
      <main className="flex-1 overflow-hidden flex relative bg-zinc-900/20">
        
        {/* LEFT: MAIN CONTENT AREA */}
        <div className="flex-1 overflow-y-auto flex flex-col relative w-full">
          {activeDept === 'NEWS TERMINAL' && <NewsTerminal />}
          {activeDept === 'EDITORIAL BOARD' && <EditorialBoard />}
          {activeDept === 'ATELIER' && <Atelier />}
          {activeDept === 'PRINTING PRESS' && <PrintingPress />}
        </div>

      </main>

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
