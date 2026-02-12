
import React, { useState } from 'react';
import { IssueContent, MagazineItem, BlockInstance, BlockType, PageTemplate } from '../../types';
import { LayoutEngine } from '../layout/LayoutEngine';
import { TEMPLATE_REGISTRY } from '../../services/templates';
import { ToneEQSlider } from './ui-primitives';

interface LayoutModeProps {
    issue: IssueContent;
    onUpdateIssue: (updated: IssueContent) => void;
    currentTemplate: string;
    onSwitchTemplate: (key: string) => void;
}

// --- ASSET CARD (Draggable/Clickable) ---
const LayoutAssetCard: React.FC<{ item: MagazineItem, onBind?: () => void }> = ({ item, onBind }) => (
    <div 
        onClick={onBind}
        className="p-3 bg-white border border-zinc-200 rounded mb-2 hover:border-black hover:shadow-md cursor-pointer transition-all group"
    >
        <div className="flex justify-between items-center mb-1">
            <span className="text-[9px] font-bold uppercase tracking-wide text-zinc-500 group-hover:text-black">
                {item.tags[0] || 'General'}
            </span>
            {item.featured_level === 'featured' && <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>}
        </div>
        <h5 className="font-sans text-xs font-semibold leading-tight line-clamp-2 mb-1 group-hover:text-indigo-900">{item.title}</h5>
        <div className="flex gap-2 text-[9px] text-zinc-400 font-mono">
            <span>Score: {item.score?.final || '-'}</span>
            <span>{item.media_type}</span>
        </div>
    </div>
);

// --- SLOT INSPECTOR ---
const SlotInspector: React.FC<{ 
    block: BlockInstance | undefined; 
    onUpdateBlock: (b: BlockInstance) => void;
}> = ({ block, onUpdateBlock }) => {
    if (!block) return (
        <div className="flex flex-col items-center justify-center h-full text-zinc-400 p-8 text-center">
            <span className="text-2xl mb-2 opacity-20">⬚</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Select a slot to configure</span>
        </div>
    );

    const bindingType = block.data_binding.source;

    return (
        <div className="p-6 h-full overflow-y-auto bg-zinc-50 border-l border-zinc-200">
            <div className="mb-6 pb-6 border-b border-zinc-200">
                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 block mb-2">Block Type</span>
                <h3 className="font-mono text-sm font-bold text-zinc-900 bg-white border border-zinc-200 p-2 rounded">
                    {block.block_type}
                </h3>
            </div>

            {/* Config: Variant & Size */}
            <div className="mb-8">
                <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-500 block mb-3">Geometry</span>
                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-semibold text-zinc-500 mb-1">Variant</label>
                        <div className="flex bg-white border border-zinc-200 rounded p-1">
                            {['S', 'M', 'L', 'XL'].map(v => (
                                <button 
                                    key={v}
                                    onClick={() => onUpdateBlock({ ...block, variant: v as any })}
                                    className={`flex-1 py-1 text-[10px] font-bold ${block.variant === v ? 'bg-black text-white rounded-sm' : 'text-zinc-400 hover:text-black'}`}
                                >
                                    {v}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold text-zinc-500 mb-1">Grid Span (1-12)</label>
                        <input 
                            type="range" min="3" max="12" step="1"
                            value={block.col_span}
                            onChange={(e) => onUpdateBlock({ ...block, col_span: parseInt(e.target.value) })}
                            className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-black"
                        />
                        <div className="text-right text-[9px] font-mono text-zinc-400 mt-1">{block.col_span} Columns</div>
                    </div>
                </div>
            </div>

            {/* Config: Data Binding */}
            <div className="mb-8">
                <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-500 block mb-3">Data Binding</span>
                
                {/* Mode Selector */}
                <div className="flex bg-white border border-zinc-200 rounded p-1 mb-4">
                    {['auto', 'query', 'pinned'].map(m => (
                        <button 
                            key={m}
                            onClick={() => onUpdateBlock({ 
                                ...block, 
                                data_binding: { ...block.data_binding, source: m as any } 
                            })}
                            className={`flex-1 py-1 text-[10px] font-bold uppercase ${bindingType === m ? 'bg-indigo-600 text-white rounded-sm' : 'text-zinc-400 hover:text-black'}`}
                        >
                            {m}
                        </button>
                    ))}
                </div>

                {/* Specific Controls */}
                {bindingType === 'pinned' && (
                    <div className="p-3 bg-white border border-zinc-200 rounded text-[10px]">
                        <span className="block text-zinc-400 mb-2">PINNED ITEM ID</span>
                        <div className="font-mono bg-zinc-50 p-2 rounded text-zinc-700 truncate">
                            {block.data_binding.pinned_item_id || 'None'}
                        </div>
                        <p className="mt-2 text-zinc-400 italic text-[9px]">
                            Select an asset from the left pool to pin it here.
                        </p>
                    </div>
                )}

                {bindingType === 'query' && (
                    <div className="space-y-3">
                        <div>
                            <label className="block text-[10px] font-semibold text-zinc-500 mb-1">Tags (Comma sep)</label>
                            <input 
                                value={block.data_binding.query_tags?.join(', ') || ''}
                                onChange={(e) => onUpdateBlock({ 
                                    ...block, 
                                    data_binding: { ...block.data_binding, query_tags: e.target.value.split(',').map(s => s.trim()) } 
                                })}
                                className="w-full bg-white border border-zinc-300 rounded px-2 py-1.5 text-xs"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-semibold text-zinc-500 mb-1">Limit</label>
                            <input 
                                type="number" min="1" max="10"
                                value={block.data_binding.query_limit || 1}
                                onChange={(e) => onUpdateBlock({ 
                                    ...block, 
                                    data_binding: { ...block.data_binding, query_limit: parseInt(e.target.value) } 
                                })}
                                className="w-full bg-white border border-zinc-300 rounded px-2 py-1.5 text-xs"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Config: Chaos */}
            <div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-500 block mb-3">Chaos Engine</span>
                <select 
                    value={block.chaos_type || 'none'}
                    onChange={(e) => onUpdateBlock({ ...block, chaos_type: e.target.value as any })}
                    className="w-full bg-white border border-zinc-300 rounded px-2 py-2 text-xs outline-none focus:border-black"
                >
                    <option value="none">Strict Alignment</option>
                    <option value="breakout_left">Breakout Left (-margin)</option>
                    <option value="breakout_right">Breakout Right (-margin)</option>
                    <option value="overlap_badge">Overlay Badge</option>
                    <option value="tilt_hover">Interaction Tilt</option>
                </select>
            </div>
        </div>
    );
};

export const LayoutMode: React.FC<LayoutModeProps> = ({ issue, onUpdateIssue, currentTemplate, onSwitchTemplate }) => {
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    
    // Resolve Active Template
    const activeTemplateKey = issue.meta.template_key || currentTemplate;
    const activeTemplate = TEMPLATE_REGISTRY[activeTemplateKey] || TEMPLATE_REGISTRY['T1_CoverRail'];

    // --- ACTIONS ---
    const handleBlockUpdate = (updatedBlock: BlockInstance) => {
        // Deep clone sections to find and replace the block
        const newSections = activeTemplate.sections.map(sec => ({
            ...sec,
            blocks: sec.blocks.map(b => b.id === updatedBlock.id ? updatedBlock : b)
        }));
        
        // Note: In a real app, we'd need to update the Template Registry or clone the template into the Issue object.
        // For now, we update the template definition itself in memory (simple mode).
        activeTemplate.sections = newSections;
        onUpdateIssue({ ...issue }); // Trigger re-render
    };

    const handleBindAsset = (item: MagazineItem) => {
        if (!selectedBlockId) return;
        
        // Find block
        let foundBlock: BlockInstance | undefined;
        for (const sec of activeTemplate.sections) {
            foundBlock = sec.blocks.find(b => b.id === selectedBlockId);
            if (foundBlock) break;
        }

        if (foundBlock) {
            handleBlockUpdate({
                ...foundBlock,
                data_binding: {
                    source: 'pinned',
                    pinned_item_id: item.id
                }
            });
        }
    };

    // Helper to normalize StoryArtifact to MagazineItem for the layout engine
    const storyToItem = (s: any): MagazineItem => ({
        id: s.id,
        title: s.headline,
        dek: s.deck,
        published_at: new Date().toISOString(),
        tags: [s.category || 'General'],
        media_type: 'image', 
        hero_image_url: s.img_base64,
        status: 'approved',
        featured_level: s.placement === 'COVER' ? 'hero' : 'featured',
        score: { final: 9, recency: 10, trust: 9, novelty: 9, visual_fit: 9 }
    });

    // Filter Assets for the Pool
    const assets: MagazineItem[] = [
        ...issue.features.map(storyToItem),
        ...issue.columns.map(storyToItem),
        ...(issue.items || []).filter(i => !issue.features.find(f => f.id === i.id))
    ];

    const selectedBlock = activeTemplate.sections
        .flatMap(s => s.blocks)
        .find(b => b.id === selectedBlockId);

    return (
        <div className="flex h-full bg-zinc-100 overflow-hidden">
            
            {/* 1. LEFT: ASSET POOL */}
            <div className="w-[280px] bg-white border-r border-zinc-200 flex flex-col shrink-0 z-20">
                <div className="p-4 border-b border-zinc-200 bg-zinc-50">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Asset Pool</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {assets.length === 0 && <div className="text-xs text-zinc-400 text-center italic mt-10">Pool Empty</div>}
                    {assets.map(item => (
                        <LayoutAssetCard 
                            key={item.id} 
                            item={item} 
                            onBind={() => handleBindAsset(item)}
                        />
                    ))}
                </div>
            </div>

            {/* 2. CENTER: LIVE CANVAS (The Stage) */}
            <div className="flex-1 flex flex-col relative overflow-hidden bg-zinc-200">
                
                {/* Top Toolbar */}
                <div className="h-12 bg-white border-b border-zinc-300 flex justify-between items-center px-6 shrink-0 shadow-sm z-10">
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Template</span>
                        <select 
                            value={activeTemplateKey}
                            onChange={(e) => onSwitchTemplate(e.target.value)}
                            className="bg-zinc-100 border border-zinc-200 rounded px-2 py-1 text-xs font-bold text-zinc-800 outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            {Object.values(TEMPLATE_REGISTRY).map(t => (
                                <option key={t.key} value={t.key}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Chaos</span>
                            <div className="w-24 bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-indigo-500 w-1/3 h-full"></div>
                            </div>
                        </div>
                        <button className="bg-black text-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded hover:bg-zinc-800 transition-colors">
                            Snapshot
                        </button>
                    </div>
                </div>

                {/* The Grid (Scaled down slightly to fit UI) */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 flex justify-center bg-[#E5E5E5]">
                    <div 
                        className="bg-white shadow-2xl min-h-[1200px] w-full max-w-[1200px] transform transition-transform origin-top"
                        style={{ transform: 'scale(0.95)' }}
                    >
                        <LayoutEngine 
                            sections={activeTemplate.sections} 
                            data={issue} 
                            onBlockClick={setSelectedBlockId}
                            selectedBlockId={selectedBlockId}
                        />
                    </div>
                </div>
            </div>

            {/* 3. RIGHT: INSPECTOR */}
            <div className="w-[300px] bg-white border-l border-zinc-200 flex flex-col shrink-0 z-20">
                <div className="p-4 border-b border-zinc-200 bg-zinc-50">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Slot Inspector</h3>
                </div>
                <div className="flex-1 overflow-hidden relative">
                    <SlotInspector block={selectedBlock} onUpdateBlock={handleBlockUpdate} />
                </div>
            </div>

        </div>
    );
};