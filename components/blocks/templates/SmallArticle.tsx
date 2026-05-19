import React from 'react';
import { BlockTemplate } from '../types';
import { MagazineItem } from '../../../types';

const SmallArticleBlock: React.FC<{ category?: string, title?: string, deck?: string, imageUrl?: string, data?: MagazineItem }> = ({ category, title, deck, imageUrl, data }) => (
  <div className="flex flex-col h-full border-t border-black bg-white text-black overflow-hidden min-h-0">
    <div className="h-48 w-full border-b border-black">
      <img src={data?.hero_image_url || imageUrl || "https://picsum.photos/seed/article/400/300"} alt={data?.title || title} className="w-full h-full object-cover grayscale" />
    </div>
    <div className="p-4 flex flex-col flex-1">
      <div className="text-[9px] font-mono uppercase tracking-widest text-zinc-700 mb-2">{data?.tags?.[0] || category || "Article"}</div>
      <h4 className="font-serif text-lg leading-tight mb-2">{data?.title || title || "Untitled Article"}</h4>
      <p className="font-mono text-[10px] text-zinc-800 uppercase tracking-wider leading-relaxed mt-auto">
        {data?.dek || deck || "No description available."}
      </p>
    </div>
  </div>
);

export const SmallArticleTemplate: BlockTemplate = {
  id: 'SmallArticle',
  title: 'Column Article',
  description: 'Standard column-style article with an image and text. Increased height for better text flow.',
  config: { w: 4, h: 4, minW: 2, minH: 1 },
  component: SmallArticleBlock
};
