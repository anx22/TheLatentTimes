import React from 'react';
import { VisualConcept } from '../../../types';

interface ConceptCardProps {
  concept: VisualConcept;
  isActive: boolean;
  onClick: () => void;
}

export const ConceptCard: React.FC<ConceptCardProps> = ({ concept, isActive, onClick }) => (
  <div 
    onClick={onClick}
    className={`
      p-4 rounded border cursor-pointer transition-all duration-200 relative group
      ${isActive 
        ? 'bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500' 
        : 'bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700'
      }
    `}
  >
    <div className="flex justify-between items-start mb-2">
      <h4 className={`text-xs font-bold uppercase tracking-widest ${isActive ? 'text-emerald-400' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
        {concept.name}
      </h4>
      {isActive && <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />}
    </div>
    <p className="text-[11px] text-zinc-500 leading-relaxed mb-3 line-clamp-3">
      {concept.description}
    </p>
    <div className="text-[9px] font-mono text-zinc-600 uppercase tracking-wide border-t border-zinc-800/50 pt-2">
      Rationale: {concept.rationale.substring(0, 60)}...
    </div>
  </div>
);
