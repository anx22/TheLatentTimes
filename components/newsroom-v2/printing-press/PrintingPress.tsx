import React, { useState, useEffect } from 'react';
import { NewspaperGrid } from './grid/NewspaperGrid';
import { GalleyRail } from './GalleyRail';
import { useNewsroom } from '../../../hooks/useNewsroom';
import { MagazineItem } from '../../../types';

export const PrintingPress: React.FC = () => {
  const { draft, image, publish, layout, setLayout } = useNewsroom();
  const [scale, setScale] = useState(1.0);
  
  const [galleyItems, setGalleyItems] = useState<MagazineItem[]>([]);

  useEffect(() => {
    if (draft) {
      const draftItem: MagazineItem = {
        id: 'current_draft',
        title: draft.headline,
        dek: draft.deck,
        published_at: new Date().toISOString(),
        tags: draft.tags || [],
        media_type: image ? 'image' : 'text',
        hero_image_url: image || undefined,
        status: 'approved',
        featured_level: 'none',
        body: draft.body,
        blocks: draft.blocks
      };
      
      setGalleyItems(prev => {
        if (!prev.find(i => i.id === 'current_draft')) {
          return [draftItem, ...prev];
        }
        return prev;
      });
    }
  }, [draft, image]);

  const handleRemoveFromGalley = (id: string) => {
    setGalleyItems(prev => prev.filter(item => item.id !== id));
  };
  
  const [draggedItem, setDraggedItem] = useState<MagazineItem | null>(null);

  const onGalleyDragStart = (e: React.DragEvent, item: MagazineItem) => {
    setDraggedItem(item);
    e.dataTransfer.setData('text/plain', item.id); // Required for Firefox
  };

  return (
    <div className="flex h-full bg-zinc-950 overflow-hidden">
      {/* 1. The Galley (Sidebar) */}
      <GalleyRail 
        items={galleyItems} 
        onDragStart={onGalleyDragStart}
        onRemove={handleRemoveFromGalley}
      />

      {/* 2. The Press Bed (Main Area) */}
      <div className="flex-1 relative overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="h-12 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900/50 z-10">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">ZOOM LEVEL</span>
            <div className="flex items-center gap-1 bg-zinc-950 rounded p-1 border border-zinc-800">
              <button 
                onClick={() => setScale(Math.max(0.25, scale - 0.1))}
                className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
              >-</button>
              <span className="w-12 text-center text-[10px] font-mono text-zinc-300">{(scale * 100).toFixed(0)}%</span>
              <button 
                onClick={() => setScale(Math.min(1.5, scale + 0.1))}
                className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
              >+</button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-[10px] font-mono text-zinc-600">
              PRESS BED: 1200px WIDTH
            </div>
            <button
              onClick={publish}
              className="px-4 py-1.5 bg-emerald-500 text-black text-[10px] font-bold uppercase tracking-widest rounded hover:bg-emerald-400 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            >
              Publish Issue
            </button>
          </div>
        </div>

        {/* Scrollable Canvas Area */}
        <div className="flex-1 overflow-auto bg-zinc-900/50 relative p-12">
          <div 
            className="origin-top mx-auto transition-transform duration-200 ease-out shadow-2xl"
            style={{ 
              transform: `scale(${scale})`,
              width: '1200px', // Match grid width
              height: 'fit-content'
            }}
          >
            <NewspaperGrid 
              layout={layout}
              onLayoutChange={setLayout} 
              scale={scale}
              isDroppable={true}
              draggedItem={draggedItem}
              onDropItem={() => {
                 // Remove from galley
                 if (draggedItem) {
                    setGalleyItems(prev => prev.filter(i => i.id !== draggedItem.id));
                    setDraggedItem(null);
                 }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
