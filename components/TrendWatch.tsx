import React, { useState } from 'react';
import { searchTrend } from '../services/gemini';
import { SearchResult } from '../types';
import { SearchTypeahead, IndexFilter } from './ui/Navigation';
import { Caption } from './ui/Editorial';

interface TrendWatchProps {
    onClose?: () => void;
}

export const TrendWatch: React.FC<TrendWatchProps> = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResult(null);
    try {
      const data = await searchTrend(query);
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center overflow-hidden p-0 md:p-8">
      <section className="w-full max-w-[1440px] h-full bg-white flex flex-col shadow-2xl relative animate-fade-in overflow-hidden md:rounded-lg">
        {/* Header */}
        <div className="flex justify-between items-center p-6 md:p-8 border-b border-black shrink-0 bg-neutral-50">
            <div>
               <span className="text-[10px] font-sans font-bold tracking-[0.3em] uppercase text-accent mb-2 block">The Oracle</span>
               <h2 className="font-display text-4xl md:text-5xl leading-none">Trend Watch</h2>
            </div>
            {onClose && (
                <button onClick={onClose} className="text-3xl hover:text-accent transition-colors">×</button>
            )}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-16">
            <div className="max-w-4xl mx-auto mb-16">
                <form onSubmit={handleSearch} className="mb-12">
                <SearchTypeahead 
                    value={query} 
                    onChange={setQuery} 
                    loading={loading}
                    placeholder="Query the zeitgeist..."
                />
                </form>

                <div className="flex justify-center gap-3 mb-16 flex-wrap">
                {['All', 'Fashion', 'Tech', 'Culture', 'Finance'].map(f => (
                    <IndexFilter 
                    key={f} 
                    label={f} 
                    active={activeFilter === f} 
                    onClick={() => setActiveFilter(f)} 
                    />
                ))}
                </div>
            </div>

            {result && (
                <div className="max-w-5xl mx-auto grid grid-cols-12 gap-12 animate-fade-in border-t border-black pt-12">
                <div className="col-span-12 md:col-span-8">
                    <h3 className="font-display text-4xl mb-8 italic">The Report</h3>
                    <div className="prose prose-lg font-display text-gray-800 leading-loose">
                    {result.text.split('\n').map((paragraph, i) => (
                        <p key={i} className="mb-6 first-letter:text-5xl first-letter:font-bold first-letter:mr-2 first-letter:float-left first-letter:leading-[0.8]">{paragraph}</p>
                    ))}
                    </div>
                    <div className="mt-12 flex gap-4">
                    <button className="px-6 py-3 border border-black hover:bg-black hover:text-white transition-colors font-sans text-[10px] font-bold uppercase tracking-widest">
                        Download PDF
                    </button>
                    <button className="px-6 py-3 border border-transparent hover:border-gray-300 text-gray-500 font-sans text-[10px] font-bold uppercase tracking-widest">
                        Share Snippet
                    </button>
                    </div>
                </div>
                
                <div className="col-span-12 md:col-span-4 border-l border-gray-100 pl-8 bg-gray-50/50 p-6">
                    <h4 className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] mb-8 text-neutral-400">Sources & Grounding</h4>
                    <ul className="space-y-6">
                    {result.groundingUrls.length > 0 ? (
                        result.groundingUrls.map((source, idx) => (
                        <li key={idx} className="group cursor-pointer">
                            <a href={source.url} target="_blank" rel="noopener noreferrer" className="block">
                            <div className="flex items-baseline gap-2 mb-1">
                                <span className="font-mono text-accent text-xs">0{idx+1}</span>
                                <div className="font-display text-lg leading-tight group-hover:underline decoration-1 underline-offset-4">{source.title}</div>
                            </div>
                            <div className="font-sans text-[10px] text-gray-400 uppercase tracking-wider pl-6">{new URL(source.url).hostname}</div>
                            </a>
                        </li>
                        ))
                    ) : (
                        <li className="text-sm text-gray-400 italic font-display">No external sources cited. Generated from latent knowledge.</li>
                    )}
                    </ul>
                    
                    <div className="mt-12 pt-8 border-t border-gray-200">
                    <Caption text="Data current as of:" credit={new Date().toLocaleDateString()} />
                    </div>
                </div>
                </div>
            )}
        </div>
      </section>
    </div>
  );
};