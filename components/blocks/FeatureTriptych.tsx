
import React from 'react';
import { BlockInstance, IssueContent, MagazineItem } from '../../types';
import { SmartImage } from '../ui/SmartImage';

export const FeatureTriptych: React.FC<{ config: BlockInstance, items?: MagazineItem[] }> = ({ config, items }) => {
  // We need exactly 3 items. Fill with placeholders if missing.
  const slots = [0, 1, 2].map(i => items?.[i]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full border-t border-black pt-8">
        {slots.map((item, idx) => (
            <div key={idx} className="group flex flex-col h-full relative">
                {/* Vertical Divider for 2nd and 3rd items */}
                {idx > 0 && (
                    <div className="hidden md:block absolute -left-4 top-0 bottom-0 w-px bg-neutral-200"></div>
                )}
                
                {item ? (
                    <>
                        <div className="aspect-[3/4] w-full bg-neutral-100 mb-6 overflow-hidden relative">
                             {item.hero_image_url && (
                                <SmartImage 
                                    src={item.hero_image_url} 
                                    alt={item.title} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                             )}
                             <span className="absolute top-2 left-2 text-[9px] font-bold bg-white px-2 py-1 uppercase tracking-widest">
                                 {item.tags[0] || 'Note'}
                             </span>
                        </div>
                        <h4 className="font-display text-2xl leading-[1.1] mb-2 uppercase tracking-tight group-hover:text-accent transition-colors">
                            {item.title}
                        </h4>
                        <p className="font-sans text-xs text-neutral-500 leading-relaxed line-clamp-4">
                            {item.dek}
                        </p>
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center border border-dashed border-neutral-200 bg-neutral-50 aspect-[3/4]">
                        <span className="text-[9px] font-mono text-neutral-300">OPEN SLOT</span>
                    </div>
                )}
            </div>
        ))}
    </div>
  );
};
