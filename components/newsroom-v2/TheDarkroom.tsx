import React, { useContext } from 'react';
import { Image as ImageIcon, Loader2, RefreshCw, ChevronRight, Zap } from 'lucide-react';
import { NewsroomContext } from '../../contexts/NewsroomContext';
import { NewsroomButton, NewsroomLabel, NewsroomPanel, AssetPreviewCard } from './NewsroomUI';

export const TheDarkroom: React.FC = () => {
  const context = useContext(NewsroomContext);
  if (!context) return null;

  const { image, isGeneratingImage, reShoot, draft, publish, setStep } = context;

  return (
    <NewsroomPanel side="center" className="items-center justify-center p-12 text-center relative">
      <div className="max-w-md space-y-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="w-20 h-20 bg-crimson/[0.06] border border-crimson/20 rounded-full flex items-center justify-center mx-auto mb-10">
          <ImageIcon className="w-10 h-10 text-crimson" />
        </div>

        <div className="space-y-4">
          <NewsroomLabel type="header" className="tracking-[0.4em]">The Darkroom</NewsroomLabel>
          <div className="space-y-2 px-4">
            <p className="text-ink-soft font-display italic text-base leading-relaxed">
              Developing high-fidelity synthetic assets for:
            </p>
            <p className="text-ink font-semibold uppercase tracking-[0.18em] text-[14px] leading-relaxed max-w-xs mx-auto">
              {draft?.headline || 'No Draft Detected'}
            </p>
          </div>
        </div>

        <div className="pt-10 flex flex-col items-center gap-8 w-full">
          {image ? (
            <div className="space-y-8 animate-fade-in text-center w-full">
              <AssetPreviewCard 
                src={image} 
                onRefresh={reShoot} 
              />
              <div className="flex flex-col gap-4">
                <NewsroomButton
                  variant="tactical"
                  onClick={publish}
                  className="w-full h-14 flex items-center justify-between group"
                >
                  <span className="tracking-[0.3em]">Commit to Publication</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </NewsroomButton>
                <div className="flex justify-center gap-6">
                  <button 
                    onClick={() => setStep('EDITORIAL_BOARD')}
                    className="text-[10px] font-mono text-ink-faint hover:text-ink uppercase tracking-widest transition-colors"
                  >
                    [ Back to Bullpen ]
                  </button>
                  <button 
                    onClick={() => setStep('NEWS_TERMINAL')}
                    className="text-[10px] font-mono text-ink-faint hover:text-ink uppercase tracking-widest transition-colors"
                  >
                    [ Back to Wire ]
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 w-full">
              <NewsroomButton
                 variant="primary"
                 onClick={reShoot}
                 disabled={!draft || isGeneratingImage}
                 loading={isGeneratingImage}
                 icon={RefreshCw}
                 className="mx-auto h-12 px-10 tracking-[0.3em]"
              >
                Develop Lead Asset
              </NewsroomButton>
              <button 
                onClick={() => setStep('EDITORIAL_BOARD')}
                 className="text-[10px] font-mono text-ink-faint hover:text-ink uppercase tracking-widest transition-colors"
              >
                 [ Return to Editorial Board ]
              </button>
            </div>
          )}
        </div>
      </div>
    </NewsroomPanel>
  );
};

