import React from 'react';
import { ColorPalette } from '../../../types';

interface PaletteSwatchProps {
  palette: ColorPalette;
  isActive: boolean;
  onClick: () => void;
}

export const PaletteSwatch: React.FC<PaletteSwatchProps> = ({ palette, isActive, onClick }) => (
  <div 
    onClick={onClick}
    className={`
      flex items-center gap-3 p-2 rounded cursor-pointer transition-all
      ${isActive ? 'bg-zinc-800 ring-1 ring-zinc-700' : 'hover:bg-zinc-900'}
    `}
  >
    <div className="flex -space-x-1 shrink-0">
      {palette.colors.map((color, i) => (
        <div key={i} className="w-4 h-4 rounded-full border border-zinc-900" style={{ backgroundColor: color }} />
      ))}
    </div>
    <div className="min-w-0">
      <div className={`text-[10px] font-bold uppercase tracking-wider truncate ${isActive ? 'text-white' : 'text-zinc-500'}`}>
        {palette.name}
      </div>
    </div>
  </div>
);
