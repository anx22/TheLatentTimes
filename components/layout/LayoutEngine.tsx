
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Section, IssueContent, MagazineItem } from '../../types';
import { resolveBinding } from './BindingEngine';

// Block Components
import { HeroTypePlate } from '../blocks/HeroTypePlate';
import { MastheadLane } from '../blocks/MastheadLane';
import { TopicTicker } from '../blocks/TopicTicker';
import { BlackManifestoPanel } from '../blocks/BlackManifestoPanel';
import { FeatureCard } from '../blocks/FeatureCard';
import { StatsStrip } from '../blocks/StatsStrip';
import { FeatureTriptych } from '../blocks/FeatureTriptych';
import { QuotePlate } from '../blocks/QuotePlate';
import { CategoryColumn } from '../blocks/CategoryColumn';
import { TeaserIndexRail } from '../blocks/TeaserIndexRail';
import { KitFeatureCTA } from '../blocks/KitFeatureCTA';
import { MicroIndex } from '../blocks/MicroIndex';
import { DebugScaffold } from '../ui/Editorial';

// --- BLOCK REGISTRY ---
const BLOCK_MAP: Record<string, React.FC<any>> = {
  'HeroTypePlate': HeroTypePlate,
  'MastheadLane': MastheadLane,
  'TopicTicker': TopicTicker,
  'BlackManifestoPanel': BlackManifestoPanel,
  'FeatureCard': FeatureCard,
  'StatsStrip': StatsStrip,
  'FeatureTriptych': FeatureTriptych,
  'QuotePlate': QuotePlate,
  'CategoryColumn': CategoryColumn,
  'TeaserIndexRail': TeaserIndexRail,
  'KitFeatureCTA': KitFeatureCTA,
  'MicroIndex': MicroIndex,
};

// --- CHAOS ENGINE ---
const getChaosClasses = (type?: string): string => {
    switch (type) {
        case 'breakout_left': return '-ml-12 z-20 relative';
        case 'breakout_right': return '-mr-12 z-20 relative';
        case 'overlap_badge': return 'relative z-30 -mt-12';
        default: return '';
    }
};

// --- MOCK BLUEPRINT DATA ---
const BLUEPRINT_ITEM: MagazineItem = {
    id: 'bp_placeholder',
    title: 'Blueprint Layout Headline',
    dek: 'This is a structural placeholder.',
    tags: ['Structure', 'Blueprint'],
    published_at: new Date().toISOString(),
    status: 'published',
    featured_level: 'featured',
    media_type: 'image',
    hero_image_url: 'https://placehold.co/600x400/e0e7ff/3730a3?text=Blueprint+Asset', 
    author: 'System Architecture'
};

const getBlueprintData = (type: string) => {
    if (['TeaserIndexRail', 'CategoryColumn', 'FeatureTriptych', 'MicroIndex', 'StatsStrip'].includes(type)) {
        return { 
            items: Array(6).fill(BLUEPRINT_ITEM).map((i, idx) => ({ 
                ...i, 
                id: `bp_${idx}`, 
                title: `Blueprint Item 0${idx+1}` 
            })) 
        };
    }
    return { item: BLUEPRINT_ITEM };
};

// --- RESIZE HANDLE ---
const ResizeHandle: React.FC<{ 
    direction: 'horizontal' | 'vertical'; 
    onResize: (delta: number) => void; 
}> = ({ direction, onResize }) => {
    // ... (Keep existing implementation logic, styling can remain simple)
    const isHorizontal = direction === 'horizontal';
    const onResizeRef = useRef(onResize);
    useEffect(() => { onResizeRef.current = onResize; });
    const dragStart = useRef<number>(0);
    const accumulatedDelta = useRef<number>(0);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        dragStart.current = isHorizontal ? e.clientX : e.clientY;
        accumulatedDelta.current = 0; 
        const handleMouseMove = (moveEvent: MouseEvent) => {
            const currentPos = isHorizontal ? moveEvent.clientX : moveEvent.clientY;
            const pixelDiff = currentPos - dragStart.current;
            const STEP_SIZE = 80; 
            const steps = Math.round(pixelDiff / STEP_SIZE);
            if (steps !== accumulatedDelta.current) {
                const increment = steps - accumulatedDelta.current;
                if (increment !== 0) { onResizeRef.current(increment); accumulatedDelta.current = steps; }
            }
        };
        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }, [isHorizontal]);

    return (
        <div onMouseDown={handleMouseDown} className={`absolute z-50 bg-transparent hover:bg-black/10 transition-colors group/handle ${isHorizontal ? 'top-0 bottom-0 -right-4 w-8 cursor-col-resize' : '-bottom-4 left-0 right-0 h-8 cursor-row-resize'}`}>
            <div className={`absolute bg-black opacity-0 group-hover/handle:opacity-100 transition-opacity ${isHorizontal ? 'left-1/2 top-0 bottom-0 w-px -ml-px' : 'top-1/2 left-0 right-0 h-px -mt-px'}`}></div>
        </div>
    );
};

// --- SECTION CONTROLS ---
const SectionControls: React.FC<{ id: string; onDelete: (id: string) => void; onMove?: (id: string, dir: 'up' | 'down') => void; }> = ({ id, onDelete, onMove }) => (
    <div className="absolute -left-10 top-0 bottom-0 w-8 flex flex-col items-end py-2 gap-1 opacity-0 group-hover/section:opacity-100 transition-opacity z-40">
        {onMove && (
            <>
                <button onClick={() => onMove(id, 'up')} className="p-1 bg-white border border-black hover:bg-black hover:text-white text-[10px] font-bold" title="Move Up">▲</button>
                <button onClick={() => onMove(id, 'down')} className="p-1 bg-white border border-black hover:bg-black hover:text-white text-[10px] font-bold" title="Move Down">▼</button>
            </>
        )}
        <button onClick={() => confirm('Delete section?') && onDelete(id)} className="p-1 bg-white border border-black hover:bg-red-600 hover:text-white text-black font-bold" title="Delete Section">×</button>
    </div>
);

// --- SECTION INSERTER ---
const SectionInserter: React.FC<{ onInsert: () => void }> = ({ onInsert }) => (
    <div className="h-4 w-full group relative flex items-center justify-center cursor-pointer hover:bg-black/5 transition-colors z-30 -my-2">
        <div className="absolute inset-x-0 h-px bg-black opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <button onClick={onInsert} className="bg-black text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shadow-md opacity-0 group-hover:opacity-100 transition-all transform scale-50 group-hover:scale-100" title="Insert New Section">+</button>
    </div>
);

interface LayoutEngineProps {
  sections: Section[];
  data: IssueContent; 
  onBlockClick?: (blockId: string) => void;
  selectedBlockId?: string | null;
  onContentDrop?: (blockId: string, itemId: string) => void;
  onBlockTypeDrop?: (blockId: string, type: string) => void;
  onBlockSwap?: (sourceId: string, targetId: string) => void;
  onBlockCreate?: (sectionId: string, type: 'BLOCK' | 'CONTENT', payload: string) => void;
  onBlockResize?: (blockId: string, deltaCol: number, deltaRow: number) => void;
  onBlockDelete?: (blockId: string) => void;
  onSectionDelete?: (sectionId: string) => void;
  onSectionMove?: (sectionId: string, dir: 'up' | 'down') => void;
  onSectionAdd?: (index: number) => void;
  showGrid?: boolean;
}

export const LayoutEngine: React.FC<LayoutEngineProps> = ({ 
    sections, data, onBlockClick, selectedBlockId, 
    onContentDrop, onBlockTypeDrop, onBlockSwap, onBlockCreate,
    onBlockResize, onBlockDelete, onSectionDelete, onSectionAdd, onSectionMove, showGrid = false 
}) => {
  const [dragOverBlock, setDragOverBlock] = useState<string | null>(null);
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [isDragOverCanvas, setIsDragOverCanvas] = useState(false);

  // --- HANDLERS (Same logic, compacted) ---
  const handleCanvasDragOver = (e: React.DragEvent) => { e.preventDefault(); if (e.dataTransfer.types.includes('application/x-latent-slot-id')) setIsDragOverCanvas(true); };
  const handleCanvasDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragOverCanvas(false); const blockId = e.dataTransfer.getData('application/x-latent-slot-id'); if (blockId && onBlockDelete) onBlockDelete(blockId); };
  const handleDragOver = (e: React.DragEvent, blockId: string) => { e.preventDefault(); e.stopPropagation(); if (dragOverBlock !== blockId) { setDragOverBlock(blockId); setActiveZone(null); } };
  const handleDrop = (e: React.DragEvent, blockId: string) => { e.preventDefault(); e.stopPropagation(); setDragOverBlock(null); const sourceBlockId = e.dataTransfer.getData('application/x-latent-slot-id'); if (sourceBlockId && onBlockSwap && sourceBlockId !== blockId) { onBlockSwap(sourceBlockId, blockId); return; } const blockType = e.dataTransfer.getData('application/x-latent-block'); if (blockType && onBlockTypeDrop) { onBlockTypeDrop(blockId, blockType); return; } const itemId = e.dataTransfer.getData('text/plain'); if (itemId && onContentDrop) { onContentDrop(blockId, itemId); } };
  const handleBlockDragStart = (e: React.DragEvent, blockId: string) => { if (!onBlockClick) return; e.dataTransfer.setData('application/x-latent-slot-id', blockId); e.dataTransfer.effectAllowed = 'move'; };
  const handleZoneDragOver = (e: React.DragEvent, sectionId: string) => { e.preventDefault(); e.stopPropagation(); if (activeZone !== sectionId) setActiveZone(sectionId); };
  const handleZoneDrop = (e: React.DragEvent, sectionId: string) => { e.preventDefault(); e.stopPropagation(); setActiveZone(null); const blockType = e.dataTransfer.getData('application/x-latent-block'); const itemId = e.dataTransfer.getData('text/plain'); if (onBlockCreate) { if (blockType) onBlockCreate(sectionId, 'BLOCK', blockType); else if (itemId) onBlockCreate(sectionId, 'CONTENT', itemId); } };

  return (
    <div 
        className={`w-full flex flex-col min-h-screen relative pb-48 transition-colors duration-300 ${isDragOverCanvas ? 'bg-red-50' : 'bg-white'}`}
        onDragOver={handleCanvasDragOver}
        onDragLeave={() => setIsDragOverCanvas(false)}
        onDrop={handleCanvasDrop}
    >
      {isDragOverCanvas && <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center bg-red-500/10"><div className="bg-red-600 text-white px-8 py-4 rounded font-bold uppercase tracking-widest text-xl animate-pulse">Eject to Delete</div></div>}

      {/* Grid Guide Overlay */}
      {showGrid && (
          <div className="absolute inset-0 grid grid-cols-12 gap-0 pointer-events-none z-0 opacity-10 h-full w-full max-w-[1920px] mx-auto border-x border-black">
            {Array.from({ length: 12 }).map((_, i) => <div key={i} className="h-full border-r border-black/50"></div>)}
          </div>
      )}

      {onSectionAdd && <SectionInserter onInsert={() => onSectionAdd(0)} />}

      <div className="max-w-[1920px] mx-auto w-full border-x border-black">
        {sections.map((section, index) => {
            return (
                <React.Fragment key={section.id}>
                    <div className="relative group/section">
                        {onSectionDelete && <SectionControls id={section.id} onDelete={onSectionDelete} onMove={onSectionMove} />}
                        <section className={`
                            w-full relative z-10 grid grid-cols-12 auto-rows-[auto] gap-0
                            ${section.className || ''}
                        `}>
                            {section.blocks.map((block) => {
                                const Component = BLOCK_MAP[block.block_type] || (() => <DebugScaffold label={block.block_type} error="MISSING_IMPL" />);
                                const colSpanClass = `col-span-12 md:col-span-${block.col_span}`;
                                const rowSpanClass = `row-span-${Math.max(1, block.row_span || 4)}`;
                                const chaosClass = getChaosClasses(block.chaos_type);
                                const isSelected = selectedBlockId === block.id;
                                const isDragTarget = dragOverBlock === block.id;
                                const resolvedData = resolveBinding(block, data);
                                const isSystemBlock = ['MastheadLane', 'TopicTicker', 'StatsStrip', 'MicroIndex', 'KitFeatureCTA'].includes(block.block_type);
                                const isEmpty = !isSystemBlock && !resolvedData.item && !resolvedData.items && !resolvedData.staticContent;
                                const isPlaceholder = isEmpty;
                                const displayData = isPlaceholder ? getBlueprintData(block.block_type) : resolvedData;

                                return (
                                    <div 
                                        key={block.id} 
                                        draggable={!!onBlockClick} 
                                        onDragStart={(e) => handleBlockDragStart(e, block.id)}
                                        className={`
                                            ${colSpanClass} ${rowSpanClass} ${chaosClass} relative group bg-white
                                            border-b border-r border-black transition-all duration-200
                                            ${onBlockClick ? 'cursor-grab active:cursor-grabbing' : ''}
                                            ${isSelected ? 'ring-2 ring-black z-30' : ''}
                                            ${isDragTarget ? 'ring-4 ring-emerald-500 ring-inset z-40 bg-emerald-50/50 scale-[0.98]' : ''}
                                        `}
                                        onClick={(e) => { if (onBlockClick) { e.stopPropagation(); onBlockClick(block.id); } }}
                                        onDragOver={(e) => onBlockClick && handleDragOver(e, block.id)}
                                        onDragLeave={() => setDragOverBlock(null)}
                                        onDrop={(e) => onBlockClick && handleDrop(e, block.id)}
                                    >
                                        {isSelected && onBlockResize && (
                                            <>
                                                <ResizeHandle direction="horizontal" onResize={(d) => onBlockResize(block.id, d, 0)} />
                                                <ResizeHandle direction="vertical" onResize={(d) => onBlockResize(block.id, 0, d)} />
                                            </>
                                        )}

                                        {showGrid && (
                                            <div className="absolute top-1 right-1 bg-black text-white text-[8px] font-bold px-1 z-20 pointer-events-none opacity-50">
                                                {block.col_span}x{block.row_span || 4}
                                            </div>
                                        )}

                                        <div className="w-full h-full relative overflow-hidden">
                                            <div style={isPlaceholder ? { filter: 'grayscale(1) contrast(1.2) opacity(0.3)' } : {}} className="h-full w-full">
                                                <Component config={block} content={data} data={displayData.item} items={displayData.items} />
                                            </div>
                                            {isPlaceholder && (
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                    <span className="bg-black text-white text-[9px] font-bold uppercase px-2 py-1 tracking-widest rotate-[-15deg]">
                                                        {block.block_type.replace(/([A-Z])/g, ' $1').trim()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {onBlockCreate && (
                                <div 
                                    className={`col-span-12 row-span-4 border-b border-black flex flex-col items-center justify-center transition-all duration-200 cursor-copy ${activeZone === section.id ? 'bg-emerald-500 text-white scale-[0.99] shadow-inner' : 'hover:bg-neutral-50'}`}
                                    onDragOver={(e) => handleZoneDragOver(e, section.id)}
                                    onDragLeave={() => setActiveZone(null)}
                                    onDrop={(e) => handleZoneDrop(e, section.id)}
                                >
                                    <span className="text-xl font-light mb-1">+</span>
                                    <span className="text-[9px] font-bold uppercase tracking-widest">{activeZone === section.id ? 'Release to Create' : 'Add Block'}</span>
                                </div>
                            )}
                        </section>
                    </div>
                    {onSectionAdd && <SectionInserter onInsert={() => onSectionAdd(index + 1)} />}
                </React.Fragment>
            );
        })}
      </div>
    </div>
  );
};
