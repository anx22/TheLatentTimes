
import React, { useState, useEffect } from 'react';
import { IssueContent, MagazineItem, BlockInstance, Section, BlockType } from '../../types';
import { LayoutEngine } from '../layout/LayoutEngine';
import { TEMPLATE_REGISTRY } from '../../services/templates';
import { agentLayoutOptimizer } from '../../services/agents/layout-optimizer';
import { SmartImage } from '../ui/SmartImage';

interface LayoutModeProps {
    issue: IssueContent;
    onUpdateIssue: (updated: IssueContent) => void;
    currentTemplate: string;
    onSwitchTemplate: (key: string) => void;
}

// --- MODULE DEFINITIONS & CONFIG ---
// Defines what variants are available for each block type and what they mean to the user.
const BLOCK_CONFIGS: Record<BlockType, { variants: { value: string, label: string }[] }> = {
    'HeroTypePlate': { 
        variants: [
            { value: 'S', label: 'Section Header' }, 
            { value: 'M', label: 'Editorial Left' }, 
            { value: 'L', label: 'Massive Center' }
        ] 
    },
    'MastheadLane': { 
        variants: [
            { value: 'S', label: 'Minimal (Bar)' }, 
            { value: 'M', label: 'Standard (Full)' }
        ] 
    },
    'TopicTicker': { 
        variants: [
            { value: 'S', label: 'Light Mode' }, 
            { value: 'M', label: 'Dark Mode' }
        ] 
    },
    'FeatureCard': { 
        variants: [
            { value: 'S', label: 'Compact' }, 
            { value: 'M', label: 'Standard' }, 
            { value: 'L', label: 'Split/Landscape' }
        ] 
    },
    'FeatureTriptych': { 
        variants: [
            { value: 'L', label: 'Portrait (3:4)' }, 
            { value: 'M', label: 'Square (1:1)' }
        ] 
    },
    'StatsStrip': { 
        variants: [
            { value: 'S', label: 'Light Mode' }, 
            { value: 'M', label: 'Dark Mode' }
        ] 
    },
    'BlackManifestoPanel': { 
        variants: [
            { value: 'M', label: 'Standard' }, 
            { value: 'L', label: 'Split' }, 
            { value: 'XL', label: 'Full Hero' }
        ] 
    },
    'QuotePlate': { 
        variants: [
            { value: 'M', label: 'Standard' }, 
            { value: 'L', label: 'Large' }
        ] 
    },
    'CategoryColumn': { 
        variants: [
            { value: 'S', label: 'Simple List' }, 
            { value: 'M', label: 'Numbered' }, 
            { value: 'L', label: 'Detailed' }
        ] 
    },
    'TeaserIndexRail': { 
        variants: [
            { value: 'M', label: 'Standard' }, 
            { value: 'L', label: 'Rich' }
        ] 
    },
    'KitFeatureCTA': { 
        variants: [
            { value: 'S', label: 'Bar' }, 
            { value: 'M', label: 'Card' }, 
            { value: 'L', label: 'Expanded' }
        ] 
    },
    'MicroIndex': { 
        variants: [
            { value: 'S', label: 'Grid' }, 
            { value: 'M', label: 'Detailed List' }
        ] 
    },
};

const AVAILABLE_BLOCKS: Array<{ type: BlockType; label: string; icon: string }> = [
    { type: 'HeroTypePlate', label: 'Typography Hero', icon: 'AH' },
    { type: 'TopicTicker', label: 'News Ticker', icon: '•••' },
    { type: 'FeatureCard', label: 'Feature Card', icon: 'FC' },
    { type: 'FeatureTriptych', label: 'Triple Feature', icon: '3F' },
    { type: 'QuotePlate', label: 'Pull Quote', icon: '❞' },
    { type: 'TeaserIndexRail', label: 'Index Rail', icon: '☰' },
    { type: 'CategoryColumn', label: 'Category List', icon: '||' },
    { type: 'BlackManifestoPanel', label: 'Manifesto (Dark)', icon: 'M' },
    { type: 'StatsStrip', label: 'Data Strip', icon: '123' },
    { type: 'MastheadLane', label: 'Masthead', icon: 'MOD' },
    { type: 'KitFeatureCTA', label: 'Download CTA', icon: '⬇' },
    { type: 'MicroIndex', label: 'Footer Links', icon: '...' },
];

// Default Dimensions (Grid 12)
const BLOCK_DEFAULTS: Record<string, { w: number, h: number }> = {
    'HeroTypePlate': { w: 12, h: 6 },
    'MastheadLane': { w: 12, h: 2 },
    'TopicTicker': { w: 12, h: 1 },
    'FeatureCard': { w: 4, h: 4 },
    'FeatureTriptych': { w: 12, h: 5 },
    'QuotePlate': { w: 6, h: 3 },
    'TeaserIndexRail': { w: 3, h: 6 },
    'CategoryColumn': { w: 3, h: 5 },
    'BlackManifestoPanel': { w: 6, h: 4 },
    'StatsStrip': { w: 12, h: 1 },
    'KitFeatureCTA': { w: 4, h: 3 },
    'MicroIndex': { w: 12, h: 2 },
};

// --- WIREFRAMES (Mini CSS representations of blocks) ---
const BlockWireframe: React.FC<{ type: BlockType }> = ({ type }) => {
    switch (type) {
        case 'HeroTypePlate':
            return (
                <div className="w-full h-full p-2 flex flex-col justify-end gap-1.5 opacity-80">
                    <div className="w-1/3 h-0.5 bg-zinc-400 mb-1"></div>
                    <div className="w-full h-3 bg-zinc-800"></div>
                    <div className="w-2/3 h-1 bg-zinc-500"></div>
                </div>
            );
        case 'FeatureCard':
            return (
                <div className="w-full h-full p-2 flex flex-col opacity-80">
                    <div className="w-full flex-1 bg-zinc-200 mb-1.5 border border-zinc-300"></div>
                    <div className="w-3/4 h-1.5 bg-zinc-800 mb-1"></div>
                    <div className="w-1/2 h-1 bg-zinc-400"></div>
                </div>
            );
        case 'FeatureTriptych':
            return (
                <div className="w-full h-full p-2 grid grid-cols-3 gap-1 opacity-80">
                    <div className="bg-zinc-200 h-full border border-zinc-300"></div>
                    <div className="bg-zinc-200 h-full border border-zinc-300"></div>
                    <div className="bg-zinc-200 h-full border border-zinc-300"></div>
                </div>
            );
        case 'TeaserIndexRail':
            return (
                <div className="w-full h-full p-2 flex flex-col gap-1.5 opacity-80">
                    {[1,2,3].map(i => (
                        <div key={i} className="flex gap-1 items-center border-b border-zinc-100 pb-0.5">
                            <div className="w-2 h-2 bg-zinc-200 shrink-0 rounded-full"></div>
                            <div className="flex-1 h-0.5 bg-zinc-400"></div>
                        </div>
                    ))}
                </div>
            );
        case 'QuotePlate':
            return (
                <div className="w-full h-full p-2 flex flex-col items-center justify-center relative opacity-80">
                    <span className="text-zinc-300 text-3xl font-serif absolute top-0 left-1 leading-none">“</span>
                    <div className="w-3/4 h-0.5 bg-zinc-800 mb-1"></div>
                    <div className="w-1/2 h-0.5 bg-zinc-800"></div>
                </div>
            );
        case 'BlackManifestoPanel':
            return (
                <div className="w-full h-full bg-zinc-800 p-2 flex flex-col justify-between">
                    <div className="w-1/4 h-0.5 bg-zinc-500"></div>
                    <div className="w-3/4 h-2 bg-white"></div>
                </div>
            );
        case 'CategoryColumn':
            return (
                <div className="w-full h-full p-2 border-t-2 border-zinc-800 opacity-80">
                    <div className="w-1/3 h-1 bg-zinc-800 mb-2"></div>
                    <div className="space-y-1">
                        <div className="w-full h-0.5 bg-zinc-300"></div>
                        <div className="w-full h-0.5 bg-zinc-300"></div>
                        <div className="w-full h-0.5 bg-zinc-300"></div>
                    </div>
                </div>
            );
        case 'MastheadLane':
            return (
                <div className="w-full h-full p-2 flex items-center justify-between border-b border-zinc-800">
                    <div className="w-1/2 h-2 bg-zinc-900"></div>
                    <div className="w-1/4 h-1 bg-zinc-400"></div>
                </div>
            );
        case 'StatsStrip':
            return (
                <div className="w-full h-full p-2 flex items-center justify-between bg-zinc-100 border-y border-zinc-300">
                    <div className="w-4 h-2 bg-zinc-400 rounded"></div>
                    <div className="w-4 h-2 bg-zinc-400 rounded"></div>
                    <div className="w-4 h-2 bg-zinc-400 rounded"></div>
                </div>
            );
        case 'KitFeatureCTA':
            return (
                <div className="w-full h-full bg-zinc-900 p-2 flex flex-col justify-center">
                    <div className="w-1/3 h-0.5 bg-white/50 mb-1"></div>
                    <div className="w-2/3 h-2 bg-white mb-2"></div>
                    <div className="w-1/2 h-1 bg-zinc-500"></div>
                </div>
            );
        case 'MicroIndex':
            return (
                <div className="w-full h-full p-2 grid grid-cols-2 gap-1 border-t border-zinc-300">
                    <div className="h-0.5 bg-zinc-300 w-full"></div>
                    <div className="h-0.5 bg-zinc-300 w-full"></div>
                    <div className="h-0.5 bg-zinc-300 w-full"></div>
                    <div className="h-0.5 bg-zinc-300 w-full"></div>
                </div>
            );
        case 'TopicTicker':
            return (
                <div className="w-full h-full bg-zinc-50 border-y border-zinc-200 flex items-center gap-1 px-1 overflow-hidden">
                    <div className="w-2 h-2 rounded-full bg-red-500 shrink-0"></div>
                    <div className="w-full h-1 bg-zinc-300"></div>
                </div>
            );
        default:
            return (
                <div className="w-full h-full p-2 flex items-center justify-center bg-zinc-50 border border-zinc-100">
                    <span className="text-[7px] font-mono uppercase text-zinc-400 tracking-widest">{(type as string).replace(/([A-Z])/g, ' $1').trim()}</span>
                </div>
            );
    }
};

// --- DRAGGABLE CARDS ---

const LayoutAssetCard: React.FC<{ item: MagazineItem, isPlaced: boolean, onBind?: () => void }> = ({ item, isPlaced, onBind }) => {
    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('text/plain', item.id);
        e.dataTransfer.effectAllowed = 'copy';
    };

    return (
        <div 
            draggable
            onDragStart={handleDragStart}
            onClick={onBind}
            className={`
                group relative border rounded mb-2 overflow-hidden cursor-grab active:cursor-grabbing transition-all
                ${isPlaced 
                    ? 'border-zinc-100 opacity-50 grayscale' 
                    : 'border-zinc-200 hover:border-black hover:shadow-md bg-white'
                }
            `}
        >
            <div className="flex">
                {item.media_type === 'image' && item.hero_image_url && (
                    <div className="w-16 h-16 shrink-0 bg-zinc-100">
                        <img src={item.hero_image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                )}
                <div className="p-2 flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] font-bold uppercase tracking-wide text-zinc-500 truncate max-w-[80px]">
                            {item.tags?.[0] || 'Gen'}
                        </span>
                        {isPlaced && <span className="text-[8px] font-bold uppercase bg-zinc-100 text-zinc-400 px-1 rounded">Placed</span>}
                    </div>
                    <h5 className="font-sans text-[10px] font-bold leading-tight line-clamp-2 text-zinc-800 mb-1">{item.title}</h5>
                    {!item.hero_image_url && <p className="text-[9px] text-zinc-400 line-clamp-1">{item.dek}</p>}
                </div>
            </div>
        </div>
    );
};

const LayoutBlockCard: React.FC<{ type: BlockType; label: string; icon: string }> = ({ type, label, icon }) => {
    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('application/x-modus-block', type);
        e.dataTransfer.effectAllowed = 'copy';
    };

    return (
        <div 
            draggable
            onDragStart={handleDragStart}
            className="group flex flex-col bg-white border border-zinc-200 rounded mb-3 cursor-grab active:cursor-grabbing hover:border-indigo-500 hover:shadow-md transition-all overflow-hidden"
        >
            {/* Visual Preview */}
            <div className="h-20 bg-zinc-50 border-b border-zinc-100 relative group-hover:bg-white transition-colors">
                <div className="absolute inset-0 transition-opacity">
                    <BlockWireframe type={type} />
                </div>
            </div>
            
            {/* Footer */}
            <div className="p-2 flex items-center gap-2 bg-white">
                <div className="w-5 h-5 bg-zinc-100 rounded flex items-center justify-center text-[8px] font-bold text-zinc-500">
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <span className="block text-[9px] font-bold uppercase text-zinc-700 truncate">{label}</span>
                </div>
            </div>
        </div>
    );
};

// --- SLOT INSPECTOR ---
const SlotInspector: React.FC<{ 
    block: BlockInstance | undefined; 
    onUpdateBlock: (b: BlockInstance) => void;
    onDeleteBlock: () => void;
    availableTags: string[];
}> = ({ block, onUpdateBlock, onDeleteBlock, availableTags }) => {
    if (!block) return (
        <div className="flex flex-col items-center justify-center h-full text-zinc-400 p-8 text-center bg-zinc-50">
            <span className="text-4xl mb-4 opacity-20">⬚</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Select a grid slot</span>
        </div>
    );

    const bindingType = block.data_binding.source;
    
    // Determine available variants for this block type
    const variants = BLOCK_CONFIGS[block.block_type]?.variants || [{ value: 'M', label: 'Standard' }];

    const toggleTag = (tag: string) => {
        const currentTags = block.data_binding.query_tags || [];
        const newTags = currentTags.includes(tag) 
            ? currentTags.filter(t => t !== tag)
            : [...currentTags, tag];
        
        onUpdateBlock({
            ...block,
            data_binding: { ...block.data_binding, query_tags: newTags }
        });
    };

    return (
        <div className="flex flex-col h-full bg-white border-l border-zinc-200">
            <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex justify-between items-center">
                <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 block">Active Slot</span>
                    <h3 className="font-mono text-xs font-bold text-zinc-900 mt-1">
                        {block.block_type}
                    </h3>
                </div>
                <button 
                    onClick={() => onUpdateBlock({ ...block, locked: !block.locked })}
                    className={`w-8 h-8 rounded flex items-center justify-center transition-all border ${block.locked ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-zinc-200 text-zinc-300 hover:border-zinc-400'}`}
                >
                    {block.locked ? '🔒' : '🔓'}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Visual Settings */}
                <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-500 block mb-3">Styling</span>
                    
                    <div className="mb-4">
                        <label className="block text-[10px] font-semibold text-zinc-500 mb-2">Variant Mode</label>
                        <div className="flex flex-col gap-1.5">
                            {variants.map(v => (
                                <button 
                                    key={v.value}
                                    onClick={() => onUpdateBlock({ ...block, variant: v.value as any })}
                                    className={`
                                        flex items-center justify-between px-3 py-2 text-[10px] font-bold uppercase border rounded-sm transition-all
                                        ${block.variant === v.value 
                                            ? 'bg-zinc-900 text-white border-black shadow-sm' 
                                            : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300 hover:text-zinc-900'}
                                    `}
                                >
                                    <span>{v.label}</span>
                                    {block.variant === v.value && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-semibold text-zinc-500 mb-1">Chaos</label>
                        <select 
                            value={block.chaos_type || 'none'}
                            onChange={(e) => onUpdateBlock({ ...block, chaos_type: e.target.value as any })}
                            className="w-full bg-white border border-zinc-200 rounded px-2 py-1.5 text-xs outline-none focus:border-black"
                        >
                            <option value="none">None</option>
                            <option value="breakout_left">Breakout Left</option>
                            <option value="breakout_right">Breakout Right</option>
                            <option value="overlap_badge">Overlay</option>
                            <option value="tilt_hover">Tilt</option>
                        </select>
                    </div>
                </div>

                {/* DATA BINDING */}
                <div className="border-t border-zinc-100 pt-6">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-500 block mb-3">Binding</span>
                    <div className="flex bg-zinc-100 p-1 rounded mb-4">
                        {['static', 'query', 'pinned'].map(m => (
                            <button 
                                key={m}
                                onClick={() => onUpdateBlock({ ...block, data_binding: { ...block.data_binding, source: m as any } })}
                                className={`flex-1 py-1 text-[10px] font-bold uppercase rounded-sm transition-all ${bindingType === m ? 'bg-white shadow-sm text-black' : 'text-zinc-400'}`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                    {bindingType === 'pinned' && (
                        <div className="p-3 bg-zinc-50 border border-zinc-200 rounded">
                            {block.data_binding.pinned_item_id ? (
                                <div className="space-y-2">
                                    <span className="block text-[9px] font-bold text-zinc-400">ID: {block.data_binding.pinned_item_id}</span>
                                    <button onClick={() => onUpdateBlock({ ...block, data_binding: { source: 'query', pinned_item_id: undefined } })} className="w-full py-1 bg-white border border-red-200 text-red-600 text-[9px] font-bold uppercase rounded">Eject</button>
                                </div>
                            ) : (
                                <div className="text-center text-[9px] text-zinc-400 font-bold uppercase">Drag content here</div>
                            )}
                        </div>
                    )}
                    {bindingType === 'query' && (
                        <div>
                            <label className="block text-[10px] font-semibold text-zinc-500 mb-2">Topic Filter</label>
                            <div className="flex flex-wrap gap-1.5">
                                {availableTags.map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => toggleTag(tag)}
                                        className={`px-2 py-1 rounded text-[9px] font-bold uppercase border transition-all ${block.data_binding.query_tags?.includes(tag) ? 'bg-black text-white border-black' : 'bg-white text-zinc-500 border-zinc-200'}`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-zinc-200">
                    <button
                        onClick={onDeleteBlock}
                        className="w-full py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-[10px] font-bold uppercase rounded shadow-sm transition-colors"
                    >
                        Remove Slot
                    </button>
                </div>
            </div>
        </div>
    );
};

export const LayoutMode: React.FC<LayoutModeProps> = ({ issue, onUpdateIssue, currentTemplate, onSwitchTemplate }) => {
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [previewSections, setPreviewSections] = useState<Section[] | null>(null);
    const [showGrid, setShowGrid] = useState(true); 
    const [poolTab, setPoolTab] = useState<'ASSETS' | 'BLOCKS'>('ASSETS');
    const [assetFilter, setAssetFilter] = useState<'ALL' | 'STORIES' | 'VISUALS'>('ALL');
    
    // METAMORPHOSIS STATE
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [variants, setVariants] = useState<any[]>([]);

    const activeTemplateKey = issue.meta.template_key || currentTemplate;
    const activeSections = issue.sections && issue.sections.length > 0 
        ? issue.sections 
        : (TEMPLATE_REGISTRY[activeTemplateKey] || TEMPLATE_REGISTRY['T1_CoverRail']).sections;

    const effectiveSections = previewSections || activeSections;

    // --- HANDLERS ---
    const handleBlockUpdate = (updatedBlock: BlockInstance) => {
        if (previewSections) return; 
        const newSections = activeSections.map(sec => ({
            ...sec,
            blocks: sec.blocks.map(b => b.id === updatedBlock.id ? updatedBlock : b)
        }));
        onUpdateIssue({ ...issue, sections: newSections });
    };

    const handleBlockDelete = (blockId: string) => {
        if (previewSections) return;
        const newSections = activeSections.map(sec => ({
            ...sec,
            blocks: sec.blocks.filter(b => b.id !== blockId)
        }));
        onUpdateIssue({ ...issue, sections: newSections });
        setSelectedBlockId(null);
    };

    const handleBlockResize = (blockId: string, deltaCol: number, deltaRow: number) => {
        if (previewSections) return;
        const newSections = activeSections.map(sec => ({
            ...sec,
            blocks: sec.blocks.map(b => {
                if (b.id === blockId) {
                    const newCol = Math.min(12, Math.max(1, b.col_span + deltaCol));
                    // Allow shrinking to 1 row, max 20 rows
                    const newRow = Math.min(20, Math.max(1, (b.row_span || 4) + deltaRow));
                    return { ...b, col_span: newCol, row_span: newRow };
                }
                return b;
            })
        }));
        onUpdateIssue({ ...issue, sections: newSections });
    };

    const handleContentDrop = (blockId: string, itemId: string) => {
        if (previewSections) return;
        let foundBlock: BlockInstance | undefined;
        let foundSectionIndex = -1;

        activeSections.forEach((sec, idx) => {
            const b = sec.blocks.find(bk => bk.id === blockId);
            if (b) { foundBlock = b; foundSectionIndex = idx; }
        });

        if (foundBlock && foundSectionIndex !== -1 && !foundBlock.locked) {
            const updatedBlock: BlockInstance = {
                ...foundBlock,
                data_binding: { source: 'pinned', pinned_item_id: itemId }
            };
            const newSections = activeSections.map((sec, idx) => {
                if (idx !== foundSectionIndex) return sec;
                return { ...sec, blocks: sec.blocks.map(b => b.id === blockId ? updatedBlock : b) };
            });
            onUpdateIssue({ ...issue, sections: newSections });
            setSelectedBlockId(blockId);
        }
    };

    const handleBlockTypeDrop = (blockId: string, type: string) => {
        if (previewSections) return;
        const newSections = activeSections.map(sec => ({
            ...sec,
            blocks: sec.blocks.map(b => {
                if (b.id === blockId && !b.locked) {
                    return { ...b, block_type: type as BlockType }; 
                }
                return b;
            })
        }));
        onUpdateIssue({ ...issue, sections: newSections });
        setSelectedBlockId(blockId);
    };

    const handleBlockSwap = (sourceId: string, targetId: string) => {
        if (previewSections) return;
        const newSections = JSON.parse(JSON.stringify(activeSections));
        
        let sourceSec: Section | undefined, targetSec: Section | undefined;
        let sourceB: BlockInstance | undefined, targetB: BlockInstance | undefined;
        let sIdx = -1, tIdx = -1;

        newSections.forEach((sec: Section) => {
            const s = sec.blocks.findIndex((b: BlockInstance) => b.id === sourceId);
            const t = sec.blocks.findIndex((b: BlockInstance) => b.id === targetId);
            if (s !== -1) { sourceSec = sec; sourceB = sec.blocks[s]; sIdx = s; }
            if (t !== -1) { targetSec = sec; targetB = sec.blocks[t]; tIdx = t; }
        });

        if (sourceSec && targetSec && sourceB && targetB) {
            sourceSec.blocks[sIdx] = targetB;
            targetSec.blocks[tIdx] = sourceB;
            onUpdateIssue({ ...issue, sections: newSections });
            setSelectedBlockId(targetId);
        }
    };

    const handleBlockCreate = (sectionId: string, type: 'BLOCK' | 'CONTENT', payload: string) => {
        if (previewSections) return;
        const secIndex = activeSections.findIndex(s => s.id === sectionId);
        if (secIndex === -1) return;

        const section = activeSections[secIndex];
        const blockType = type === 'BLOCK' ? (payload as BlockType) : 'FeatureCard';
        
        // Use smart defaults
        const defaults = BLOCK_DEFAULTS[blockType] || { w: 4, h: 4 };

        const newBlock: BlockInstance = {
            id: `blk_${Date.now()}`,
            block_type: blockType,
            col_span: defaults.w, 
            row_span: defaults.h, 
            variant: 'M',
            data_binding: type === 'CONTENT' ? { source: 'pinned', pinned_item_id: payload } : { source: 'query' }
        };

        const newSections = [...activeSections];
        newSections[secIndex] = { ...section, blocks: [...section.blocks, newBlock] };
        onUpdateIssue({ ...issue, sections: newSections });
        setSelectedBlockId(newBlock.id);
    };

    const handleSectionMove = (sectionId: string, dir: 'up' | 'down') => {
        const idx = activeSections.findIndex(s => s.id === sectionId);
        if (idx === -1) return;
        if (dir === 'up' && idx === 0) return;
        if (dir === 'down' && idx === activeSections.length - 1) return;

        const newSections = [...activeSections];
        const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
        [newSections[idx], newSections[swapIdx]] = [newSections[swapIdx], newSections[idx]];
        onUpdateIssue({ ...issue, sections: newSections });
    };

    const handleSectionDelete = (sectionId: string) => {
        const newSections = activeSections.filter(s => s.id !== sectionId);
        onUpdateIssue({ ...issue, sections: newSections });
    };

    const handleAddSection = (index: number) => {
        const newSection: Section = {
            id: `sec_${Date.now()}`,
            order: index,
            layout_mode: 'grid_12_dense', // FORCE BENTO
            blocks: [
                { id: `b_${Date.now()}_1`, block_type: 'FeatureCard', col_span: 6, row_span: 4, variant: 'M', data_binding: { source: 'query' } },
                { id: `b_${Date.now()}_2`, block_type: 'FeatureCard', col_span: 6, row_span: 4, variant: 'M', data_binding: { source: 'query' } }
            ]
        };
        const newSections = [...activeSections];
        newSections.splice(index, 0, newSection);
        onUpdateIssue({ ...issue, sections: newSections });
    };

    const handleRemix = async () => {
        setIsOptimizing(true);
        setVariants([]);
        try {
            const results = await agentLayoutOptimizer(activeSections);
            setVariants(results);
        } catch (e) {
            console.error("Optimization failed", e);
        } finally {
            setIsOptimizing(false);
        }
    };

    // Helper to normalize items
    const storyToItem = (s: any): MagazineItem => ({
        id: s.id,
        title: s.headline,
        dek: s.deck,
        published_at: new Date().toISOString(),
        tags: [s.category || 'General', s.topic].filter(Boolean),
        media_type: s.img_base64 ? 'image' : 'text', 
        hero_image_url: s.img_base64,
        status: s.status,
        featured_level: s.placement === 'COVER' ? 'hero' : 'featured'
    });

    const assets: MagazineItem[] = [
        ...(issue.items || []), 
        ...issue.features.map(storyToItem),
        ...issue.columns.map(storyToItem),
        ...issue.drops.map((d: any) => ({ ...storyToItem(d), title: d.headline, dek: d.body?.slice(0, 100), media_type: 'text' as const }))
    ];

    const filteredAssets = assets.filter(a => {
        if (assetFilter === 'STORIES') return !a.media_type || a.media_type === 'text';
        if (assetFilter === 'VISUALS') return a.media_type === 'image';
        return true;
    });

    const placedAssetIds = new Set<string>();
    effectiveSections.forEach(sec => {
        sec.blocks.forEach(b => {
            if (b.data_binding.source === 'pinned' && b.data_binding.pinned_item_id) {
                placedAssetIds.add(b.data_binding.pinned_item_id);
            }
        });
    });

    const selectedBlock = effectiveSections.flatMap(s => s.blocks).find(b => b.id === selectedBlockId);

    return (
        <div className="flex h-full bg-zinc-100 overflow-hidden">
            
            {/* 1. LEFT: PALETTE */}
            <div className="w-[280px] bg-white border-r border-zinc-200 flex flex-col shrink-0 z-20">
                <div className="p-4 border-b border-zinc-200 bg-zinc-50">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-3">Palette</h3>
                    <div className="flex bg-zinc-200 p-0.5 rounded mb-4">
                        <button onClick={() => setPoolTab('ASSETS')} className={`flex-1 text-[9px] font-bold uppercase py-1.5 rounded-sm transition-colors ${poolTab === 'ASSETS' ? 'bg-white text-black shadow-sm' : 'text-zinc-500'}`}>Assets</button>
                        <button onClick={() => setPoolTab('BLOCKS')} className={`flex-1 text-[9px] font-bold uppercase py-1.5 rounded-sm transition-colors ${poolTab === 'BLOCKS' ? 'bg-white text-black shadow-sm' : 'text-zinc-500'}`}>Modules</button>
                    </div>
                    {poolTab === 'ASSETS' && (
                        <div className="flex gap-2">
                            {['ALL', 'STORIES', 'VISUALS'].map(f => (
                                <button key={f} onClick={() => setAssetFilter(f as any)} className={`px-2 py-1 text-[8px] font-bold uppercase rounded border ${assetFilter === f ? 'bg-zinc-800 text-white border-zinc-800' : 'bg-white text-zinc-500 border-zinc-200'}`}>{f}</button>
                            ))}
                        </div>
                    )}
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-zinc-50/30">
                    {poolTab === 'ASSETS' ? (
                        filteredAssets.map(item => (
                            <LayoutAssetCard key={item.id} item={item} isPlaced={placedAssetIds.has(item.id)} onBind={() => selectedBlockId && handleContentDrop(selectedBlockId, item.id)} />
                        ))
                    ) : (
                        <div className="space-y-2">
                            {AVAILABLE_BLOCKS.map(blk => <LayoutBlockCard key={blk.type} type={blk.type} label={blk.label} icon={blk.icon} />)}
                        </div>
                    )}
                </div>
            </div>

            {/* 2. CENTER: CANVAS */}
            <div className="flex-1 flex flex-col relative overflow-hidden bg-zinc-200">
                <div className="h-14 bg-white border-b border-zinc-300 flex justify-between items-center px-6 shrink-0 shadow-sm z-10">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <span className="block text-[8px] font-bold uppercase tracking-widest text-zinc-400">Template</span>
                            <select 
                                value={activeTemplateKey}
                                onChange={(e) => {
                                    const newKey = e.target.value;
                                    onSwitchTemplate(newKey);
                                    const defaults = TEMPLATE_REGISTRY[newKey].sections;
                                    onUpdateIssue({ ...issue, meta: { ...issue.meta, template_key: newKey }, sections: defaults });
                                }}
                                className="bg-zinc-50 border border-zinc-200 rounded px-2 py-1 text-xs font-bold text-zinc-800 outline-none"
                            >
                                {Object.values(TEMPLATE_REGISTRY).map(t => <option key={t.key} value={t.key}>{t.name}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setShowGrid(!showGrid)}>
                            <div className={`w-3 h-3 border rounded-sm transition-colors ${showGrid ? 'bg-indigo-500 border-indigo-600' : 'bg-white border-zinc-300'}`}></div>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 select-none">X-Ray</span>
                        </div>
                    </div>

                    <div className="flex gap-2 relative">
                        <button 
                            onClick={handleRemix}
                            disabled={isOptimizing}
                            className="bg-black text-white px-4 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {isOptimizing ? 'Generating Variants...' : '✨ Remix Layout'}
                        </button>
                        
                        {variants.length > 0 && !isOptimizing && (
                            <div className="absolute top-10 right-0 w-[300px] bg-white border border-zinc-200 shadow-2xl rounded-md p-4 animate-fade-in z-50">
                                <h4 className="text-[10px] font-bold uppercase text-zinc-400 mb-3">AI Proposals</h4>
                                <div className="space-y-3">
                                    {variants.map((v, i) => (
                                        <div key={i} className="border border-zinc-200 p-3 rounded hover:border-black cursor-pointer bg-zinc-50 hover:bg-white transition-all group"
                                             onClick={() => {
                                                 onUpdateIssue({ ...issue, sections: v.sections });
                                                 setVariants([]);
                                             }}
                                        >
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-bold text-xs uppercase">{v.name}</span>
                                                <span className="text-[9px] text-zinc-400 font-mono opacity-0 group-hover:opacity-100">APPLY →</span>
                                            </div>
                                            <p className="text-[10px] text-zinc-500 leading-tight">{v.rationale}</p>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => setVariants([])} className="w-full mt-3 text-[9px] text-zinc-400 hover:text-red-500 font-bold uppercase">Discard</button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 flex justify-center bg-[#E5E5E5] relative">
                    <div className="bg-white shadow-2xl min-h-[1200px] w-full max-w-[1200px] scale-[0.95] origin-top">
                        <LayoutEngine 
                            sections={effectiveSections} 
                            data={issue} 
                            onBlockClick={previewSections ? undefined : setSelectedBlockId} 
                            selectedBlockId={previewSections ? null : selectedBlockId}
                            onContentDrop={handleContentDrop}
                            onBlockTypeDrop={handleBlockTypeDrop}
                            onBlockSwap={handleBlockSwap}
                            onBlockCreate={handleBlockCreate}
                            onBlockResize={handleBlockResize}
                            onBlockDelete={handleBlockDelete}
                            onSectionMove={handleSectionMove}
                            onSectionDelete={handleSectionDelete}
                            onSectionAdd={handleAddSection}
                            showGrid={showGrid}
                        />
                    </div>
                </div>
            </div>

            {/* 3. RIGHT: INSPECTOR */}
            <div className="w-[300px] bg-white border-l border-zinc-200 flex flex-col shrink-0 z-20">
                <SlotInspector 
                    block={selectedBlock} 
                    onUpdateBlock={handleBlockUpdate} 
                    onDeleteBlock={() => selectedBlockId && handleBlockDelete(selectedBlockId)}
                    availableTags={Array.from(new Set(assets.flatMap(a => a.tags || []))).sort()}
                />
            </div>

        </div>
    );
};
