import React from 'react';
import { Loader2, Image as ImageIcon } from 'lucide-react';
import { useNewsroom } from '../../hooks/useNewsroom';

export const TheDarkroom: React.FC = () => {
  const { step, image, draft } = useNewsroom();
  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-6">
      {step === 'VISUALIZING' ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-6">
          <div className="w-full max-w-2xl aspect-[16/9] bg-zinc-900 border border-zinc-800 rounded flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        </div>
      ) : image ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-6 animate-fade-in">
          <div className="relative w-full max-w-2xl aspect-[16/9] bg-black rounded overflow-hidden border border-zinc-800 shadow-2xl">
            <img src={image} alt="Generated" className="w-full h-full object-cover" />
          </div>
          <div className="w-full max-w-2xl text-xs text-zinc-400 bg-zinc-950 p-4 rounded border border-zinc-800">
            <span className="font-bold text-emerald-500 uppercase tracking-widest block mb-2">Developed from Prompt:</span> 
            {draft?.suggested_visual_prompt}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center space-y-4 opacity-50">
          <ImageIcon className="w-12 h-12 text-zinc-700" />
          <p className="text-sm text-zinc-500">The Darkroom is empty. Awaiting editorial copy.</p>
        </div>
      )}
    </div>
  );
};
