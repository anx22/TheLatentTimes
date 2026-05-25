import React, { useContext } from 'react';
import { Printer, CheckCircle, ExternalLink, Activity } from 'lucide-react';
import { NewsroomContext } from '../../../contexts/NewsroomContext';
import { NewsroomButton, NewsroomLabel, NewsroomPanel } from '../NewsroomUI';

export const PrintingPress: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const context = useContext(NewsroomContext);
  if (!context) return null;

  const { step, draft } = context;

  return (
    <NewsroomPanel side="center" className="items-center justify-center p-12 text-center relative">
      <div className="max-w-md space-y-10 animate-in fade-in zoom-in-95 duration-1000">
        <div className="w-20 h-20 bg-emerald-500/5 border border-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-10 shadow-[0_0_40px_rgba(16,185,129,0.08)]">
          <Printer className="w-10 h-10 text-emerald-500/70" />
        </div>
        
        <div className="space-y-4">
          <NewsroomLabel type="header" className="tracking-[0.4em] text-emerald-500">The Press</NewsroomLabel>
          <p className="text-zinc-500 font-serif italic text-base leading-relaxed px-4 text-balance">
            {step === 'PUBLISHED' 
              ? 'Article successfully committed to the magazine grid architecture.' 
              : `Orchestrating layout placement for: ${draft?.headline || 'Active Column'}`}
          </p>
        </div>

        <div className="pt-10">
          {step === 'PUBLISHED' ? (
            <div className="space-y-8">
              <div className="flex items-center justify-center gap-3 text-emerald-500 animate-in zoom-in duration-700">
                <CheckCircle className="w-6 h-6" />
                <span className="font-mono text-xs uppercase tracking-[0.3em] font-black">System Confirmation: Published</span>
              </div>
              <div className="flex flex-col gap-4">
                <NewsroomButton
                  variant="primary"
                  onClick={() => context.setStep('NEWS_TERMINAL')}
                  className="mx-auto h-12 px-10 tracking-[0.2em]"
                >
                  Start New Mission
                </NewsroomButton>

                {onClose && (
                  <NewsroomButton
                    variant="tactical"
                    onClick={onClose}
                    className="mx-auto h-12 px-10 tracking-[0.2em] border-emerald-500/20"
                  >
                    View in Newspaper
                  </NewsroomButton>
                )}

                <button 
                  onClick={() => window.location.reload()}
                  className="text-[10px] font-mono text-zinc-600 hover:text-white uppercase tracking-widest transition-colors flex items-center justify-center gap-2 pt-4"
                >
                  <ExternalLink className="w-3 h-3" /> [ Exit & Refresh Hive ]
                </button>
              </div>
            </div>
          ) : (
             <div className="flex flex-col items-center gap-6 py-10 scale-110">
                <Activity className="w-8 h-8 text-emerald-500/20 animate-pulse" />
                <NewsroomLabel type="key" className="text-zinc-800 animate-pulse tracking-[0.5em] font-black">
                  Awaiting grid placement confirmation...
                </NewsroomLabel>
             </div>
          )}
        </div>
      </div>
    </NewsroomPanel>
  );
};

