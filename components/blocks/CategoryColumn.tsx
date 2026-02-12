
import React from 'react';
import { BlockInstance, MagazineItem } from '../../types';

interface CategoryColumnProps {
    config: BlockInstance;
    items?: MagazineItem[]; // Expecting array binding
}

export const CategoryColumn: React.FC<CategoryColumnProps> = ({ config, items }) => {
    // Fallback title derived from query tags or static label
    const title = config.data_binding.static_content?.label 
        || config.data_binding.query_tags?.[0] 
        || "Index";

    const displayItems = items || [];

    return (
        <div className="flex flex-col h-full border-t border-black pt-4">
            {/* Column Header */}
            <div className="flex justify-between items-baseline mb-6 border-b border-neutral-200 pb-2">
                <h4 className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-accent">
                    {title}
                </h4>
                <span className="font-mono text-[9px] text-neutral-400">
                    {String(displayItems.length).padStart(2, '0')}
                </span>
            </div>

            {/* List Items */}
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

            {/* Footer / More Link */}
            <div className="mt-6 pt-4">
                <button className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 hover:text-black transition-colors flex items-center gap-2">
                    <span>View Archive</span>
                    <span>→</span>
                </button>
            </div>
        </div>
    );
};
