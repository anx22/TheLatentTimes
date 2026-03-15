import React from 'react';
import { MagazineItem } from '../../../types';
import { Trash2 } from 'lucide-react';

interface GalleyRailProps {
  items: MagazineItem[];
  onDragStart?: (e: React.DragEvent, item: MagazineItem) => void;
  onRemove?: (id: string) => void;
}

export const GalleyRail: React.FC<GalleyRailProps> = ({ items, onDragStart, onRemove }) => {
  return (
    <div className="w-80 h-full border-r border-zinc-800 bg-zinc-950 flex flex-col shrink-0">
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">The Galley</h2>
        <p className="text-[10px] text-zinc-600 mt-1">DRAG TO PLACE ON GRID</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.map((item) => (
          <div 
            key={item.id}
            className="bg-white border border-zinc-200 p-3 shadow-sm relative group transition-all hover:shadow-md hover:border-zinc-300 cursor-grab active:cursor-grabbing"
            draggable
            onDragStart={(e) => onDragStart && onDragStart(e, item)}
          >
            {/* Remove Button */}
            <button 
              onClick={(e) => {
                e.stopPropagation(); // Prevent drag start when clicking remove
                if (onRemove) onRemove(item.id);
              }}
              className="absolute top-2 right-2 text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remove from Galley"
            >
              <Trash2 className="w-3 h-3" />
            </button>

            <div className="flex justify-between items-start mb-2 pr-6">
              <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-1 rounded">READY</span>
            </div>
            
            <h3 className="text-sm font-bold text-zinc-900 leading-tight mb-2 font-display pr-2">
              {item.title}
            </h3>
            
            <p className="text-[10px] text-zinc-500 line-clamp-2 leading-relaxed font-serif">
              {item.dek}
            </p>

            <div className="mt-2 flex items-center gap-2">
               <span className="text-[9px] font-mono text-zinc-400 uppercase">{item.media_type}</span>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-center py-12 opacity-50 border-2 border-dashed border-zinc-800 rounded m-2">
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Galley Empty</p>
          </div>
        )}
      </div>
    </div>
  );
};
