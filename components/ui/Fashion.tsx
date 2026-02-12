import React, { useState } from 'react';
import { Caption } from './Editorial';

// --- RUNWAY NOTES ---
interface Note {
  time: string;
  text: string;
  highlight?: boolean;
}
export const RunwayNotes: React.FC<{ notes: Note[] }> = ({ notes }) => (
  <div className="font-mono text-xs">
    <div className="border-b-2 border-black pb-2 mb-4 font-sans font-bold tracking-widest uppercase text-[11px] flex justify-between">
      <span>Live Desk</span>
      <span className="animate-pulse text-accent">● Recording</span>
    </div>
    <ul className="space-y-4 relative border-l border-neutral-200 ml-1.5 pl-6">
      {notes.map((note, idx) => (
        <li key={idx} className="relative">
          <span className="absolute -left-[29px] top-1 w-2 h-2 rounded-full bg-neutral-300 border-2 border-white ring-1 ring-neutral-100"></span>
          <span className="block text-[10px] font-bold text-neutral-400 mb-1">{note.time}</span>
          <p className={`${note.highlight ? 'bg-yellow-100 p-2 -ml-2 rounded' : 'text-neutral-700'}`}>
            {note.text}
          </p>
        </li>
      ))}
    </ul>
  </div>
);

// --- LOOKBOOK CAROUSEL ---
interface Look {
  src: string;
  id: string;
  desc: string;
}
export const Lookbook: React.FC<{ looks: Look[] }> = ({ looks }) => {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((p) => (p + 1) % looks.length);
  const prev = () => setCurrent((p) => (p - 1 + looks.length) % looks.length);

  return (
    <div className="relative group">
      <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100 cursor-crosshair" onClick={next}>
        <img 
          src={looks[current].src} 
          alt={looks[current].id} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Navigation overlay */}
        <div className="absolute inset-0 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity p-4">
          <button onClick={(e) => {e.stopPropagation(); prev()}} className="self-center p-2 hover:bg-white/20 rounded-full">←</button>
          <button onClick={(e) => {e.stopPropagation(); next()}} className="self-center p-2 hover:bg-white/20 rounded-full">→</button>
        </div>
        
        {/* Index indicator */}
        <div className="absolute bottom-4 left-4 bg-black/80 text-white px-2 py-1 text-[10px] font-mono">
          LOOK {current + 1} / {looks.length}
        </div>
      </div>
      
      <div className="mt-4 flex justify-between items-start">
        <div className="max-w-[80%]">
          <span className="block font-sans font-bold text-xs uppercase tracking-widest mb-1">{looks[current].id}</span>
          <p className="font-display text-lg leading-tight">{looks[current].desc}</p>
        </div>
        <button className="text-[10px] font-sans font-bold uppercase tracking-widest border-b border-black hover:text-accent hover:border-accent transition-colors">
          Save
        </button>
      </div>
    </div>
  );
};
