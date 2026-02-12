import React from 'react';

export const Backstage: React.FC = () => {
  return (
    <section className="max-w-[1440px] mx-auto px-6 md:px-16 py-20">
      <div className="border-b-2 border-black pb-4 mb-16 flex justify-between items-end">
        <h2 className="font-display text-5xl m-0">Backstage</h2>
        <span className="text-[11px] font-sans font-bold tracking-widest uppercase">The Tools of Creation</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Tool 1 */}
        <div className="flex gap-6 items-start md:border-r md:border-gray-200 md:pr-12">
          <div className="font-display text-6xl text-accent leading-none">01</div>
          <div>
            <h3 className="font-display text-3xl mb-4">ComfyUI 'Velvet'</h3>
            <p className="font-sans text-base text-muted-foreground mb-6 font-medium">
              A custom node pack for generating cloth physics that feel expensive.
            </p>
            <ul className="space-y-2">
              <li className="text-[11px] font-sans font-bold tracking-widest border-t border-gray-200 pt-2 uppercase">Input: Texture Maps</li>
              <li className="text-[11px] font-sans font-bold tracking-widest border-t border-gray-200 pt-2 uppercase">Output: 8K Raw</li>
              <li className="text-[11px] font-sans font-bold tracking-widest border-t border-gray-200 pt-2 uppercase">Status: Private Beta</li>
            </ul>
          </div>
        </div>

        {/* Tool 2 */}
        <div className="flex gap-6 items-start md:pl-6">
          <div className="font-display text-6xl text-accent leading-none">02</div>
          <div>
            <h3 className="font-display text-3xl mb-4">The Hook Factory</h3>
            <p className="font-sans text-base text-muted-foreground mb-6 font-medium">
              Automated social sequencing. Narrative arcs generated at scale.
            </p>
            <ul className="space-y-2">
              <li className="text-[11px] font-sans font-bold tracking-widest border-t border-gray-200 pt-2 uppercase">Input: Trend Data</li>
              <li className="text-[11px] font-sans font-bold tracking-widest border-t border-gray-200 pt-2 uppercase">Output: Viral Loops</li>
              <li className="text-[11px] font-sans font-bold tracking-widest border-t border-gray-200 pt-2 uppercase">Status: Deployed</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
