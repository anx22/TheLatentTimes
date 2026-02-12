
import React from 'react';
import { BlockInstance, MagazineItem } from '../../types';

interface MicroIndexProps {
    config: BlockInstance;
    items?: MagazineItem[];
}

export const MicroIndex: React.FC<MicroIndexProps> = ({ config, items }) => {
    // Fallback data if query returns empty
    const links = items && items.length > 0 ? items : [
        { title: "Archive 2024", tags: ["System"] },
        { title: "Contributor Guidelines", tags: ["Meta"] },
        { title: "Ethics Policy", tags: ["Meta"] },
        { title: "RSS Feed", tags: ["Tech"] }
    ];

    return (
        <div className="border-t border-black pt-8">
            <h5 className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] mb-6 text-neutral-400">
                Index & Utilities
            </h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-8">
                {links.map((link, idx) => (
                    <div key={idx} className="group cursor-pointer">
                        <div className="h-px w-4 bg-neutral-200 mb-2 group-hover:w-full group-hover:bg-accent transition-all duration-500"></div>
                        <h6 className="font-sans text-xs font-bold leading-snug group-hover:text-accent transition-colors">
                            {link.title}
                        </h6>
                        <span className="text-[9px] font-mono text-neutral-400 uppercase">
                            {link.tags?.[0] || 'Link'}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
