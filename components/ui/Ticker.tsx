
import React from 'react';

export const Ticker: React.FC<{ items?: string[] }> = ({ items }) => {
  const news = items && items.length > 0 ? items : [
    "SYSTEM IDLE",
    "AWAITING INPUT",
    "INITIALIZE REDAKTION",
    "NO SIGNAL DETECTED"
  ];

  return (
    <div className="bg-black text-white overflow-hidden py-3 border-b border-neutral-800">
      <div className="animate-marquee whitespace-nowrap flex gap-16 text-xs font-sans font-bold tracking-[0.25em] uppercase">
        {Array(4).fill(news).flat().map((item, i) => (
          <span key={i} className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></span>
            {item}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </div>
  );
};
