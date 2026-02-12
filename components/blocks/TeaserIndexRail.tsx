
import React from 'react';
import { BlockInstance, MagazineItem } from '../../types';

interface TeaserIndexRailProps {
    config: BlockInstance;
    items?: MagazineItem[];
}

export const TeaserIndexRail: React.FC<TeaserIndexRailProps> = ({ config, items }) => {
    const teasers = items || [];

    return (
        <div className="flex flex-col h-full py-2 border-t border-black md:border-t-0 md:border-l md:pl-8">
            <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-neutral-400 mb-6 block">
                Latest Signals
            </span>
            
            <div className="flex flex-col gap-6 divide-y divide-neutral-100">
                {teasers.length === 0 ? (
                    <div className="text-xs text-neutral-300 font-mono">No active teasers</div>
                ) : (
                    teasers.map((item, idx) => (
                        <div key={idx} className="group cursor-pointer pt-4 first:pt-0">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[9px] font-bold uppercase tracking-wide text-accent">
                                    {new Date(item.published_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                                {item.featured_level === 'featured' && (
                                    <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
                                )}
                            </div>
                            <h5 className="font-sans text-sm font-bold leading-tight group-hover:underline decoration-1 underline-offset-4 mb-1">
                                {item.title}
                            </h5>
                            <span className="text-[10px] text-neutral-500 font-mono uppercase">
                                {item.tags[0] || 'General'}
                            </span>
                        </div>
                    ))
                )}
            </div>
            
            <div className="mt-auto pt-8">
                <button className="w-full py-3 border border-neutral-200 hover:border-black text-[10px] font-bold uppercase tracking-widest transition-colors">
                    Access Wire
                </button>
            </div>
        </div>
    );
};
