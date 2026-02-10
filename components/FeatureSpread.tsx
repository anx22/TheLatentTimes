
import React, { useState } from 'react';
import { Spread, PullQuote, Caption, FootnoteItem, SourceCard } from './ui/Editorial';
import { Story, LayoutDirectives } from '../types';

interface FeatureSpreadProps {
  data: Story;
}

// Default Fallback
const DEFAULT_LAYOUT: LayoutDirectives = {
  template: 'EDITORIAL',
  headline_scale: 'STANDARD',
  hero_position: 'TOP',
  alignment: 'LEFT',
  drop_cap: true
};

export const FeatureSpread: React.FC<FeatureSpreadProps> = ({ data }) => {
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  if (!data) return null;

  const layout = data.layout || DEFAULT_LAYOUT;
  const isCenter = layout.alignment === 'CENTER';
  
  // Style Mappings
  const headlineClass = {
    'STANDARD': 'text-7xl md:text-8xl leading-[0.9] tracking-tighter',
    'MASSIVE': 'text-8xl md:text-[140px] leading-[0.8] tracking-tighter uppercase',
    'DISPLAY': 'text-6xl md:text-7xl font-sans font-bold tracking-tighter uppercase'
  }[layout.headline_scale];

  // Template Variation: IMMERSIVE (Full Bleed Background)
  if (layout.template === 'IMMERSIVE' && data.img_base64) {
      return (
          <section className="relative min-h-screen text-white overflow-hidden group">
              {/* Background Image */}
              <div className="absolute inset-0 z-0">
                  <img src={data.img_base64} className="w-full h-full object-cover brightness-50 contrast-125 group-hover:scale-105 transition-transform duration-[3s] ease-out" alt="Immersive Cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
              </div>

              <div className="relative z-10 max-w-[1536px] mx-auto px-6 md:px-16 pt-32 md:pt-64 pb-20 grid grid-cols-12 gap-8">
                  <div className="col-span-12 md:col-span-8">
                      <span className="text-xs font-sans font-bold tracking-[0.25em] text-accent block mb-8 uppercase pl-1 border-l-4 border-accent">{data.category}</span>
                      <h2 className={`${headlineClass} mb-12 drop-shadow-lg text-balance`}>
                        {data.headline}
                      </h2>
                      <p className="font-sans text-xl md:text-3xl font-medium leading-relaxed max-w-3xl text-neutral-200 text-pretty drop-shadow-md">
                        {data.deck}
                      </p>
                  </div>
              </div>

              {/* Read More / Body Overlay */}
              <div className="relative z-10 bg-white text-black py-24">
                   <div className="max-w-[1536px] mx-auto px-6 md:px-16">
                       <Spread variant="offset">
                           <div className="col-span-12 md:col-span-8 md:pr-16">
                               <div className="font-display text-2xl leading-relaxed">
                                   {data.body.map((p, i) => (
                                       <p key={i} className="mb-8">{p}</p>
                                   ))}
                               </div>
                           </div>
                           <div className="col-span-12 md:col-span-4 border-l border-gray-200 pl-8">
                               <span className="block text-xs font-sans font-bold uppercase tracking-[0.25em] mb-8 text-neutral-400">Marginalia</span>
                               {data.footnotes.map((fn, i) => (
                                   <div key={fn.id} className="mb-4 text-xs text-gray-500">[{i+1}] {fn.text}</div>
                               ))}
                           </div>
                       </Spread>
                   </div>
              </div>
          </section>
      );
  }

  // STANDARD / MINIMAL Templates
  return (
    <section className="bg-white text-black py-32 border-t border-black">
      <div className="max-w-[1536px] mx-auto px-6 md:px-16">
        
        {/* HEADER BLOCK */}
        <div className={`max-w-5xl mb-24 ${isCenter ? 'mx-auto text-center' : ''}`}>
          <span className={`text-xs font-sans font-bold tracking-[0.25em] text-accent block mb-8 uppercase ${isCenter ? '' : 'pl-1 border-l-4 border-accent'}`}>
              {data.category || "Feature"}
          </span>
          <h2 className={`${headlineClass} mb-12 text-balance`}>
            {data.headline}
          </h2>
          <p className={`font-sans text-xl md:text-3xl font-medium leading-relaxed text-neutral-600 text-pretty ${isCenter ? 'mx-auto' : ''}`}>
            {data.deck}
          </p>
        </div>

        {/* HERO IMAGE PLACEMENT */}
        {data.img_base64 && layout.hero_position !== 'BACKGROUND' && (
           <div className={`mb-24 relative overflow-hidden bg-neutral-100 group ${layout.hero_position === 'SPLIT_RIGHT' ? 'float-right w-1/2 ml-12 mb-12 aspect-[4/5]' : 'w-full aspect-[21/9]'}`}>
              <img 
                 src={data.img_base64} 
                 alt={data.headline} 
                 className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
              />
              <div className="absolute bottom-0 left-0 bg-white/90 p-4 backdrop-blur-sm">
                 <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                     Fig 1.0 // {data.img_brief?.concept || "Visualization"}
                 </span>
              </div>
           </div>
        )}

        <Spread variant="offset">
          {/* Main Body Column (8 cols) */}
          <div className="col-span-12 md:col-span-8 md:pr-16">
             <div className={`font-display text-2xl md:text-[26px] text-black leading-[1.6] mb-16 tracking-tight ${layout.template === 'MINIMAL' ? 'font-sans font-light' : ''}`}>
               {data.body.map((p, i) => (
                 <div key={i} className="mb-10 relative">
                    {i === 0 && layout.drop_cap && <span className="drop-cap">{p.charAt(0)}</span>}
                    
                    {/* Render paragraph with highlighted footnotes */}
                    <p className={i === 0 && layout.drop_cap ? "pt-2" : ""}>
                      {p.split(' ').map((word, wordIdx) => {
                         const cleanWord = word.replace(/[^a-zA-Z0-9]/g, "");
                         const note = data.footnotes.find(fn => fn.ref.toLowerCase() === cleanWord.toLowerCase());
                         const noteIndex = data.footnotes.indexOf(note as any) + 1;
                         
                         const isActive = note && activeNoteId === note.id;

                         if (note) {
                           return (
                             <span 
                               key={wordIdx} 
                               className={`relative group cursor-help border-b-2 transition-all duration-300 ${isActive ? 'bg-accent/20 border-accent text-accent-dark' : 'border-dotted border-accent/40 hover:bg-accent/10'}`}
                               onMouseEnter={() => setActiveNoteId(note.id)}
                               onMouseLeave={() => setActiveNoteId(null)}
                               onClick={() => setActiveNoteId(prev => prev === note.id ? null : note.id)} // Toggle for mobile
                             >
                               {word}{' '}
                               <sup className={`text-[10px] font-bold -top-3 ml-0.5 align-super transition-colors ${isActive ? 'text-accent' : 'text-neutral-400 group-hover:text-accent'}`}>
                                 [{noteIndex}]
                               </sup>
                             </span>
                           );
                         }
                         return word + ' ';
                      })}
                    </p>
                 </div>
               ))}
             </div>
             
             {data.pull_quote && <PullQuote quote={data.pull_quote} citation={data.headline} />}
          </div>

          {/* Marginalia Column (4 cols) - Sticky on Desktop */}
          <div className="col-span-12 md:col-span-4 border-l border-neutral-200 pl-0 md:pl-10 pt-4 relative">
             <div className="sticky top-8">
               <span className="block text-xs font-sans font-bold uppercase tracking-[0.25em] mb-10 text-neutral-400">Marginalia & Provenance</span>
               
               {/* Citations */}
               <div className="mb-16">
                 {data.citations && data.citations.map((cite, i) => (
                   <SourceCard key={i} citation={cite} />
                 ))}
               </div>

               {/* Footnotes */}
               <div className="space-y-4 transition-all">
                  {data.footnotes && data.footnotes.map((fn, i) => (
                    <div 
                      key={fn.id}
                      className={`transition-all duration-500 rounded-lg p-2 -ml-2 ${activeNoteId === fn.id ? 'bg-accent/5 translate-x-2 shadow-sm border-l-4 border-accent' : 'border-l-4 border-transparent opacity-70 hover:opacity-100'}`}
                    >
                      <FootnoteItem note={fn} index={i} highlighted={activeNoteId === fn.id} />
                    </div>
                  ))}
               </div>
             </div>
          </div>
        </Spread>
        
        <div className="mt-20 pt-10 border-t border-black">
           <Caption 
              text={data.img_caption || "Latent Visualization"} 
              credit={data.img_brief ? `PROMPT: ${data.img_brief.technical_prompt}` : `PROMPT: ${data.img_prompt?.slice(0, 40)}...`} 
           />
           {data.layout && (
               <div className="mt-2 text-[9px] font-mono text-gray-400 uppercase tracking-widest">
                   Layout: {data.layout.template} / {data.layout.headline_scale}
               </div>
           )}
        </div>
      </div>
    </section>
  );
};
