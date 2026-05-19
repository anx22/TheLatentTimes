import React from 'react';
import { BlockTemplate } from '../types';
import { MagazineItem } from '../../../types';

const ImageBlock: React.FC<{ imageUrl?: string, caption?: string, data?: MagazineItem }> = ({ imageUrl, caption, data }) => (
  <div className="w-full h-full relative bg-[#e5e5e5]">
    <img src={data?.hero_image_url || imageUrl || "https://picsum.photos/seed/image/800/800"} alt="Editorial" className="w-full h-full object-cover grayscale contrast-125" />
    {(data?.dek || caption) && (
      <div className="absolute bottom-4 left-4 bg-black text-white p-4 max-w-[80%]">
        <div className="text-[10px] font-mono uppercase tracking-widest mb-2 text-zinc-300">Inside</div>
        <div className="font-serif text-sm">{data?.dek || caption}</div>
      </div>
    )}
  </div>
);

export const ImageTemplate: BlockTemplate = {
  id: 'Image',
  title: 'Image Block',
  description: 'Full-bleed image block with optional caption.',
  config: { w: 4, h: 4, minW: 2, minH: 1 },
  component: ImageBlock
};
