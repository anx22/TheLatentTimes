import React, { useState } from 'react';
import { NewspaperGrid, LayoutItem } from './grid/NewspaperGrid';
import { GalleyRail } from './GalleyRail';
import { useNewsroom } from '../../../hooks/useNewsroom';
import { MagazineItem } from '../../../types';

export const ThePress: React.FC = () => {
  const { draft, image } = useNewsroom();
  const [scale, setScale] = useState(1.0);
  
  // Mock Galley Items (In real app, filter items not in layout)
  const [galleyItems, setGalleyItems] = useState<MagazineItem[]>([
    {
      id: 'galley_1',
      title: "The Future of Print",
      dek: "Why physical media is making a comeback in the digital age.",
      published_at: new Date().toISOString(),
      tags: ['Culture'],
      media_type: 'text',
      status: 'approved',
      featured_level: 'none'
    },
    {
      id: 'galley_2',
      title: "Neural Networks Visualization",
      dek: "Seeing the unseen layers of deep learning models.",
      published_at: new Date().toISOString(),
      tags: ['Tech', 'Visuals'],
      media_type: 'image',
      status: 'approved',
      featured_level: 'none'
    }
  ]);

  const handleLayoutChange = (layout: LayoutItem[]) => {
    console.log('Layout changed in ThePress:', layout);
  };

  const handleDragStart = (e: React.DragEvent, item: MagazineItem) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
  };

  const handleRemoveFromGalley = (id: string) => {
    setGalleyItems(prev => prev.filter(item => item.id !== id));
  };

  const handleGridDrop = (layout: LayoutItem[], item: LayoutItem, e: DragEvent) => {
    // Retrieve the item data from the drag event
    // Note: In real RGL, the 'e' passed to onDrop might be a synthetic event or native event depending on version
    // We might need to access the dataTransfer from the source if possible, or use a shared state for "draggingItem"
    // However, RGL's onDrop gives us the final layout item position.
    
    // For now, we'll assume the item added to layout needs to be enriched with the galley item data.
    // Since RGL doesn't pass the dataTransfer in a way we can easily read async in some versions, 
    // a common pattern is to store the "currently dragging" item in a ref or state when drag starts in Galley.
    
    // But let's try to read it if possible, or better: use a state for "draggedItem" lifted to this component.
  };
  
  // We need a state to track what is being dragged to pass metadata to the grid on drop
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
          <div className="text-[10px] font-mono text-zinc-600">
            PRESS BED: 1200px WIDTH
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
              onLayoutChange={handleLayoutChange} 
              scale={scale}
              isDroppable={true}
              draggedItem={draggedItem}
              onDropItem={(item) => {
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
