
import React from 'react';
import { BlockInstance, MagazineItem } from '../../types';

interface QuotePlateProps {
    config: BlockInstance;
    data?: MagazineItem; 
}

export const QuotePlate: React.FC<QuotePlateProps> = ({ config, data }) => {
    // 1. Resolve Content
    // Priority: Static content -> Pinned Item Title -> Fallback
    const staticText = config.data_binding.static_content?.text;
    const staticAuthor = config.data_binding.static_content?.author;
    
    const text = staticText || data?.dek || data?.title || "Silence is also a signal.";
    const author = staticAuthor || data?.author || "SYSTEM";

    const isLarge = config.variant === 'L';

    return (
        <div className={`
            flex flex-col justify-center h-full border-y border-black py-12 md:py-24
            ${isLarge ? 'px-8 md:px-16' : 'px-6'}
            group hover:bg-neutral-50 transition-colors duration-500
        `}>
            <div className="relative">
                {/* Decoration */}
                <span className="absolute -top-8 -left-4 text-6xl md:text-9xl font-display text-neutral-200 select-none z-0 group-hover:text-accent/20 transition-colors">
                    “
                </span>
                
                {/* The Quote */}
                <blockquote className={`
                    relative z-10 font-display font-medium text-center leading-[1.1] text-balance
                    ${isLarge ? 'text-4xl md:text-6xl' : 'text-3xl md:text-4xl'}
                `}>
                    {text}
                </blockquote>

                {/* Attribution */}
                <div className="mt-8 flex items-center justify-center gap-4">
                    <div className="h-px w-8 bg-accent"></div>
                    <cite className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] not-italic text-neutral-500">
                        {author}
                    </cite>
                    <div className="h-px w-8 bg-accent"></div>
                </div>
            </div>
        </div>
    );
};
