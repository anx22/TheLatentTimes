import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="max-w-[1440px] mx-auto px-6 md:px-16 py-20 mt-12 border-t border-black">
      <div className="text-center mb-16">
        <h2 className="font-display text-[15vw] md:text-[120px] leading-none tracking-tight font-bold">Modus</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-4">
          <span className="text-[11px] font-sans font-bold tracking-widest uppercase block mb-4">Masthead</span>
          <div className="font-display text-sm leading-relaxed">
            <strong>Anna V. Thorne</strong> Editor-in-Chief<br />
            <strong>Sarah Gupta</strong> Creative Director<br />
            <strong>Marcus Chen</strong> Fashion Director<br />
            <strong>R. Zero</strong> Technical Lead
          </div>
        </div>

        <div className="md:col-span-4 md:border-l border-gray-200 md:pl-8">
          <span className="text-[11px] font-sans font-bold tracking-widest uppercase block mb-4">Colophon</span>
          <div className="font-display text-sm leading-relaxed max-w-xs text-gray-600">
            Typeset in Didot and Helvetica Neue. Images generated via Midjourney V6.1 and Flux.1 Dev. Hosted on Vercel Edge.
          </div>
        </div>

        <div className="md:col-span-4 text-left md:text-right">
          <button className="text-[11px] font-sans font-bold tracking-widest uppercase border-b border-black pb-1 mb-4 hover:text-accent hover:border-accent transition-colors">
            Subscribe to the print edition
          </button>
          <div className="text-[11px] font-sans font-bold tracking-widest uppercase text-gray-400">
            © 2025 Modus Media.
          </div>
        </div>
      </div>
    </footer>
  );
};
