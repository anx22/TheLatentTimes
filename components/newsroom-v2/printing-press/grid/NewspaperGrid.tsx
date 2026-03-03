import React, { useState } from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { GridBlock } from './GridBlock';
import { LayoutTemplate } from 'lucide-react';
import { MagazineItem } from '../../../../types';

export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
  static?: boolean;
  isDraggable?: boolean;
  isResizable?: boolean;
  // Custom data
  headline?: string;
  type?: string;
  blockType?: 'HeroTypePlate' | 'FeatureCard' | 'QuotePlate' | 'BlackManifestoPanel';
  data?: MagazineItem;
}

interface NewspaperGridProps {
  onLayoutChange: (layout: LayoutItem[]) => void;
  scale?: number;
  isDroppable?: boolean;
  draggedItem?: MagazineItem | null;
  onDropItem?: (item: LayoutItem) => void;
}

const INITIAL_LAYOUT: LayoutItem[] = [
  // Row 1: Hero + Sidebar
  { i: 'item_1', x: 0, y: 0, w: 4, h: 10, headline: "The Architecture of Latent Space", type: "LEAD STORY", blockType: 'HeroTypePlate' },
  { i: 'item_2', x: 4, y: 0, w: 2, h: 10, headline: "Glitch as Currency", type: "SIDEBAR", blockType: 'FeatureCard' },
  
  // Row 2: Triptych / Features
  { i: 'item_3', x: 0, y: 10, w: 2, h: 6, headline: "Recursive Self-Improvement", type: "OPINION", blockType: 'QuotePlate' },
  { i: 'item_4', x: 2, y: 10, w: 2, h: 6, headline: "The Void Stares Back", type: "ESSAY", blockType: 'BlackManifestoPanel' },
  { i: 'item_5', x: 4, y: 10, w: 2, h: 6, headline: "Zero Day", type: "DATA", blockType: 'FeatureCard' },
  
  // Row 3: Full Width Notice
  { i: 'item_6', x: 0, y: 16, w: 6, h: 4, headline: "System Update: v2.0", type: "NOTICE", blockType: 'HeroTypePlate' },

  // Row 4: Dense Grid
  { i: 'item_7', x: 0, y: 20, w: 2, h: 4, headline: "Neural Drift", type: "ANALYSIS", blockType: 'FeatureCard' },
  { i: 'item_8', x: 2, y: 20, w: 2, h: 4, headline: "Prompt Engineering as Art", type: "CRAFT", blockType: 'FeatureCard' },
  { i: 'item_9', x: 4, y: 20, w: 2, h: 4, headline: "The Uncanny Valley", type: "THEORY", blockType: 'QuotePlate' },
  
  // Row 5: Footer / Index
  { i: 'item_10', x: 0, y: 24, w: 6, h: 3, headline: "Index of Signals", type: "INDEX", blockType: 'BlackManifestoPanel' },
];

const GridLayoutAny = GridLayout as any;

export const NewspaperGrid: React.FC<NewspaperGridProps> = ({ 
  onLayoutChange, 
  scale = 1,
  isDroppable = false,
  draggedItem,
  onDropItem
}) => {
  const [layout, setLayout] = useState<LayoutItem[]>(INITIAL_LAYOUT);

  const handleLayoutChange = (newLayout: any) => {
    // Merge new layout positions with original data
    const mergedLayout = newLayout.map((l: any) => {
      const original = layout.find(o => o.i === l.i);
      return { ...original, ...l };
    });
    setLayout(mergedLayout);
    onLayoutChange(mergedLayout);
  };

  const handleDrop = (layout: LayoutItem[], item: LayoutItem, e: Event) => {
    if (draggedItem) {
      const newItem: LayoutItem = {
        ...item,
        i: draggedItem.id, // Use the ID from the dragged item
        headline: draggedItem.title,
        type: "NEW DROP",
        blockType: 'FeatureCard', // Default block type
        minW: 2,
        minH: 2,
        data: draggedItem // Pass the full data
      };
      
      // Update layout with the new item properly merged
      const newLayoutWithItem = [...layout, newItem];
      setLayout(newLayoutWithItem);
      onLayoutChange(newLayoutWithItem);
      
      if (onDropItem) {
        onDropItem(newItem);
      }
    }
  };

  // Grid Configuration
  const width = 1200;
  const cols = 6;
  const rowHeight = 50;
  const margin: [number, number] = [20, 20];
  
  return (
    <div className="relative w-[1200px] bg-white shadow-2xl min-h-[1200px] border border-zinc-200 mx-auto my-12 overflow-hidden group/grid">
      <style>{`
        .react-grid-item > .react-resizable-handle {
          opacity: 0;
          transition: opacity 0.2s;
          z-index: 50;
        }
        .react-grid-item:hover > .react-resizable-handle {
          opacity: 1;
        }
        .react-resizable-handle-se {
          bottom: 0;
          right: 0;
          cursor: se-resize;
          width: 20px;
          height: 20px;
          background-image: linear-gradient(135deg, transparent 50%, #000 50%);
          background-size: 10px 10px;
          background-repeat: no-repeat;
          background-position: bottom right;
        }
        .react-resizable-handle-sw {
          bottom: 0;
          left: 0;
          cursor: sw-resize;
          width: 20px;
          height: 20px;
          background-image: linear-gradient(225deg, transparent 50%, #000 50%);
          background-size: 10px 10px;
          background-repeat: no-repeat;
          background-position: bottom left;
        }
        .react-resizable-handle-ne {
          top: 0;
          right: 0;
          cursor: ne-resize;
          width: 20px;
          height: 20px;
          background-image: linear-gradient(45deg, transparent 50%, #000 50%);
          background-size: 10px 10px;
          background-repeat: no-repeat;
          background-position: top right;
        }
        .react-resizable-handle-nw {
          top: 0;
          left: 0;
          cursor: nw-resize;
          width: 20px;
          height: 20px;
          background-image: linear-gradient(315deg, transparent 50%, #000 50%);
          background-size: 10px 10px;
          background-repeat: no-repeat;
          background-position: top left;
        }
        .react-resizable-handle-s {
          bottom: 0;
          left: 50%;
          margin-left: -10px;
          cursor: s-resize;
          width: 20px;
          height: 10px;
          border-bottom: 2px solid #000;
        }
        .react-resizable-handle-e {
          right: 0;
          top: 50%;
          margin-top: -10px;
          cursor: e-resize;
          width: 10px;
          height: 20px;
          border-right: 2px solid #000;
        }
        .react-resizable-handle-w {
          left: 0;
          top: 50%;
          margin-top: -10px;
          cursor: w-resize;
          width: 10px;
          height: 20px;
          border-left: 2px solid #000;
        }
        .react-resizable-handle-n {
          top: 0;
          left: 50%;
          margin-left: -10px;
          cursor: n-resize;
          width: 20px;
          height: 10px;
          border-top: 2px solid #000;
        }
      `}</style>
      
      {/* Visual Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-5" 
           style={{ 
             display: 'grid',
             gridTemplateColumns: `repeat(${cols}, 1fr)`,
             gap: `${margin[0]}px`,
             padding: 0,
             width: '100%',
             height: '100%'
           }} 
      >
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-full border-r border-l border-black bg-zinc-100/50" />
        ))}
      </div>
      
      {/* Horizontal Rhythm Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-5"
           style={{
             backgroundImage: `linear-gradient(to bottom, #000 1px, transparent 1px)`,
             backgroundSize: `100% ${rowHeight + margin[1]}px`
           }}
      />

      <div className="absolute top-0 left-0 p-4 opacity-50 pointer-events-none z-10">
        <div className="flex items-center gap-2 text-zinc-400">
          <LayoutTemplate className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">GRID SYSTEM: {cols} COLUMNS</span>
        </div>
      </div>

      <GridLayoutAny
        className="layout"
        layout={layout}
        cols={cols}
        rowHeight={rowHeight}
        width={width}
        onLayoutChange={handleLayoutChange}
        isDraggable={true}
        isResizable={true}
        isDroppable={isDroppable}
        onDrop={handleDrop}
        droppingItem={{ i: 'dropping', w: 4, h: 4 }}
        margin={margin}
        containerPadding={[0, 0]}
        transformScale={scale}
        resizeHandles={['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne']}
      >
        {layout.map((item) => (
          <GridBlock 
            key={item.i} 
            data-grid={item}
            headline={item.headline || "Untitled"} 
            type={item.type || "STORY"}
            blockType={item.blockType}
            data={item.data}
            className="cursor-move"
          />
        ))}
      </GridLayoutAny>
    </div>
  );
};
