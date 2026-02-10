import React from 'react';

interface HeaderProps {
  onNavigate: (section: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  return (
    <header className="w-full bg-white border-b border-black py-8">
      <div className="max-w-[1536px] mx-auto px-6 md:px-16 flex justify-between items-center">
        {/* Left: Branding */}
        <div className="flex items-baseline gap-8">
          <h1 
            className="font-display font-bold uppercase leading-none cursor-pointer text-7xl tracking-tighter"
            onClick={() => onNavigate('home')}
          >
            Modus
          </h1>
          <div className="hidden md:flex flex-col gap-0 text-xs font-sans font-bold tracking-[0.25em] uppercase opacity-100">
            <span>Vol. 13</span>
            <span className="text-neutral-400">Sept '25</span>
          </div>
        </div>

        {/* Right: Nav */}
        <nav className="flex items-center gap-8 md:gap-12">
          <div className="hidden md:flex gap-8 opacity-100 font-sans text-xs font-bold tracking-[0.2em] uppercase">
            <span className="text-neutral-500 hover:text-black transition-colors cursor-pointer">The Synthetic Issue</span>
          </div>
          <button className="bg-black text-white hover:bg-accent transition-colors duration-300 font-sans font-bold uppercase tracking-[0.2em] px-6 py-3 text-xs">
            Subscribe
          </button>
        </nav>
      </div>
    </header>
  );
};