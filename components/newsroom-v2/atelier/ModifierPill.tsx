import React from 'react';

interface ModifierPillProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export const ModifierPill: React.FC<ModifierPillProps> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`
      px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all
      ${isActive 
        ? 'bg-white text-black border-white' 
        : 'bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300'
      }
    `}
  >
    {label}
  </button>
);
