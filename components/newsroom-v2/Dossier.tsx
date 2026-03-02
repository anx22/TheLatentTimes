import React from 'react';
import { Hash } from 'lucide-react';

interface DossierProps {
  title: string;
  status: string;
  classification: string;
  children: React.ReactNode;
  meta?: React.ReactNode;
}

export const Dossier: React.FC<DossierProps> = ({ title, status, classification, children, meta }) => {
  return (
    <div className="w-full h-full flex flex-col bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden relative">
      {/* Digital Slate Header */}
      <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900/50 shrink-0 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-zinc-800 rounded flex items-center justify-center border border-zinc-700">
            <Hash className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <h1 className="font-mono font-bold text-lg text-white tracking-tight uppercase">{title}</h1>
            <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-zinc-500">
              <span className="text-emerald-500/50">ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
              <span>•</span>
              <span>{classification}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          {meta}
          <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded text-[10px] font-bold tracking-widest uppercase text-zinc-400">
            <div className={`w-1.5 h-1.5 rounded-full ${status === 'PUBLISHED' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
            {status}
          </div>
        </div>
      </div>

      {/* Digital Slate Body */}
      <div className="flex-1 relative overflow-hidden bg-zinc-950/50">
        {/* Grid Background Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-20" />
        
        {/* Content Scroll Area */}
        <div className="relative z-10 h-full overflow-y-auto custom-scrollbar">
          <div className="p-6 min-h-full">
            {children}
          </div>
        </div>
      </div>

      {/* Digital Slate Footer */}
      <div className="h-6 bg-zinc-900 border-t border-zinc-800 text-zinc-600 font-mono text-[10px] flex items-center justify-between px-6 shrink-0">
        <span className="flex items-center gap-2">
          <span className="w-1 h-1 bg-emerald-500 rounded-full" />
          SYSTEM ACTIVE
        </span>
        <span>ENCRYPTED // {new Date().getFullYear()}</span>
      </div>
    </div>
  );
};
