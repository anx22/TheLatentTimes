import React, { forwardRef } from 'react';
import { Maximize2 } from 'lucide-react';
import { MagazineItem } from '../../../../types';
import * as EditorialBlocks from '../../../blocks/EditorialBlocks';

interface GridBlockProps {
  style?: React.CSSProperties;
  className?: string;
  onMouseDown?: React.MouseEventHandler;
  onMouseUp?: React.MouseEventHandler;
  onTouchEnd?: React.TouchEventHandler;
  children?: React.ReactNode;
  // Custom props
  headline: string;
  blockType?: string;
  data?: MagazineItem;
  readOnly?: boolean;
}

export const GridBlock = forwardRef<HTMLDivElement, GridBlockProps>(
  ({ style, className, onMouseDown, onMouseUp, onTouchEnd, children, headline, blockType, data, readOnly, ...props }, ref) => {
    
    const renderContent = () => {
      switch (blockType) {
        case 'CoverStory':
          return <EditorialBlocks.CoverStoryBlock data={data} />;
        case 'Glamour':
          return <EditorialBlocks.GlamourBlock data={data} />;
        case 'Image':
          return <EditorialBlocks.ImageBlock imageUrl={data?.hero_image_url || 'https://picsum.photos/800/1200?random=1'} caption={data?.dek} />;
        case 'Quote':
          return <EditorialBlocks.QuoteBlock quote={data?.dek || "The algorithm doesn't want your truth. It wants your retention."} author={data?.author || "ANON, CHIEF HOOK OFFICER"} />;
        case 'SectionHeader':
          return <EditorialBlocks.SectionHeaderBlock text={<>We are entering the <span className="text-[#e60042] italic">Golden Age</span> of synthetic media. Not as a tool, but as a material. The prompt is dead; the cursor is a conductor's baton.</>} />;
        case 'NewCanon':
          return <EditorialBlocks.NewCanonBlock />;
        case 'IdentitySystems':
          return <EditorialBlocks.IdentitySystemsBlock />;
        case 'SyntheticEra':
          return <EditorialBlocks.SyntheticEraBlock />;
        case 'HouseView':
          return <EditorialBlocks.HouseViewBlock />;
        case 'CuratorsDilemma':
          return <EditorialBlocks.CuratorsDilemmaBlock />;
        case 'SmallArticle':
          return <EditorialBlocks.SmallArticleBlock category={data?.tags?.[0] || 'ESSAY / CODE'} title={headline} deck={data?.dek || 'When the pipeline fixes its own breaks, the engineer becomes the curator.'} imageUrl={data?.hero_image_url || 'https://picsum.photos/400/300?random=2'} />;
        case 'LargeQuote':
          return <EditorialBlocks.LargeQuoteBlock />;
        case 'MassiveHeadline':
          return <EditorialBlocks.MassiveHeadlineBlock />;
        case 'HookFactory':
          return <EditorialBlocks.HookFactoryBlock />;
        case 'LatentSpace':
          return <EditorialBlocks.LatentSpaceBlock />;
        case 'SyntheticHallucination':
          return <EditorialBlocks.SyntheticHallucinationBlock />;
        case 'IndexList':
          return <EditorialBlocks.IndexListBlock />;
        default:
          return (
            <div className="flex flex-col h-full p-6 border-t border-black bg-[#faf9f6]">
              <h3 className="font-serif font-bold text-2xl leading-tight text-zinc-950 mb-3">
                {headline}
              </h3>
              <p className="text-sm text-zinc-700 leading-relaxed font-serif">
                {data?.dek || "Placeholder deck text."}
              </p>
            </div>
          );
      }
    };

    return (
      <div
        ref={ref}
        style={style}
        className={`${className} flex flex-col relative group overflow-hidden`}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onTouchEnd={onTouchEnd}
        {...props}
      >
        {/* Content */}
        <div className="flex-1 w-full h-full overflow-hidden flex flex-col">
          {renderContent()}
        </div>

        {/* Resize Handle (Visual Only - RGL handles the actual drag) */}
        {!readOnly && (
          <div className="absolute bottom-2 right-2 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
            <Maximize2 className="w-4 h-4" />
          </div>
        )}
        
        {children}
      </div>
    );
  }
);

GridBlock.displayName = 'GridBlock';
