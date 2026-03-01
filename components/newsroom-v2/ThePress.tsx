
import React, { useState } from 'react';
import { useNewsroom } from '../../hooks/useNewsroom';
import { Check, RefreshCw, LayoutTemplate, MonitorPlay } from 'lucide-react';
import { Dossier } from './Dossier';
import { MagazineItem, BlockType, BlockInstance, IssueContent } from '../../types';

// Import Layout Blocks for Preview
import { HeroTypePlate } from '../blocks/HeroTypePlate';
import { FeatureCard } from '../blocks/FeatureCard';
import { BlackManifestoPanel } from '../blocks/BlackManifestoPanel';
import { QuotePlate } from '../blocks/QuotePlate';

const PREVIEW_OPTIONS: { label: string; type: BlockType }[] = [
  { label: 'Hero Plate', type: 'HeroTypePlate' },
  { label: 'Feature Card', type: 'FeatureCard' },
  { label: 'Manifesto', type: 'BlackManifestoPanel' },
  { label: 'Quote', type: 'QuotePlate' },
];

export const ThePress: React.FC = () => {
  const { step, draft, image, reset, reDraft, reShoot } = useNewsroom();
  const [previewLayout, setPreviewLayout] = useState<BlockType>('HeroTypePlate');

  // Construct the preview item from current draft state
  const previewItem: MagazineItem | null = draft && image ? {
    id: 'preview_artifact',
    title: draft.headline,
    dek: draft.deck,
    published_at: new Date().toISOString(),
    tags: draft.tags || [],
    media_type: 'image',
    hero_image_url: image,
    status: 'review',
    featured_level: 'none',
    body: draft.body,
    blocks: draft.blocks
  } : null;

  // Construct a mock IssueContent for blocks that require it (HeroTypePlate, BlackManifestoPanel)
  const mockIssueContent: IssueContent = {
    meta: {
        run_id: 'preview',
        issue_id: 'preview',
        vol: 'PREVIEW',
        theme: 'PREVIEW',
        date: 'NOW',
        editor: 'YOU',
        status: 'WRITING',
        metrics: { signals_ingested: 0, avg_confidence: 0, error_rate: 0 }
    },
    items: previewItem ? [previewItem] : [],
    ticker: [],
    cover: {
        eyebrow: "PREVIEW",
        title: draft?.headline || "Untitled",
        deck: draft?.deck || "No deck",
        coverlines: [],
        imgPrompt: "",
        img_base64: image || ""
    },
    edit: [],
    drops: [],
    debates: [],
    features: [],
    columns: [],
    atelier: [],
    index_keys: [],
    colophon: { contributors: [], sources: [], corrections: [] }
  };

  // Construct a mock block configuration for the preview
  const previewBlock: BlockInstance = {
    id: 'preview_block',
    block_type: previewLayout,
    col_span: 12,
    row_span: 6,
    variant: 'L',
    data_binding: { source: 'static' }
  };

  const renderPreview = () => {
    if (!previewItem) return null;

    switch (previewLayout) {
      case 'HeroTypePlate': return <HeroTypePlate config={previewBlock} content={mockIssueContent} data={previewItem} />;
      case 'FeatureCard': return <FeatureCard config={previewBlock} data={previewItem} />;
      case 'BlackManifestoPanel': return <BlackManifestoPanel config={previewBlock} content={mockIssueContent} />;
      case 'QuotePlate': return <QuotePlate config={previewBlock} data={previewItem} />;
      default: return <HeroTypePlate config={previewBlock} content={mockIssueContent} data={previewItem} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full p-6 h-full overflow-hidden">
      <Dossier
        title={draft ? draft.headline : "FINAL ARTIFACT"}
        status={step === 'PUBLISHED' ? "PUBLISHED" : (draft && image ? "READY FOR PRESS" : "PENDING")}
        classification="PUBLIC RELEASE"
      >
        <div className="flex-1 flex flex-col h-full">
          {draft && image && step !== 'PUBLISHED' ? (
            <div className="flex-1 flex flex-col h-full gap-6">
              
              {/* Header & Controls */}
              <div className="flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-2xl font-bold text-white font-display">Layout Preview</h2>
                  <p className="text-zinc-500">Verify artifact rendering on the grid.</p>
                </div>
                
                <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                  {PREVIEW_OPTIONS.map((opt) => (
                    <button
                      key={opt.type}
                      onClick={() => setPreviewLayout(opt.type)}
                      className={`
                        px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-all
                        ${previewLayout === opt.type 
                          ? 'bg-zinc-800 text-white shadow-sm' 
                          : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}
                      `}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* The Preview Canvas */}
              <div className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden relative flex items-center justify-center p-8">
                <div className="w-full max-w-4xl shadow-2xl bg-white">
                   {/* We wrap in a div that simulates a grid cell or container */}
                   {renderPreview()}
                </div>
                
                {/* Overlay Badge */}
                <div className="absolute top-4 right-4 bg-black/80 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded border border-white/10 flex items-center gap-2">
                  <MonitorPlay className="w-3 h-3 text-emerald-500" />
                  LIVE PREVIEW
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex justify-center gap-4 shrink-0 pt-2">
                <button onClick={reset} className="px-6 py-3 text-zinc-500 hover:text-red-500 transition-colors font-bold text-xs tracking-widest">SCRAP ARTIFACT</button>
                <button onClick={reDraft} className="px-6 py-3 text-zinc-400 hover:text-white transition-colors flex items-center gap-2 font-bold text-xs tracking-widest border border-zinc-800 rounded hover:bg-zinc-800">
                  <RefreshCw className="w-4 h-4" /> RE-DRAFT
                </button>
                <button onClick={reShoot} className="px-6 py-3 text-zinc-400 hover:text-white transition-colors flex items-center gap-2 font-bold text-xs tracking-widest border border-zinc-800 rounded hover:bg-zinc-800">
                  <RefreshCw className="w-4 h-4" /> RE-SHOOT
                </button>
              </div>
            </div>
          ) : step === 'PUBLISHED' ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-6 animate-fade-in h-full">
              <div className="w-32 h-32 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center border-4 border-emerald-500/20">
                <Check className="w-16 h-16" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-4xl font-black text-white tracking-tighter uppercase font-display">PUBLISHED</h2>
                <p className="text-zinc-500 font-mono text-xs tracking-widest">THE ARTIFACT IS LIVE ON THE GRID.</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4 opacity-50 h-full">
              <LayoutTemplate className="w-12 h-12 text-zinc-600" />
              <p className="text-sm text-zinc-500">No artifacts ready for review.</p>
            </div>
          )}
        </div>
      </Dossier>
    </div>
  );
};
