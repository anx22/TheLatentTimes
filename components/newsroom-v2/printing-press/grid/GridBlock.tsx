import React, { forwardRef } from 'react';
import { Maximize2 } from 'lucide-react';
import { HeroTypePlate } from '../../../blocks/HeroTypePlate';
import { FeatureCard } from '../../../blocks/FeatureCard';
import { QuotePlate } from '../../../blocks/QuotePlate';
import { BlackManifestoPanel } from '../../../blocks/BlackManifestoPanel';
import { BlockInstance, IssueContent, MagazineItem } from '../../../../types';

interface GridBlockProps {
  style?: React.CSSProperties;
  className?: string;
  onMouseDown?: React.MouseEventHandler;
  onMouseUp?: React.MouseEventHandler;
  onTouchEnd?: React.TouchEventHandler;
  children?: React.ReactNode;
  // Custom props
  headline: string;
  type: string;
  blockType?: 'HeroTypePlate' | 'FeatureCard' | 'QuotePlate' | 'BlackManifestoPanel';
  data?: MagazineItem;
}

// Mock data helpers for preview
const createMockBlock = (type: string): BlockInstance => ({
  id: 'mock',
  block_type: type as any,
  col_span: 12,
  variant: 'M',
  data_binding: { source: 'static' }
});

const createMockContent = (headline: string, data?: MagazineItem): IssueContent => ({
  meta: {} as any,
  items: [],
  ticker: [],
  cover: { 
    title: data?.title || headline, 
    deck: data?.dek || "Mock Deck", 
    eyebrow: data?.tags?.[0] || "Mock Eyebrow", 
    coverlines: [], 
    imgPrompt: "" 
  },
  edit: [],
  drops: [],
  debates: [],
  features: [],
  columns: [],
  atelier: [],
  index_keys: [],
  colophon: { contributors: [], sources: [], corrections: [] }
});

const createMockItem = (headline: string, data?: MagazineItem): MagazineItem => {
  if (data) return data;
  
  return {
    id: 'mock',
    title: headline,
    dek: "A sample deck for the grid layout preview.",
    published_at: new Date().toISOString(),
    tags: ['Design', 'System'],
    media_type: 'image',
    status: 'published',
    featured_level: 'none'
  };
};

export const GridBlock = forwardRef<HTMLDivElement, GridBlockProps>(
  ({ style, className, onMouseDown, onMouseUp, onTouchEnd, children, headline, type, blockType, data, ...props }, ref) => {
    
    const renderContent = () => {
      const mockBlock = createMockBlock(blockType || 'HeroTypePlate');
      const mockContent = createMockContent(headline, data);
      const itemData = createMockItem(headline, data);

      switch (blockType) {
        case 'HeroTypePlate':
          return <HeroTypePlate config={mockBlock} content={mockContent} data={itemData} />;
        case 'FeatureCard':
          return <FeatureCard config={mockBlock} data={itemData} />;
        case 'QuotePlate':
          return <QuotePlate config={mockBlock} data={itemData} />;
        case 'BlackManifestoPanel':
          return <BlackManifestoPanel config={mockBlock} content={mockContent} />;
        default:
          return (
            <div className="flex-1 min-h-0 p-4 flex flex-col justify-center h-full">
              <h3 className="font-display font-bold text-lg leading-tight uppercase tracking-tight text-black line-clamp-3">
                {itemData.title}
              </h3>
              {itemData.dek && (
                <p className="text-xs text-zinc-500 mt-2 line-clamp-3 font-serif">
                  {itemData.dek}
                </p>
              )}
            </div>
          );
      }
    };

    return (
      <div
        ref={ref}
        style={style}
        className={`${className} bg-white border border-zinc-800 shadow-sm flex flex-col relative group overflow-hidden`}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onTouchEnd={onTouchEnd}
        {...props}
      >
        {/* Header / Type Label Overlay */}
        <div className="absolute top-2 left-2 z-10 pointer-events-none">
          <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 bg-white/90 px-1">{type}</span>
        </div>

        {/* Content */}
        <div className="flex-1 w-full h-full overflow-hidden pointer-events-none">
          {renderContent()}
        </div>

        {/* Resize Handle (Visual Only - RGL handles the actual drag) */}
        <div className="absolute bottom-2 right-2 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <Maximize2 className="w-4 h-4" />
        </div>
        
        {children}
      </div>
    );
  }
);

GridBlock.displayName = 'GridBlock';
