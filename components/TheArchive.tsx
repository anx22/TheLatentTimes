
import React, { useEffect, useState } from 'react';
import { getArchiveIndex } from '../services/storage';

interface ArchiveItem {
    id: string;
    vol: string;
    theme: string;
    date: string;
}

interface TheArchiveProps {
    onLoadIssue: (id: string) => void;
    onClose: () => void;
}

export const TheArchive: React.FC<TheArchiveProps> = ({ onLoadIssue, onClose }) => {
    const [items, setItems] = useState<ArchiveItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getArchiveIndex().then(data => {
            setItems(data);
            setLoading(false);
        });
    }, []);

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-8">
            <div className="bg-white max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl animate-reveal">
                <div className="p-8 border-b border-black flex justify-between items-center bg-neutral-50">
                    <div>
                        <h2 className="font-display text-4xl mb-2">The Archive</h2>
                        <p className="font-sans text-[10px] uppercase tracking-widest text-neutral-500 font-bold">
                            Published Volumes • Immutable History
                        </p>
                    </div>
                    <button onClick={onClose} className="text-2xl hover:text-accent">×</button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {loading ? (
                        <div className="text-center py-12 opacity-50">
                            <div className="w-8 h-8 border-2 border-neutral-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
                            <span className="text-[10px] uppercase tracking-widest">Loading Index...</span>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-12 opacity-50">
                            <span className="text-[10px] uppercase tracking-widest">No published volumes found.</span>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {items.map((item) => (
                                <button 
                                    key={item.id}
                                    onClick={() => { onLoadIssue(item.id); onClose(); }}
                                    className="text-left group border border-neutral-200 p-6 hover:border-black hover:bg-neutral-50 transition-all duration-300"
                                >
                                    <div className="flex justify-between items-baseline mb-2">
                                        <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-neutral-400 group-hover:text-accent transition-colors">
                                            {item.vol}
                                        </span>
                                        <span className="font-mono text-[10px] text-neutral-400">
                                            {new Date(item.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="font-display text-2xl group-hover:translate-x-2 transition-transform duration-300">
                                        {item.theme}
                                    </h3>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
