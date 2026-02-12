
import React from 'react';
import { Section, BlockInstance, IssueContent } from '../../types';
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
        case 'breakout_left':
            return '-ml-12 z-20 shadow-2xl rotate-1';
        case 'breakout_right':
            return '-mr-12 z-20 shadow-2xl -rotate-1';
        case 'overlap_badge':
            return 'relative before:content-["NEW"] before:absolute before:-top-4 before:-right-4 before:bg-accent before:text-white before:px-2 before:py-1 before:text-xs before:font-bold before:z-30 before:rotate-12';
        case 'tilt_hover':
            return 'transition-transform duration-500 hover:rotate-2 hover:scale-105 z-10';
        default:
            return '';
    }
};

interface LayoutEngineProps {
  sections: Section[];
  data: IssueContent; 
  onBlockClick?: (blockId: string) => void;
  selectedBlockId?: string | null;
}

export const LayoutEngine: React.FC<LayoutEngineProps> = ({ sections, data, onBlockClick, selectedBlockId }) => {
  return (
    <div className="w-full flex flex-col bg-background overflow-x-hidden">
      {sections.map((section) => (
        <section 
          key={section.id} 
          className={`
            w-full max-w-[1536px] mx-auto px-6 md:px-16
            grid grid-cols-12 gap-x-4 md:gap-x-8 gap-y-12
            ${section.className || ''}
            ${section.layout_mode === 'fixed_height' ? 'min-h-screen' : ''}
          `}
        >
          {section.blocks.map((block) => {
            const Component = BLOCK_MAP[block.block_type] || (() => <DebugScaffold label={block.block_type} error="MISSING_IMPL" />);
            
            // Grid Placement
            const colSpanClass = `col-span-12 md:col-span-${block.col_span}`;
            const rowSpanClass = block.row_span ? `row-span-${block.row_span}` : '';
            
            // Chaos Injection
            const chaosClass = getChaosClasses(block.chaos_type);
            const isSelected = selectedBlockId === block.id;
            
            // --- DATA BINDING ---
            // Resolve the specific data needed for this block
            const resolvedData = resolveBinding(block, data);

            return (
              <div 
                key={block.id} 
                className={`
                    ${colSpanClass} ${rowSpanClass} ${chaosClass} relative
                    ${onBlockClick ? 'cursor-pointer hover:ring-2 hover:ring-indigo-300 hover:ring-opacity-50 transition-all' : ''}
                    ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 z-30' : ''}
                `}
                onClick={(e) => {
                    if (onBlockClick) {
                        e.stopPropagation();
                        onBlockClick(block.id);
                    }
                }}
              >
                {/* Visual Indicator for Binding Mode */}
                {isSelected && (
                    <div className="absolute -top-3 -right-3 z-40 bg-indigo-600 text-white text-[9px] font-bold px-2 py-1 rounded shadow-lg">
                        {block.data_binding.source.toUpperCase()}
                    </div>
                )}

                <Component 
                   config={block} 
                   content={data} // Pass full context if block needs global data (like Ticker)
                   data={resolvedData.item} // Pass resolved item if 'query' or 'pinned'
                   items={resolvedData.items} // Pass array if multi-item query
                />
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
};
