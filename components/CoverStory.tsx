
import React from 'react';
import { Coverlines, Caption, DebugScaffold } from './ui/Editorial';
import { IssueContent } from '../types';
import { SmartImage } from './ui/SmartImage';

interface CoverStoryProps {
  data: IssueContent['cover'];
}

export const CoverStory: React.FC<CoverStoryProps> = ({ data }) => {
  if (!data || !data.title) {
    return <DebugScaffold label="COVER STORY" error="NO_CONTENT" />;
  }

  return (
    <section className="max-w-[1536px] mx-auto px-6 md:px-16 mb-20 md:mb-32 pt-12 md:pt-24 min-h-[90vh] flex flex-col justify-between">
      
      {/* 1. HERO TITLE: Punchy but Stable */}
      <div className="relative z-10 border-b border-black pb-8 md:pb-0">
         <div className="flex flex-col md:flex-row md:items-end justify-between mb-2">
            <span className="bg-accent text-white text-[10px] font-sans font-bold tracking-[0.3em] px-2 py-1 uppercase inline-block mb-4 md:mb-6 animate-fade-in">
              {data.eyebrow}
            </span>
            <span className="hidden md:block text-[10px] font-sans font-bold tracking-[0.3em] uppercase mb-8 text-right text-neutral-400 animate-fade-in delay-100">
               Issue No. 135
            </span>
         </div>
         {/* Masked Reveal for Massive Title */}
         <div className="mask-text">
            <h2 className="font-display font-bold text-7xl md:text-9xl lg:text-[10rem] leading-[0.85] tracking-tighter uppercase text-black animate-reveal">
              {data.title}
            </h2>
         </div>
      </div>

      {/* 2. SPLIT LAYOUT: Image + Dense Info */}
      <div className="grid grid-cols-12 gap-8 md:gap-12 mt-8 md:mt-12 flex-grow">
        
        {/* Left: Image (Dominant) */}
        <div className="col-span-12 md:col-span-8 relative group overflow-hidden bg-neutral-100 aspect-[4/5] md:aspect-[16/9] animate-fade-in delay-200">
            <SmartImage 
              src={data.img_base64 || "https://picsum.photos/1200/1600?random=cover"} 
              alt="Cover Model" 
              priority={true} // Eager load the LCP element
              className="w-full h-full object-cover mix-blend-multiply hover:grayscale-0 transition-all duration-[1.5s]"
            />
            <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20">
                 <Caption text="Fig 1.0" credit={`PROMPT: ${data.imgPrompt?.slice(0, 20)}...`} className="text-white border-white/50" />
            </div>
        </div>

        {/* Right: The Hook & Coverlines */}
        <div className="col-span-12 md:col-span-4 flex flex-col justify-between h-full border-t md:border-t-0 border-black pt-8 md:pt-0 animate-fade-in delay-300">
            
            {/* The Deck */}
            <div className="mb-12">
               <p className="font-sans text-2xl md:text-3xl font-bold leading-tight tracking-tight text-black mb-8 uppercase text-balance">
                 {data.deck}
               </p>
               <div className="w-12 h-2 bg-accent"></div>
            </div>

            {/* Coverlines List */}
            <div className="mt-auto">
               <span className="block text-[10px] font-sans font-bold tracking-[0.25em] uppercase mb-6 text-neutral-400 border-b border-neutral-200 pb-2">
                 Inside This Issue
               </span>
               <Coverlines items={data.coverlines} />
            </div>
        </div>
      </div>
    </section>
  );
};
