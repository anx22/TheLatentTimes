import React from 'react';

// --- SEARCH TYPEAHEAD ---
export const SearchTypeahead: React.FC<{
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  loading?: boolean;
}> = ({ value, onChange, placeholder = "Search index...", loading }) => (
  <div className="relative group">
    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-black rotate-45 group-focus-within:bg-accent transition-colors"></div>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-transparent border-b-2 border-black py-4 pl-6 pr-12 text-2xl md:text-3xl font-display focus:outline-none placeholder:text-neutral-300 placeholder:italic transition-all"
    />
    <div className="absolute right-0 top-1/2 -translate-y-1/2">
       {loading ? (
         <span className="block w-4 h-4 border-2 border-neutral-300 border-t-black rounded-full animate-spin"></span>
       ) : (
         <span className="font-sans text-[10px] font-bold tracking-widest uppercase text-neutral-400 group-hover:text-black">
           Index Spec
         </span>
       )}
    </div>
  </div>
);

// --- INDEX CHIPS ---
export const IndexFilter: React.FC<{ label: string; active?: boolean; onClick?: () => void }> = ({ label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`
      px-3 py-1 text-[10px] font-sans font-bold uppercase tracking-widest border transition-all
      ${active 
        ? 'bg-black text-white border-black' 
        : 'bg-white text-neutral-500 border-neutral-200 hover:border-black hover:text-black'}
    `}
  >
    {label}
  </button>
);

// --- PAGINATION FOLIO ---
export const PaginationFolio: React.FC<{ current: number; total: number }> = ({ current, total }) => (
  <div className="flex items-center gap-8 justify-center py-12 border-t border-neutral-200 mt-12">
    <button className="font-sans text-[10px] font-bold uppercase tracking-widest hover:text-accent disabled:opacity-20" disabled={current === 1}>Previous</button>
    <div className="font-display italic text-2xl">
      {current} <span className="text-neutral-300 text-lg mx-2">/</span> {total}
    </div>
    <button className="font-sans text-[10px] font-bold uppercase tracking-widest hover:text-accent disabled:opacity-20" disabled={current === total}>Next Folio</button>
  </div>
);
