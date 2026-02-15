
import React from 'react';
import { BlockInstance, MagazineItem } from '../../types';

export const TeaserIndexRail: React.FC<{ config: BlockInstance, items?: MagazineItem[] }> = ({ config, items }) => {
    const displayItems = items || [];
    const title = config.data_binding.query_tags?.[0] || "Latest Prompts";
    const isRich = config.variant === 'L';

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="p-4 border-b border-black flex justify-between items-center">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-black">{title}</h4>
                {isRich && <span className="text-[9px] font-mono text-gray-400">{displayItems.length} ITEMS</span>}
            </div>
            
            {/* List */}
            <div className="flex-1 flex flex-col">
                {displayItems.map((item, idx) => (
                    <div key={idx} className="group cursor-pointer p-4 border-b border-gray-100 hover:bg-neutral-50 transition-colors flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                            <span className="text-[9px] font-mono text-gray-400">
                                {String(idx + 1).padStart(2, '0')}
                            </span>
                            {isRich && (
                                <span className="text-[9px] font-bold text-accent uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                                    {item.tags?.[0]}
                                </span>
                            )}
                        </div>
                        
                        <h5 className={`font-bold leading-tight text-black group-hover:underline decoration-1 underline-offset-4 ${isRich ? 'text-lg' : 'text-sm'}`}>
                            {item.title}
                        </h5>
                        
                        {isRich && item.dek && (
                            <p className="text-[10px] text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                                {item.dek}
                            </p>
                        )}
                    </div>
                ))}
            </div>

            {/* Footer Link */}
            <div className="p-4 mt-auto border-t border-black text-right">
                <button className="text-[10px] font-bold uppercase tracking-widest hover:mr-1 transition-all">
                    Prompt Index →
                </button>
            </div>
        </div>
    );
};
