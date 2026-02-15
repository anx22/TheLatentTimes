
import React from 'react';
import { BlockInstance, MagazineItem } from '../../types';

export const FeatureCard: React.FC<{ config: BlockInstance, data?: MagazineItem }> = ({ config, data }) => {
    if (!data) return <div className="p-8 flex items-center justify-center bg-gray-50 text-[10px] uppercase font-bold text-gray-400 min-h-[200px]">Empty Feature</div>;

    const category = data.tags?.[0] || "Opinion";
    const readTime = "4M READ"; 

    // VARIANT S: Text Only, Compact, High Density
    if (config.variant === 'S') {
        return (
            <article className="group h-full bg-white p-6 border-b border-r border-gray-100 hover:bg-neutral-50 transition-colors flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-accent">{category}</span>
                        <span className="text-[9px] font-mono text-gray-400">→</span>
                    </div>
                    <h3 className="font-sans font-bold text-lg leading-tight text-black mb-2 group-hover:underline decoration-1 underline-offset-2">
                        {data.title}
                    </h3>
                </div>
                <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                    <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">{data.dek || "No summary available."}</p>
                </div>
            </article>
        );
    }

    // VARIANT L: Split Layout (Image Left/Top, Text Right/Bottom depending on aspect) or Overlay if requested
    // Here we implement a "Landscape Split" style for L
    if (config.variant === 'L') {
        return (
            <article className="group h-full bg-white grid grid-cols-1 md:grid-cols-2">
                <div className="relative h-64 md:h-full bg-neutral-100 overflow-hidden border-r border-black">
                    {data.hero_image_url ? (
                        <img src={data.hero_image_url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-300 font-mono text-xs">NO IMG</div>
                    )}
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-6">
                        <span className="w-2 h-2 bg-black rounded-full"></span>
                        <span className="text-[10px] font-bold uppercase tracking-widest">{category}</span>
                    </div>
                    <h3 className="font-display text-4xl md:text-5xl leading-[0.9] tracking-tight text-black mb-6">
                        {data.title}
                    </h3>
                    <p className="font-sans text-sm md:text-base text-neutral-600 leading-relaxed line-clamp-4 max-w-md">
                        {data.dek}
                    </p>
                </div>
            </article>
        );
    }

    // VARIANT M: Standard Editorial Card (Image Top, Text Bottom)
    return (
        <article className="group h-full bg-white p-6 md:p-8 flex flex-col justify-between hover:bg-neutral-50 transition-colors">
            <div>
                <div className="flex items-center gap-2 mb-6 opacity-60">
                    <span className="text-[9px] font-bold uppercase tracking-widest">{category}</span>
                    <span className="text-[9px] text-gray-300">•</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest">{readTime}</span>
                </div>
                
                <h3 className="font-display font-medium text-3xl md:text-4xl leading-[1.05] tracking-tight text-black mb-4">
                    {data.title}
                </h3>
            </div>
            
            {data.hero_image_url && (
                <div className="mt-6 aspect-video bg-gray-100 overflow-hidden border border-black">
                    <img src={data.hero_image_url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                </div>
            )}
        </article>
    );
};
