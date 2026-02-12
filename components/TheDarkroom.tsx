import React, { useState, useRef } from 'react';
import { editImage } from '../services/gemini';

export const TheDarkroom: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImage(ev.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleEdit = async () => {
    if (!image || !editPrompt) return;
    setLoading(true);
    setError(null);
    try {
      const result = await editImage(image, editPrompt);
      setImage(result); // Update the canvas with the edited version
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during retouching');
    } finally {
      setLoading(false);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <section className="max-w-[1440px] mx-auto px-6 md:px-16 py-20 bg-neutral-900 text-white min-h-screen">
       <div className="mb-12 border-b border-neutral-700 pb-4 flex justify-between items-end">
        <div>
          <h2 className="font-display text-5xl mb-2 text-white">The Darkroom</h2>
          <p className="font-sans text-sm text-neutral-400 uppercase tracking-widest font-bold">AI Retouching Suite • Powered by Gemini 2.5 Flash</p>
        </div>
        <div className="hidden md:block text-[11px] font-sans font-bold text-neutral-500">SESSION: <span className="text-white">ACTIVE</span></div>
      </div>

      <div className="grid grid-cols-12 gap-12">
        {/* Workspace */}
        <div className="col-span-12 md:col-span-8 order-2 md:order-1">
          <div 
            className="w-full aspect-[4/3] bg-neutral-800 border border-neutral-700 flex items-center justify-center relative overflow-hidden cursor-pointer hover:bg-neutral-800/80 transition-colors"
            onClick={!image ? triggerUpload : undefined}
          >
             {image ? (
               <img src={image} alt="Work in progress" className="max-h-full max-w-full object-contain" />
             ) : (
                <div className="text-center group">
                  <div className="mb-4 text-6xl text-neutral-600 group-hover:text-neutral-400 transition-colors">+</div>
                  <span className="font-sans text-xs tracking-widest uppercase font-bold text-neutral-500 group-hover:text-white transition-colors">Load Negative (Upload Image)</span>
                </div>
             )}
             <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
             
             {loading && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-10 backdrop-blur-md">
                   <div className="w-12 h-12 border-2 border-neutral-600 border-t-white rounded-full animate-spin mb-4"></div>
                   <span className="font-sans text-xs tracking-widest uppercase font-bold text-white animate-pulse">Developing...</span>
                </div>
             )}
          </div>
          
          {image && (
             <div className="mt-4 flex justify-end">
               <button onClick={() => setImage(null)} className="text-[10px] font-sans font-bold uppercase text-neutral-500 hover:text-red-500">Discard Plate</button>
             </div>
          )}
        </div>

        {/* Tools */}
        <div className="col-span-12 md:col-span-4 order-1 md:order-2 space-y-8">
           <div>
             <span className="block text-[11px] font-sans font-bold tracking-widest uppercase mb-4 text-neutral-500">Directives</span>
             <p className="font-display text-2xl text-neutral-300 mb-6 leading-relaxed">
               Instruct the model to alter reality. Add objects, change lighting, or remove imperfections.
             </p>
             
             <div className="relative">
               <input 
                  type="text" 
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  placeholder="E.g., 'Add a vintage film grain', 'Remove the background'"
                  className="w-full bg-transparent border-b border-neutral-600 pb-4 pt-2 text-white placeholder-neutral-600 focus:outline-none focus:border-white transition-colors font-display text-xl"
               />
               <button 
                 onClick={handleEdit}
                 disabled={!image || !editPrompt || loading}
                 className="absolute right-0 bottom-4 text-accent hover:text-white disabled:opacity-0 transition-all font-sans text-xs font-bold uppercase"
               >
                 Execute
               </button>
             </div>
           </div>

           {error && (
             <div className="p-4 bg-red-900/20 border border-red-900 text-red-400 text-sm font-sans">
               {error}
             </div>
           )}

           <div className="pt-12 border-t border-neutral-800">
             <span className="block text-[11px] font-sans font-bold tracking-widest uppercase mb-4 text-neutral-500">Recent Instructions</span>
             <ul className="space-y-4">
               {['Make it black and white high contrast', 'Add a red lens flare', 'Change background to a studio seamless'].map((hint, i) => (
                 <li 
                   key={i} 
                   className="font-display text-lg text-neutral-500 hover:text-white cursor-pointer transition-colors"
                   onClick={() => setEditPrompt(hint)}
                 >
                   "{hint}"
                 </li>
               ))}
             </ul>
           </div>
        </div>
      </div>
    </section>
  );
};
