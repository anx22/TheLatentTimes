import React from 'react';

interface DraftHeaderProps {
  image: string | null;
  tags: string[];
  headline: string;
  deck: string;
}

export const DraftHeader: React.FC<DraftHeaderProps> = ({ image, tags, headline, deck }) => {
  return (
    <>
      {image && (
        <div className="relative w-full aspect-[21/9] bg-black rounded overflow-hidden border border-zinc-800 mb-8">
          <img src={image} alt="Header" className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
        </div>
      )}
      
      <div className="space-y-4 border-b border-zinc-800 pb-8">
        <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">{tags.join(' • ')}</span>
        <h2 className="text-5xl md:text-6xl font-display font-bold leading-tight text-white">{headline}</h2>
        <p className="text-2xl text-zinc-400 italic border-l-4 border-emerald-500 pl-6">{deck}</p>
      </div>
    </>
  );
};
