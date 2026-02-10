
import React from 'react';
import { IssueContent } from '../types';

interface TheEditProps {
  data: IssueContent['edit'];
  drops?: IssueContent['drops'];
}

export const TheEdit: React.FC<TheEditProps> = ({ data, drops }) => {
  // Prefer rich drops if available, otherwise fallback to legacy "edit" data
  const itemsToRender = drops && drops.length > 0 ? drops : data;

  if (!itemsToRender || itemsToRender.length === 0) return null;

  return (
    <section className="max-w-[1536px] mx-auto px-6 md:px-16 py-32 border-t border-black bg-white">
      {/* Header */}
      <div className="grid grid-cols-12 gap-12 items-baseline mb-24">
        <div className="col-span-12 md:col-span-3 border-t-4 border-black pt-6">
          <h3 className="font-display text-6xl md:text-7xl tracking-tight">The Edit</h3>
          <span className="block mt-4 text-[10px] font-sans font-bold tracking-[0.25em] uppercase text-neutral-400">
             Signals & Artifacts
          </span>
        </div>
        <div className="col-span-12 md:col-span-9">
          <p className="font-display text-4xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight indent-12 md:indent-24 text-balance">
            We are entering the <span className="italic text-accent font-serif pr-2">Golden Age</span> of synthetic media. Not as a tool, but as a raw material.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-black border-l border-neutral-200">
        {itemsToRender.map((item: any, idx) => {
           // Handle both Legacy and DropArtifact shapes
           const isRich = 'body' in item;
           const title = isRich ? item.headline : item.title;
           const desc = isRich ? item.body : item.desc;
           const category = isRich ? item.label : item.category;

           return (
            <div 
              key={idx} 
              className="group cursor-pointer flex flex-col justify-between h-full min-h-[450px] border-r border-b border-neutral-200 hover:border-black p-8 hover:bg-neutral-50 transition-all duration-300 relative overflow-hidden"
            >
              {/* Hover Number */}
              <span className="absolute -right-4 -top-8 text-[120px] font-display text-neutral-100 group-hover:text-neutral-200 transition-colors pointer-events-none select-none">
                0{idx+1}
              </span>

              {/* Content Top */}
              <div className="relative z-10">
                <span className={`inline-block px-3 py-1 mb-6 text-[10px] font-sans font-bold uppercase tracking-[0.2em] border transition-colors ${category === 'Opinion' ? 'bg-accent text-white border-accent' : 'bg-white text-black border-black group-hover:bg-black group-hover:text-white'}`}>
                  {category}
                </span>
                <h4 className="font-display text-3xl leading-[1.05] mb-6 group-hover:translate-x-1 transition-transform duration-500 text-balance">
                  {title}
                </h4>
              </div>
              
              {/* Content Bottom */}
              <div className="relative z-10 pt-8 border-t border-neutral-200 group-hover:border-black/20 transition-colors mt-auto">
                <p className="font-sans text-sm leading-relaxed text-neutral-500 font-medium group-hover:text-black transition-colors line-clamp-6">
                  {desc}
                </p>
                
                {isRich && item.footer_context && (
                   <span className="block mt-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400 group-hover:text-accent transition-colors">
                     {item.footer_context}
                   </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
