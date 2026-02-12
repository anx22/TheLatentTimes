
import React from 'react';
import { IssueContent } from '../types';
import { DebugScaffold } from './ui/Editorial';

interface TheEditProps {
  data: IssueContent['edit'];
  drops?: IssueContent['drops'];
}

export const TheEdit: React.FC<TheEditProps> = ({ data, drops }) => {
  // Prefer rich drops if available, otherwise fallback to legacy "edit" data
  const itemsToRender = drops && drops.length > 0 ? drops : data;

  if (!itemsToRender || itemsToRender.length === 0) {
      return <DebugScaffold label="THE EDIT" error="EMPTY_DATA_SET" />;
  }

  return (
    <section className="bg-neutral-50 border-t border-black pb-0">
      <div className="max-w-[1536px] mx-auto">
        
        {/* Section Header */}
        <div className="px-6 md:px-16 py-16 md:py-24 border-b border-black flex flex-col md:flex-row items-baseline gap-8">
           <h3 className="font-display font-bold text-6xl md:text-8xl leading-[0.8] uppercase tracking-tighter">
             The Edit
           </h3>
           <div className="flex-1 border-t-4 border-black mt-4 md:mt-0"></div>
           <p className="font-sans font-bold text-xs md:text-sm tracking-widest uppercase text-right min-w-[200px]">
             Raw. Unfiltered.<br/>
             <span className="text-accent">Synthetic Signals.</span>
           </p>
        </div>

        {/* Brutalist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-l border-neutral-200">
          {itemsToRender.map((item: any, idx) => {
             const isRich = 'body' in item;
             const title = isRich ? item.headline : item.title;
             const desc = isRich ? item.body : item.desc;
             const category = isRich ? item.label : item.category;

             return (
              <div 
                key={idx} 
                className="group relative flex flex-col justify-between min-h-[400px] border-r border-b border-black p-8 bg-white hover:bg-black hover:text-white transition-colors duration-300"
              >
                {/* Huge Number */}
                <div className="font-display text-8xl md:text-9xl leading-none opacity-10 group-hover:opacity-20 absolute top-4 right-4 transition-opacity">
                  0{idx+1}
                </div>

                {/* Top Info */}
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                     <span className="w-2 h-2 bg-accent rounded-full"></span>
                     <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em]">
                       {category}
                     </span>
                  </div>
                  <h4 className="font-display text-4xl leading-[0.95] uppercase tracking-tight mb-4 group-hover:translate-x-1 transition-transform">
                    {title}
                  </h4>
                </div>
                
                {/* Bottom Info */}
                <div className="relative z-10 mt-auto pt-6 border-t border-dashed border-neutral-300 group-hover:border-neutral-700">
                  <p className="font-sans text-sm font-medium leading-relaxed opacity-80 line-clamp-4">
                    {desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
