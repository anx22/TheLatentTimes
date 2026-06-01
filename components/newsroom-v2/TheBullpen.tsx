import React, { useContext } from 'react';
import { PenTool, ChevronRight, MessageSquare, Sparkles } from 'lucide-react';
import { NewsroomContext } from '../../contexts/NewsroomContext';
import { NewsroomButton, NewsroomLabel, NewsroomPanel, EmptyState } from './NewsroomUI';

export const TheBullpen: React.FC = () => {
  const context = useContext(NewsroomContext);
  if (!context) return null;

  const { topic, draft, isDrafting, runPipeline, setStep } = context;

  return (
    <NewsroomPanel side="center" className="flex flex-col bg-paper p-6 lg:p-12 overflow-y-auto custom-scrollbar">
      <div className="max-w-3xl mx-auto w-full space-y-8 animate-in fade-in zoom-in-95 duration-700">

        <div className="flex items-center justify-between border-b border-hairline pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-crimson/[0.06] border border-crimson/20 flex items-center justify-center">
              <PenTool className="w-6 h-6 text-crimson" />
            </div>
            <div>
              <NewsroomLabel type="header" className="tracking-[0.3em]">The Bullpen</NewsroomLabel>
              <div className="text-ink-faint font-mono text-[11px] uppercase tracking-[0.18em] mt-1">
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
          <EmptyState
            icon={MessageSquare}
            title="No active draft"
            hint="Select a signal in The Wire and initiate assembly to begin the editorial process."
            className="py-16"
          />
        ) : (
          <div className="space-y-8">
            <div>
              <NewsroomLabel type="key">Status: Editorial Consensus Achieved</NewsroomLabel>
              <h1 className="text-4xl md:text-6xl font-display text-ink mt-4 leading-[1.05]">
                {draft.headline}
              </h1>
              <p className="text-xl text-ink-soft font-display italic mt-6 leading-relaxed">
                {draft.deck}
              </p>
            </div>

            <div className="h-px bg-hairline w-full" />

            <div className="max-w-none font-sans text-[16px] leading-loose text-ink-soft space-y-5">
               {draft.body.split('\n').map((paragraph: string, idx: number) => (
                 <p key={idx}>{paragraph}</p>
               ))}
            </div>

            <div className="pt-8 border-t border-hairline flex justify-end">
              <NewsroomButton
                variant="primary"
                onClick={() => setStep('DARKROOM')}
                icon={ChevronRight}
                className="h-12 px-8"
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
