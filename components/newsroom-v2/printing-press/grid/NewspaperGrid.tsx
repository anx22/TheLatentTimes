import React, { useState, useRef, useEffect } from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { GridBlock } from './GridBlock';
import { MagazineItem, LayoutItem } from '../../../../types';
import { INITIAL_LAYOUT } from '../../../../constants';

interface NewspaperGridProps {
  onLayoutChange: (layout: LayoutItem[]) => void;
  scale?: number;
  isDroppable?: boolean;
  draggedItem?: MagazineItem | null;
  onDropItem?: (item: LayoutItem) => void;
  readOnly?: boolean;
  layout?: LayoutItem[];
}

const GridLayoutAny = GridLayout as any;

export const NewspaperGrid: React.FC<NewspaperGridProps> = ({ 
  onLayoutChange, 
  scale = 1,
  isDroppable = false,
  draggedItem,
  onDropItem,
  readOnly = false,
  layout: propLayout
}) => {
  const [internalLayout, setInternalLayout] = useState<LayoutItem[]>(INITIAL_LAYOUT);
  const layout = propLayout || internalLayout;
  const setLayout = (l: LayoutItem[]) => {
    if (propLayout) {
      onLayoutChange(l);
    } else {
      setInternalLayout(l);
      onLayoutChange(l);
    }
  };
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1200);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        console.log("Container width:", entry.contentRect.width, "Window width:", window.innerWidth);
        setContainerWidth(entry.contentRect.width);
      }
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const handleLayoutChange = (newLayout: any) => {
    const mergedLayout = newLayout.map((l: any) => {
      const original = layout.find(o => o.i === l.i);
      return { ...original, ...l };
    });
    setLayout(mergedLayout);
    onLayoutChange(mergedLayout);
  };

  const handleDrop = (layout: LayoutItem[], item: LayoutItem) => {
    if (draggedItem) {
      const newItem: LayoutItem = {
        ...item,
        i: draggedItem.id,
        headline: draggedItem.title,
        type: "NEW DROP",
        blockType: 'SmallArticle',
        minW: 2,
        minH: 2,
        data: draggedItem
      };
      const newLayoutWithItem = [...layout, newItem];
      setLayout(newLayoutWithItem);
      onLayoutChange(newLayoutWithItem);
      if (onDropItem) onDropItem(newItem);
    }
  };

  const cols = 12;
  const rowHeight = 10;
  const margin: [number, number] = [0, 0];
  
  return (
    <div className="p-4">
      
      <div ref={containerRef} className="relative w-full max-w-[1200px] mx-auto bg-white min-h-[1200px] overflow-hidden">
      <GridLayoutAny
        key={cols}
        className="layout"
        layout={layout}
        cols={cols}
        rowHeight={rowHeight}
        width={containerWidth}
        onLayoutChange={handleLayoutChange}
        isDraggable={!readOnly}
        isResizable={!readOnly}
        isDroppable={!readOnly && isDroppable}
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
            headline={item.headline || "Untitled"} 
            blockType={item.blockType}
            data={item.data}
            className={readOnly ? "" : "cursor-move"}
            readOnly={readOnly}
          />
        ))}
      </GridLayoutAny>
      </div>
    </div>
  );
};
