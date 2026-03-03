import React from 'react';
import { MonitorPlay, Loader2 } from 'lucide-react';
import { BlockType, BlockInstance, IssueContent, MagazineItem } from '../../../types';
import { HeroTypePlate } from '../../../components/blocks/HeroTypePlate';
import { FeatureCard } from '../../../components/blocks/FeatureCard';
import { BlackManifestoPanel } from '../../../components/blocks/BlackManifestoPanel';
import { QuotePlate } from '../../../components/blocks/QuotePlate';

interface PressCanvasProps {
  previewLayout: BlockType;
  previewItem: MagazineItem | null;
  mockIssueContent: IssueContent;
  previewBlock: BlockInstance;
  isPublishing?: boolean;
}

export const PressCanvas: React.FC<PressCanvasProps> = ({ 
  previewLayout, 
  previewItem, 
  mockIssueContent, 
  previewBlock,
  isPublishing 
}) => {
  const renderPreview = () => {
    if (!previewItem) return null;

    switch (previewLayout) {
      case 'HeroTypePlate': return <HeroTypePlate config={previewBlock} content={mockIssueContent} data={previewItem} />;
      case 'FeatureCard': return <FeatureCard config={previewBlock} data={previewItem} />;
      case 'BlackManifestoPanel': return <BlackManifestoPanel config={previewBlock} content={mockIssueContent} />;
      case 'QuotePlate': return <QuotePlate config={previewBlock} data={previewItem} />;
      default: return <HeroTypePlate config={previewBlock} content={mockIssueContent} data={previewItem} />;
    }
  };

  return (
    <div className="flex-1 relative flex items-center justify-center p-12 overflow-hidden bg-zinc-900/30 group">
      {/* Composition Guides Overlay */}
      <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
        <div className="border border-dashed border-white/5 w-[90%] h-[90%] flex items-center justify-center">
           <span className="text-[8px] text-white/10 uppercase tracking-widest">GRID BOUNDARY</span>
        </div>
      </div>
      
      {previewItem ? (
         <div className="relative shadow-2xl max-h-full max-w-full w-full max-w-4xl bg-white overflow-hidden animate-fade-in">
           {renderPreview()}
         </div>
      ) : (
        <div className="text-center space-y-4 opacity-50">
          <MonitorPlay className="w-16 h-16 mx-auto text-zinc-700" />
          <p className="text-sm text-zinc-500 tracking-widest uppercase">PRESS READY</p>
        </div>
      )}

      {isPublishing && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto" />
            <p className="text-xs font-bold tracking-widest text-emerald-500 uppercase animate-pulse">PUBLISHING TO GRID...</p>
          </div>
        </div>
      )}

      {/* Overlay Badge */}
      <div className="absolute top-6 right-6 bg-black/80 backdrop-blur text-white text-[10px] font-bold px-3 py-1.5 rounded border border-white/10 flex items-center gap-2 z-30">
        <MonitorPlay className="w-3 h-3 text-emerald-500" />
        LIVE PREVIEW
      </div>
    </div>
  );
};
