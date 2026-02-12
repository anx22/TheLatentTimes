import React from 'react';
import { Recipe } from '../../types';

// --- ATELIER RECIPE ---
export const AtelierRecipe: React.FC<{ 
  data: Recipe;
  className?: string 
}> = ({ data, className="" }) => (
  <div className={`bg-neutral-50 p-8 border border-neutral-200 ${className} flex flex-col`}>
    <h4 className="font-sans text-xs font-bold tracking-[0.2em] uppercase mb-6 border-b border-neutral-200 pb-3 truncate" title={data.title}>
      Recipe: {data.title}
    </h4>
    
    <div className="mb-8">
      <span className="block text-xs text-neutral-400 uppercase mb-3 font-bold tracking-wider">Intent</span>
      <p className="font-mono text-sm text-neutral-700 leading-relaxed bg-neutral-100 p-3 border-l-2 border-accent">
        {data.intent}
      </p>
    </div>

    <div className="grid grid-cols-1 gap-8 mb-8 flex-grow">
      <div>
        <span className="block text-xs text-neutral-400 uppercase mb-3 font-bold tracking-wider">Parameters</span>
        <ul className="space-y-2 font-mono text-xs text-neutral-600">
          {Object.entries(data.params).map(([k, v]) => (
            <li key={k} className="flex justify-between border-b border-neutral-200 border-dotted pb-1">
              <span className="font-semibold">{k}</span>
              <span className="text-black">{v}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
         <span className="block text-xs text-neutral-400 uppercase mb-3 font-bold tracking-wider">Workflow</span>
         <ol className="list-decimal list-inside font-mono text-xs text-neutral-600 space-y-2">
           {data.steps.map((step, i) => (
             <li key={i} className="pl-1">{step}</li>
           ))}
         </ol>
      </div>
    </div>

    <div className="mt-auto">
      <span className="block text-xs text-neutral-400 uppercase mb-3 font-bold tracking-wider">Ingredients</span>
      <div className="flex flex-wrap gap-2">
        {data.ingredients.map((ing, i) => (
          <span key={i} className="inline-block border border-neutral-200 bg-white px-2 py-1 text-xs font-medium text-neutral-800 uppercase tracking-wide">
            {ing}
          </span>
        ))}
      </div>
    </div>
    
    {data.warning && (
      <div className="mt-8 p-4 bg-red-50 border border-red-100 text-xs font-mono text-red-600">
        <span className="font-bold uppercase tracking-wide block mb-1">Failure Mode Warning</span> 
        {data.warning}
      </div>
    )}
  </div>
);

// --- PROMPT WARDROBE ---
interface Template {
  name: string;
  prompt: string;
  tags: string[];
}
export const PromptWardrobe: React.FC<{ 
  onSelect: (prompt: string) => void;
  className?: string;
}> = ({ onSelect, className="" }) => {
  const templates: Template[] = [
    { name: "Editorial High Key", prompt: "Fashion photography, high key lighting, minimal studio background, avant-garde styling, 8k resolution, shot on medium format", tags: ["Studio", "Clean"] },
    { name: "Neon Noir", prompt: "Cyberpunk street style, neon lighting, wet pavement, rainy night, cinematic bokeh, volumetric fog, highly detailed texture", tags: ["Dark", "Cinematic"] },
    { name: "Organic Surrealism", prompt: "Biomorphic fashion, fungal textures, growing from fabric, soft natural lighting, dreamlike atmosphere, pastel color palette", tags: ["Abstract", "Soft"] },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      <h4 className="font-sans text-xs font-bold tracking-[0.2em] uppercase mb-6">Prompt Wardrobe</h4>
      {templates.map((t, i) => (
        <div 
          key={i} 
          onClick={() => onSelect(t.prompt)}
          className="group border border-transparent hover:border-neutral-200 bg-white hover:shadow-md p-6 cursor-pointer transition-all duration-300"
        >
          <div className="flex justify-between items-center mb-3">
            <span className="font-display text-xl group-hover:text-accent transition-colors">{t.name}</span>
            <span className="text-xs font-mono text-neutral-400 group-hover:text-black">0{i+1}</span>
          </div>
          <p className="text-sm text-neutral-500 line-clamp-2 mb-4 font-medium leading-relaxed">{t.prompt}</p>
          <div className="flex gap-2">
            {t.tags.map(tag => (
              <span key={tag} className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 bg-neutral-50 px-2 py-1 rounded-sm border border-neutral-100">
                {tag}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
