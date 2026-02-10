
import React from 'react';
import { Citation, Footnote } from '../../types';

// --- CAPTION & CREDIT ---
export const Caption: React.FC<{ text: string; credit?: string; className?: string }> = ({ text, credit, className = "" }) => (
  <div className={`mt-6 flex flex-col md:flex-row gap-2 md:gap-4 text-xs font-sans tracking-wide leading-relaxed text-neutral-500 border-l-2 border-neutral-200 pl-4 ${className}`}>
    <span className="font-medium">{text}</span>
    {credit && <span className="uppercase font-bold text-black tracking-widest text-[11px] md:ml-auto whitespace-nowrap">{credit}</span>}
  </div>
);

// --- PULL QUOTE ---
export const PullQuote: React.FC<{ quote: string; citation?: string; ornament?: boolean }> = ({ quote, citation, ornament = true }) => (
  <div className="my-16 md:my-24 relative group">
    {ornament && <div className="absolute -left-6 -top-10 text-[140px] font-display text-neutral-100 leading-none select-none z-0">“</div>}
    <blockquote className="relative z-10 font-display text-5xl md:text-6xl leading-[1.1] text-black tracking-tight">
      {quote}
    </blockquote>
    {citation && (
      <div className="mt-8 flex items-center gap-4">
        <div className="h-px w-16 bg-accent"></div>
        <cite className="font-sans text-xs font-bold tracking-[0.2em] uppercase not-italic text-neutral-900">
          {citation}
        </cite>
      </div>
    )}
  </div>
);

// --- COVERLINES MODULE ---
interface CoverlineItem {
  eyebrow: string;
  title: string;
  deck: string;
}
export const Coverlines: React.FC<{ items: CoverlineItem[] }> = ({ items }) => (
  <div className="flex flex-col gap-2">
    {items.map((item, idx) => (
      <div key={idx} className="group cursor-pointer py-8 border-b border-black/10 first:pt-0 last:border-0 hover:pl-6 transition-all duration-500 ease-out">
        <span className="text-xs font-sans font-bold tracking-[0.25em] text-accent uppercase block mb-3 group-hover:text-black transition-colors">
          {item.eyebrow}
        </span>
        <h2 className="font-display text-4xl leading-[0.95] mb-3 group-hover:italic transition-all duration-300">
          {item.title}
        </h2>
        <p className="font-sans text-sm text-neutral-500 font-medium max-w-[90%] leading-relaxed">
          {item.deck}
        </p>
      </div>
    ))}
  </div>
);

// --- SPREAD LAYOUT ---
export const Spread: React.FC<{ 
  children: React.ReactNode; 
  variant?: 'split' | 'full' | 'offset';
  className?: string;
}> = ({ children, variant = 'split', className = "" }) => {
  const layouts = {
    split: "grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24",
    full: "w-full",
    offset: "grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12"
  };

  return (
    <div className={`w-full ${layouts[variant]} ${className}`}>
      {children}
    </div>
  );
};

// --- MARGINALIA: SOURCE CARD ---
export const SourceCard: React.FC<{ citation: Citation }> = ({ citation }) => (
  <div className="bg-neutral-50 border border-neutral-200 p-5 mb-6 text-xs font-sans hover:shadow-md transition-shadow duration-300">
    <div className="flex justify-between items-center mb-2">
      <span className="font-bold uppercase tracking-widest text-accent text-[11px]">Source</span>
      <span className="text-neutral-400 font-mono text-[10px]">{(citation.confidence * 100).toFixed(0)}% VALID</span>
    </div>
    <p className="text-neutral-900 leading-normal font-medium mb-3 line-clamp-2">{citation.source}</p>
    <div className="flex gap-2 items-center">
      <div className="h-1.5 w-full bg-neutral-200 rounded-full overflow-hidden">
        <div className="h-full bg-black" style={{ width: `${citation.confidence * 100}%` }}></div>
      </div>
    </div>
  </div>
);

// --- MARGINALIA: FOOTNOTE ---
export const FootnoteItem: React.FC<{ note: Footnote; index: number; highlighted?: boolean }> = ({ note, index, highlighted }) => (
  <div className={`text-xs font-sans leading-relaxed transition-colors ${highlighted ? 'text-black font-medium' : 'text-neutral-500'}`}>
    <div className="flex items-baseline gap-2 mb-1">
      <span className={`${highlighted ? 'text-accent' : 'text-neutral-400'} font-bold transition-colors`}>[{index + 1}]</span>
      <span className={`uppercase font-bold tracking-wider text-[11px] ${highlighted ? 'text-black' : 'text-neutral-700'}`}>{note.ref}</span>
    </div>
    {note.text}
  </div>
);
