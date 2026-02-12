
import React from 'react';
import { BlockInstance, MagazineItem } from '../../types';
import { SmartImage } from '../ui/SmartImage';

interface FeatureCardProps {
    config: BlockInstance;
    data?: MagazineItem;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ config, data }) => {
    if (!data) {
        return (
            <div className="w-full h-64 border border-dashed border-neutral-200 flex items-center justify-center bg-neutral-50">
                <span className="text-[10px] font-mono text-neutral-400">EMPTY SLOT</span>
            </div>
        );
    }

    // VARIANT: "L" (Large Feature)
    // - Full image, overlay text or large type block
    if (config.variant === 'L') {
        return (
            <article className="group h-full flex flex-col border border-neutral-200 bg-white hover:border-black transition-colors duration-300">
                <div className="aspect-[16/9] w-full overflow-hidden bg-neutral-100 relative">
                    {data.hero_image_url ? (
                        <SmartImage 
                            src={data.hero_image_url} 
                            alt={data.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-neutral-100 text-neutral-300 font-display text-4xl italic">
                            No Signal
                        </div>
                    )}
                    <div className="absolute top-4 left-4">
                        <span className="bg-black text-white px-2 py-1 text-[9px] font-bold uppercase tracking-widest">
                            {data.tags[0] || 'Feature'}
                        </span>
                    </div>
                </div>
                <div className="p-6 md:p-8 flex-1 flex flex-col">
                    <div className="mb-4 text-[10px] font-mono text-neutral-400 uppercase tracking-wider flex justify-between">
                        <span>{new Date(data.published_at).toLocaleDateString()}</span>
                        <span>{data.author || 'System'}</span>
                    </div>
                    <h3 className="font-display text-3xl md:text-4xl leading-[0.95] mb-4 uppercase tracking-tight group-hover:text-accent transition-colors">
                        {data.title}
                    </h3>
                    <p className="font-sans text-sm text-neutral-600 leading-relaxed line-clamp-3 text-pretty">
                        {data.dek || data.raw_excerpt}
                    </p>
                </div>
            </article>
        );
    }

    // VARIANT: "S" (Compact / Text Only or Small Image)
    // - Good for sidebars or dense grids
    if (config.variant === 'S') {
        return (
            <article className="group border-b border-neutral-200 py-4 last:border-0 hover:bg-neutral-50 transition-colors">
                <div className="flex justify-between items-baseline mb-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-accent">
                        {data.tags[0] || 'Note'}
                    </span>
                </div>
                <h4 className="font-sans text-sm font-bold leading-tight mb-2 group-hover:underline decoration-1 underline-offset-4">
                    {data.title}
                </h4>
                <p className="font-sans text-xs text-neutral-500 leading-relaxed line-clamp-2">
                    {data.dek}
                </p>
            </article>
        );
    }

    // DEFAULT / VARIANT: "M" (Standard Card)
    return (
        <article className="group h-full border-r border-b border-neutral-200 bg-white p-6 hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all">
            <div className="mb-6 aspect-[4/3] bg-neutral-100 overflow-hidden relative">
                 {data.hero_image_url && (
                    <SmartImage 
                        src={data.hero_image_url} 
                        alt={data.title} 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                 )}
            </div>
            <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest mb-3 block">
                0{data.score?.final || 1} // {data.tags[0] || 'Update'}
            </span>
            <h3 className="font-display text-2xl leading-none mb-3 uppercase tracking-tight">
                {data.title}
            </h3>
            <p className="font-sans text-xs text-neutral-500 leading-relaxed line-clamp-3">
                {data.dek}
            </p>
        </article>
    );
};
