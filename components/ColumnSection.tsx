
import React from 'react';
import { StoryArtifact } from '../types';

interface ColumnSectionProps {
  columns: StoryArtifact[];
}

const PersonaBadge: React.FC<{ persona: string }> = ({ persona }) => {
    let colors = "bg-gray-100 text-gray-500";
    if (persona === 'THE_CRITIC') colors = "bg-red-50 text-red-800 border-red-100";
    if (persona === 'THE_OPTIMIST') colors = "bg-blue-50 text-blue-800 border-blue-100";
    if (persona === 'THE_GHOST') colors = "bg-purple-50 text-purple-800 border-purple-100";
    
    return (
        <span className={`px-2 py-1 text-[9px] uppercase tracking-widest font-bold border ${colors} inline-block mb-2 rounded-sm`}>
            {persona.replace('THE_', '')}
        </span>
    );
}

export const ColumnSection: React.FC<ColumnSectionProps> = ({ columns }) => {
  if (!columns || columns.length === 0) return null;

  return (
    <section className="max-w-[1536px] mx-auto px-6 md:px-16 py-32 border-t border-black">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
        <div className="col-span-12 md:col-span-3">
          <span className="block text-xs font-sans font-bold tracking-[0.25em] uppercase mb-6 text-accent">Opinion & Theory</span>
          <h3 className="font-display text-5xl md:text-6xl leading-none tracking-tight">Voices</h3>
        </div>
        
        <div className="col-span-12 md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-20">
          {columns.map((col) => (
            <article key={col.id} className="group cursor-pointer">
              <div className="mb-8 overflow-hidden aspect-[3/2] bg-neutral-100 relative">
                <img 
                   src={`https://picsum.photos/800/600?random=${col.id}`} 
                   alt="Columnist" 
                   className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 transition-all duration-[0.8s]"
                />
              </div>
              
              <div className="mb-4">
                  {col.author_persona && <PersonaBadge persona={col.author_persona} />}
                  <span className="block text-xs font-sans font-bold tracking-[0.2em] uppercase border-b border-black pb-2 inline-block ml-0">
                    {col.category || "Column"}
                  </span>
              </div>
              
              <h4 className="font-display text-3xl md:text-4xl mb-5 leading-[1.1] group-hover:text-neutral-600 transition-colors">
                {col.headline}
              </h4>
              <p className="font-display text-xl leading-relaxed text-neutral-600 line-clamp-4 text-pretty">
                {col.deck}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
