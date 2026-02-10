import React, { useState } from 'react';
import { generateImage } from '../services/gemini';
import { AspectRatio } from '../types';
import { AtelierRecipe, PromptWardrobe } from './ui/Tools';

// Since this is a specialized component, we will provide a default recipe if none exists
const DEFAULT_RECIPE = {
  title: "Standard Diffusion",
  intent: "Basic generation",
  ingredients: ["Cinematic", "Volumetric Fog"],
  params: { "Steps": "50", "Sampler": "Euler A" },
  steps: ["Init", "Denoise"],
  warning: "None"
};

export const TheAtelier: React.FC<{ recipe?: any }> = ({ recipe = DEFAULT_RECIPE }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('3:4');
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    
    if (window.aistudio && !await window.aistudio.hasSelectedApiKey()) {
        try {
           await window.aistudio.openSelectKey();
        } catch(e) {
           setError("API Key selection failed.");
           return;
        }
    }

    setLoading(true);
    setError(null);
    try {
      const result = await generateImage(prompt, aspectRatio);
      setGeneratedImage(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-[1440px] mx-auto px-6 md:px-16 py-32 bg-neutral-50 min-h-screen">
      <div className="mb-12 border-b border-black pb-4 flex justify-between items-end">
        <div>
          <h2 className="font-display text-5xl mb-2">The Atelier</h2>
          <p className="font-sans text-xs text-muted-foreground uppercase tracking-[0.2em] font-bold">Generative Studio • Gemini 3 Pro</p>
        </div>
        <div className="hidden md:block text-[10px] font-sans font-bold tracking-widest">
           SERVER: <span className="text-accent">US-CENTRAL1</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-12">
        {/* Sidebar Controls */}
        <div className="col-span-12 md:col-span-3 space-y-10">
          <div>
            <label className="block text-[10px] font-sans font-bold tracking-[0.2em] uppercase mb-4">Canvas Ratio</label>
            <div className="grid grid-cols-3 gap-2">
              {(['1:1', '3:4', '4:3', '9:16', '16:9'] as AspectRatio[]).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`py-3 px-1 border text-[10px] font-sans font-bold transition-all ${
                    aspectRatio === ratio 
                      ? 'bg-black text-white border-black shadow-lg' 
                      : 'bg-white text-black border-gray-200 hover:border-black'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>
          
          <PromptWardrobe onSelect={(p) => setPrompt(p)} />
        </div>

        {/* Main Work Area */}
        <div className="col-span-12 md:col-span-6 flex flex-col gap-8">
           <div className="relative">
             <label className="block text-[10px] font-sans font-bold tracking-[0.2em] uppercase mb-3 flex justify-between">
                <span>Vision Prompt</span>
                <span className="text-gray-400">{prompt.length} chars</span>
             </label>
             <textarea
               className="w-full p-6 bg-white border border-gray-200 focus:border-black focus:outline-none min-h-[160px] font-display text-xl leading-relaxed resize-none shadow-sm transition-shadow focus:shadow-md"
               placeholder="Describe the aesthetic, subject, lighting, and mood..."
               value={prompt}
               onChange={(e) => setPrompt(e.target.value)}
             />
             <button
                onClick={handleGenerate}
                disabled={loading || !prompt}
                className="absolute bottom-4 right-4 bg-accent text-white px-6 py-2 font-sans text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? 'Fabricating...' : 'Commission'}
              </button>
           </div>

           {error && (
            <div className="p-4 bg-red-50 border-l-2 border-red-500 text-red-600 text-xs font-mono">
              ERROR: {error}
            </div>
           )}

           <div className="bg-white border border-gray-200 min-h-[500px] flex items-center justify-center relative overflow-hidden shadow-inner group">
             {generatedImage ? (
               <img src={generatedImage} alt="Generated result" className="max-h-full max-w-full object-contain shadow-2xl" />
             ) : (
               <div className="text-center text-gray-300 select-none">
                 <span className="block font-display text-7xl opacity-10 mb-4 italic">Tabula Rasa</span>
                 <span className="font-sans text-[10px] tracking-[0.3em] uppercase opacity-40">Ready for Input</span>
               </div>
             )}
             
             {loading && (
                <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
                   <div className="w-12 h-12 border-2 border-gray-200 border-t-accent rounded-full animate-spin mb-4"></div>
                   <span className="font-sans text-[10px] tracking-[0.3em] uppercase font-bold animate-pulse text-gray-500">Diffusion in progress...</span>
                </div>
             )}
           </div>
        </div>

        {/* Right Sidebar: Details */}
        <div className="col-span-12 md:col-span-3">
           <AtelierRecipe data={recipe} />
           
           <div className="mt-8 p-6 bg-black text-white">
             <h5 className="font-sans text-[10px] font-bold tracking-[0.2em] uppercase mb-4 text-gray-400">Pro Tip</h5>
             <p className="font-display text-sm leading-relaxed text-gray-300">
               Use "cinematic lighting" and "volumetric fog" to increase depth. Avoid negative prompts in V3 models; focus on what you want to see.
             </p>
           </div>
        </div>
      </div>
    </section>
  );
};
