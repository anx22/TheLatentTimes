import React from 'react';
import { useNewsroom } from '../../hooks/useNewsroom';
import { ArrowRight, Loader2, Check, RefreshCw, Camera } from 'lucide-react';

export const NewsroomFooter: React.FC = () => {
  const { 
    step, topic, draft, image, 
    runDebate, runPipeline, reDraft, reShoot, publish, reset 
  } = useNewsroom();

  // Determine the primary action based on the current step
  const getPrimaryAction = () => {
    switch (step) {
      case 'NEWS_TERMINAL':
      case 'IDLE':
        return {
          label: 'SEND TO EDITORIAL BOARD',
          onClick: runDebate,
          disabled: !topic.trim(),
          icon: ArrowRight,
          loading: false
        };
      
      case 'EDITORIAL_BOARD':
        if (!draft) {
          // In Debate Phase - Action is handled by clicking an Angle card
          return {
            label: 'SELECT AN ANGLE ABOVE',
            onClick: () => {},
            disabled: true,
            icon: ArrowRight,
            loading: false
          };
        } else {
          // In Draft Phase
          return {
            label: 'SEND TO DARKROOM',
            onClick: () => runPipeline(), // Continue pipeline without new angle
            disabled: false,
            icon: Camera,
            loading: false
          };
        }

      case 'DARKROOM':
        return {
          label: image ? 'SEND TO PRINTING PRESS' : 'DEVELOPING...',
          onClick: () => {}, // Logic handled in TheDarkroom for now, or we can move state transition here
          disabled: !image,
          icon: ArrowRight,
          loading: !image
        };

      case 'PRINTING_PRESS':
        return {
          label: 'PUBLISH TO GRID',
          onClick: publish,
          disabled: false,
          icon: Check,
          loading: false
        };

      case 'PUBLISHED':
        return {
          label: 'START NEW CYCLE',
          onClick: reset,
          disabled: false,
          icon: RefreshCw,
          loading: false
        };

      default:
        return {
          label: 'PROCESSING...',
          onClick: () => {},
          disabled: true,
          icon: Loader2,
          loading: true
        };
    }
  };

  const action = getPrimaryAction();

  return (
    <div className="h-14 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between px-6 shrink-0 z-50">
      {/* Status Indicator */}
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${action.loading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">PROTOCOL:</span>
          <span className="text-xs font-bold text-white uppercase tracking-wider">{step.replace('_', ' ')}</span>
        </div>
      </div>

      {/* The Big Button */}
      <button
        onClick={action.onClick}
        disabled={action.disabled || action.loading}
        className={`
          h-8 px-6 flex items-center gap-2 rounded font-bold tracking-widest text-xs transition-all
          ${action.disabled 
            ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800' 
            : 'bg-emerald-500 text-black hover:bg-emerald-400 hover:scale-105 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
          }
        `}
      >
        {action.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <action.icon className="w-4 h-4" />}
        <span>{action.label}</span>
      </button>
    </div>
  );
};
