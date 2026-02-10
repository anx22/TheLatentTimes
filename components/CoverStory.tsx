
import React from 'react';
import { Coverlines, Caption } from './ui/Editorial';
import { IssueContent } from '../types';

interface CoverStoryProps {
  data: IssueContent['cover'];
}

export const CoverStory: React.FC<CoverStoryProps> = ({ data }) => {
  return (
    <section className="max-w-[1536px] mx-auto px-6 md:px-16 mb-32 min-h-screen grid grid-cols-12 gap-8 md:gap-16 pt-32 md:pt-48 border-b border-black pb-16">
      {/* Left Column: Coverlines */}
      <div className="col-span-12 md:col-span-3 pr-0 md:pr-4 flex flex-col justify-center order-2 md:order-1">
        <div className="mb-12 md:mb-0">
          <Coverlines items={data.coverlines} />
        </div>
      </div>

      {/* Right Column: Main Visual */}
      <div className="col-span-12 md:col-span-9 relative order-1 md:order-2 h-[60vh] md:h-[85vh] group">
        <div className="absolute inset-0 bg-neutral-100 -z-10"></div>
        <img 
          src={data.img_base64 || "https://picsum.photos/1200/1600?random=cover"} 
          alt="Cover Model" 
          className="w-full h-full object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-[1.5s] ease-in-out mix-blend-multiply"
        />
        
        {/* Floating Cover Badge */}
        <div className="absolute bottom-0 right-0 bg-white p-8 md:p-12 max-w-lg shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] transform translate-y-12 md:-translate-x-12 md:-translate-y-12 group-hover:-translate-y-16 transition-transform duration-700 border border-black z-20">
          <span className="bg-accent text-white text-xs font-sans font-bold tracking-[0.3em] px-4 py-2 uppercase inline-block mb-8">{data.eyebrow}</span>
          <h2 className="font-display text-6xl md:text-8xl lg:text-9xl leading-[0.8] tracking-tighter mb-8">{data.title}</h2>
          <p className="font-sans text-lg md:text-xl font-medium leading-relaxed text-neutral-600">
            {data.deck}
          </p>
          <Caption text="Photography by V6.1" credit={`PROMPT: ${data.imgPrompt?.slice(0, 30)}...`} className="mt-10" />
        </div>
      </div>
    </section>
  );
};
