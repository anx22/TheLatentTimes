import React, { useMemo } from 'react';
import { LayoutItem, MagazineItem } from '../types';
import { BLOCK_REGISTRY } from './blocks/templates';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import { Responsive } from 'react-grid-layout';
import WidthProvider from 'react-grid-layout';

interface MagazineGridProps {
  layout: LayoutItem[];
  onLayoutChange?: (newLayout: LayoutItem[]) => void;
  onItemClick?: (item: MagazineItem) => void;
}

export const MagazineGrid: React.FC<MagazineGridProps> = ({ 
  layout, 
  onLayoutChange, 
  onItemClick 
}) => {
  const ResponsiveGridLayout = useMemo(() => (WidthProvider as any)(Responsive), []);

  // Convert LayoutItem[] to react-grid-layout format
  const rglLayout = useMemo(() => layout.map(item => ({
    i: item.i,
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h,
  })), [layout]);

  const handleLayoutChange = (newRglLayout: any[]) => {
    if (!onLayoutChange) return;

    const updatedLayout = newRglLayout.map(item => {
      const original = layout.find(l => l.i === item.i);
      return {
        ...original!,
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
      };
    });

    onLayoutChange(updatedLayout);
  };

  return (
    <div className="magazine-grid-container w-full max-w-[1600px] mx-auto px-4 md:px-12 py-12">
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: rglLayout }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        draggableHandle=".grid-drag-handle"
        onLayoutChange={handleLayoutChange}
        margin={[24, 24]}
      >
        {layout.map((item) => {
          const Template = BLOCK_REGISTRY[item.blockType]?.component || BLOCK_REGISTRY['SmallArticle'].component;
          
          return (
            <div key={item.i} className="group overflow-hidden bg-white border border-zinc-100 shadow-sm hover:shadow-xl transition-all duration-500">
              {onLayoutChange && (
                <div className="grid-drag-handle absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 cursor-move transition-opacity">
                  <div className="w-4 h-4 bg-black/10 rounded-full flex items-center justify-center text-[8px] font-bold">⠿</div>
                </div>
              )}
              
              <div 
                className="w-full h-full p-2 cursor-pointer"
                onClick={() => item.data && onItemClick?.(item.data)}
              >
                 <Template 
                    title={item.headline}
                    dek={item.data?.dek || ""}
                    image={item.data?.hero_image_url}
                    data={item.data}
                 />
              </div>
            </div>
          );
        })}
      </ResponsiveGridLayout>
    </div>
  );
};
