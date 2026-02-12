
import React from 'react';
import { Lead, StoryArtifact } from '../../types';
import { AssetCard } from './AssetCard';

interface NewsroomBoardProps {
    inbox: Lead[];
    working: StoryArtifact[];
    basket: StoryArtifact[];
    onSelectLead: (lead: Lead) => void;
    onSelectStory: (story: StoryArtifact) => void;
    onShipBatch: () => void;
    activeItemId?: string;
}

const ColumnHeader: React.FC<{ title: string; count: number; color?: string; action?: React.ReactNode }> = ({ title, count, color = 'zinc-500', action }) => (
    <div className="flex justify-between items-center mb-4 px-1 h-8">
        <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold uppercase tracking-wide text-${color}`}>{title}</span>
            <span className="text-[10px] font-mono font-medium text-zinc-500 bg-white border border-zinc-200 px-1.5 py-0.5 rounded">{count}</span>
        </div>
        {action}
    </div>
);

export const NewsroomBoard: React.FC<NewsroomBoardProps> = ({ inbox, working, basket, onSelectLead, onSelectStory, onShipBatch, activeItemId }) => {
    return (
        <div className="w-full h-full bg-zinc-50/50 flex p-8 gap-6 overflow-x-auto">
            
            {/* COLUMN: WORKING (Active) */}
            <div className="flex-1 flex flex-col min-w-[340px] max-w-[420px]">
                <ColumnHeader title="Production" count={working.length} color="zinc-900" />
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3 pb-20">
                        {working.length === 0 && (
                        <div className="h-48 rounded-lg border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center text-zinc-400 bg-zinc-50">
                            <span className="text-xs font-medium">No active tasks</span>
                        </div>
                    )}
                    {working.map((story: StoryArtifact) => (
                        <AssetCard 
                            key={story.id} 
                            type="STORY" 
                            data={story} 
                            onClick={() => onSelectStory(story)}
                            isSelected={activeItemId === story.id}
                        />
                    ))}
                </div>
            </div>

            {/* COLUMN: BASKET (Ready) */}
            <div className="flex-1 flex flex-col min-w-[340px] max-w-[420px]">
                <ColumnHeader 
                    title="Ready to Ship" 
                    count={basket.length} 
                    color="emerald-600" 
                />
                
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3 pb-20">
                        {basket.length === 0 && (
                        <div className="h-48 rounded-lg border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center text-zinc-400 bg-zinc-50">
                            <span className="text-xs font-medium">Basket empty</span>
                        </div>
                    )}
                    {basket.map((story: StoryArtifact) => (
                        <AssetCard 
                            key={story.id} 
                            type="STORY" 
                            data={story} 
                            onClick={() => onSelectStory(story)}
                            isSelected={activeItemId === story.id}
                        />
                    ))}
                </div>

                {/* BATCH ACTION FLOATING */}
                {basket.length > 0 && (
                    <div className="absolute bottom-8 right-8 z-20">
                        <button 
                            onClick={onShipBatch}
                            className="bg-zinc-900 hover:bg-black text-white px-6 py-3 rounded-full font-bold text-xs shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                        >
                            <span>Publish Batch ({basket.length})</span>
                            <span>→</span>
                        </button>
                    </div>
                )}
            </div>

        </div>
    );
};
