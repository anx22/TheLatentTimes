
import React from 'react';
import { BlockInstance, MagazineItem } from '../../types';

interface CategoryColumnProps {
    config: BlockInstance;
    items?: MagazineItem[]; 
}

export const CategoryColumn: React.FC<CategoryColumnProps> = ({ config, items }) => {
    const title = config.data_binding.static_content?.label 
        || config.data_binding.query_tags?.[0] 
        || "Index";

    const displayItems = items || [];

    // VARIANT S: Minimal List (Just Titles)
    if (config.variant === 'S') {
        return (
            <div className="border-t border-black pt-2">
                <h4 className="font-sans text-[10px] font-bold uppercase tracking-widest mb-4 text-neutral-400">{title}</h4>
                <ul className="space-y-2">
                    {displayItems.map((item, i) => (
                        <li key={i} className="text-xs font-medium hover:text-accent cursor-pointer truncate">
                            {item.title}
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    // VARIANT L: Detailed (With Thumbnails)
    if (config.variant === 'L') {
        return (
            <div className="flex flex-col h-full border-t border-black pt-4">
                <div className="flex justify-between items-baseline mb-6 border-b border-neutral-200 pb-2">
                    <h4 className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-accent">{title}</h4>
                </div>
                <div className="flex-1 flex flex-col gap-8">
                    {displayItems.map((item, idx) => (
                        <article key={idx} className="group cursor-pointer flex gap-4 items-start">
                            <div className="w-24 h-16 bg-neutral-100 shrink-0">
                                {item.hero_image_url && <img src={item.hero_image_url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />}
                            </div>
                            <div>
                                <h5 className="font-display text-xl leading-none mb-2 group-hover:underline decoration-1 underline-offset-4">
                                    {item.title}
                                </h5>
                                <p className="text-[10px] text-neutral-500 line-clamp-2">{item.dek}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        );
    }

    // VARIANT M: Standard (Numbered List)
    return (
        <div className="flex flex-col h-full border-t border-black pt-4">
            <div className="flex justify-between items-baseline mb-6 border-b border-neutral-200 pb-2">
                <h4 className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-accent">
                    {title}
                </h4>
                <span className="font-mono text-[9px] text-neutral-400">
                    {String(displayItems.length).padStart(2, '0')}
                </span>
            </div>

            <div className="flex-1 flex flex-col gap-6">
                {displayItems.length === 0 ? (
                    <div className="py-8 text-center border border-dashed border-neutral-200 bg-neutral-50">
                        <span className="text-[9px] font-mono text-neutral-400">NO SIGNAL</span>
                    </div>
                ) : (
                    displayItems.map((item, idx) => (
                        <article key={idx} className="group cursor-pointer">
                            <div className="flex items-baseline gap-2 mb-1">
                                <span className="text-[9px] font-mono text-neutral-300 group-hover:text-accent transition-colors">
                                    {String(idx + 1).padStart(2, '0')}
                                </span>
                                <h5 className="font-display text-lg leading-tight group-hover:underline decoration-1 underline-offset-4">
                                    {item.title}
                                </h5>
                            </div>
                            <p className="pl-6 text-[11px] text-neutral-500 leading-relaxed line-clamp-2">
                                {item.dek}
                            </p>
                        </article>
                    ))
                )}
            </div>
        </div>
    );
};
