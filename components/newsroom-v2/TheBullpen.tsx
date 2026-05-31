import React, { useContext } from 'react';
import { PenTool, ChevronRight, MessageSquare, Sparkles } from 'lucide-react';
import { NewsroomContext } from '../../contexts/NewsroomContext';
import { NewsroomButton, NewsroomLabel, NewsroomPanel, EditorialCard } from './NewsroomUI';

export const TheBullpen: React.FC = () => {
  const context = useContext(NewsroomContext);
  if (!context) return null;

  const { topic, draft, isDrafting, runPipeline, setStep } = context;

  return (
    <NewsroomPanel side="center" className="flex flex-col bg-zinc-900 p-6 lg:p-12 overflow-y-auto custom-scrollbar">
      <div className="max-w-3xl mx-auto w-full space-y-8 animate-in fade-in zoom-in-95 duration-700">
        
        <div className="flex items-center justify-between border-b border-emerald-500/20 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-sm flex items-center justify-center">
              <PenTool className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <NewsroomLabel type="header" className="tracking-[0.3em] text-emerald-500">The Bullpen</NewsroomLabel>
              <div className="text-zinc-500 font-mono text-[11px] uppercase tracking-widest mt-1">
                {topic ? `Editorial Focus: ${topic}` : 'Awaiting primary narrative signal.'}
              </div>
            </div>
          </div>
          {topic && (
            <NewsroomButton
               variant="tactical"
               onClick={() => runPipeline()}
               disabled={isDrafting}
               loading={isDrafting}
               icon={Sparkles}
            >
              {draft ? 'Revise Draft' : 'Assemble Draft'}
            </NewsroomButton>
          )}
        </div>

        {!draft ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <MessageSquare className="w-12 h-12 text-zinc-700 mb-4" />
            <div className="text-[14px] font-mono uppercase tracking-[0.2em] text-zinc-500 mb-2">No Active Draft</div>
            <p className="text-zinc-600 font-serif italic text-sm text-center max-w-md">
              Select a signal in The Wire and initiate assembly to begin the editorial process.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <NewsroomLabel type="key">Status: Editorial Consensus Achieved</NewsroomLabel>
              <h1 className="text-3xl md:text-5xl font-black text-white mt-4 font-sans tracking-tighter leading-tight">
                {draft.headline}
              </h1>
              <p className="text-xl text-zinc-400 font-serif italic mt-6 leading-relaxed">
                {draft.deck}
              </p>
            </div>
            
            <div className="h-px bg-zinc-800 w-full" />
            
            <div className="prose prose-invert prose-zinc max-w-none font-sans text-[16px] leading-loose text-zinc-300">
               {draft.body.split('\n').map((paragraph: string, idx: number) => (
                 <p key={idx}>{paragraph}</p>
               ))}
            </div>

            <div className="pt-8 border-t border-zinc-800 flex justify-end">
              <NewsroomButton
                variant="primary"
                onClick={() => setStep('DARKROOM')}
                icon={ChevronRight}
                className="h-12 px-8 font-mono text-xs uppercase tracking-widest"
              >
                Send to Darkroom
              </NewsroomButton>
            </div>
          </div>
        )}
      </div>
    </NewsroomPanel>
  );
};

