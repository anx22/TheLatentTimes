
import React, { useState } from 'react';
import { SignalDossier, SignalClaim, RetrievalItem } from '../types';

interface DossierProps {
  dossier: SignalDossier;
}

const SourceItem: React.FC<{ item: RetrievalItem; index: number }> = ({ item, index }) => (
  <div className="p-3 border-b border-neutral-800 hover:bg-neutral-900 transition-colors group">
    <div className="flex justify-between items-start mb-1">
      <span className="text-[9px] font-mono text-neutral-500 group-hover:text-accent">
        SRC:{index}
      </span>
      <span className="text-[9px] uppercase tracking-wider text-neutral-600 truncate max-w-[120px]">
        {item.source_domain}
      </span>
    </div>
    <div className="font-bold text-xs text-neutral-300 leading-tight mb-2 line-clamp-2">
      {item.title}
    </div>
  </div>
);

const ClaimItem: React.FC<{ 
  claim: SignalClaim; 
  isSelected: boolean; 
  onClick: () => void; 
}> = ({ claim, isSelected, onClick }) => {
  const statusColors: Record<string, string> = {
    'VERIFIED': 'text-emerald-500 border-emerald-900/30 bg-emerald-950/10',
    'DISPUTED': 'text-red-500 border-red-900/30 bg-red-950/10',
    'SPECULATIVE': 'text-amber-500 border-amber-900/30 bg-amber-950/10',
  };

  return (
    <div 
      onClick={onClick}
      className={`p-3 border-b border-neutral-800 cursor-pointer transition-all ${isSelected ? 'bg-neutral-800 border-l-2 border-l-accent' : 'hover:bg-neutral-900 border-l-2 border-l-transparent'}`}
    >
      <div className="flex justify-between items-start mb-1">
        <span className={`text-[9px] font-bold px-1.5 py-px rounded border ${statusColors[claim.status] || 'text-neutral-500'}`}>
          {claim.status}
        </span>
        <span className="text-[9px] font-mono text-neutral-600">
          {claim.confidence}%
        </span>
      </div>
      <p className={`text-xs leading-relaxed line-clamp-3 ${isSelected ? 'text-white' : 'text-neutral-400'}`}>
        {claim.text}
      </p>
    </div>
  );
};

export const TheDossier: React.FC<DossierProps> = ({ dossier }) => {
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  
  const selectedClaim = dossier.claims?.find(c => c.id === selectedClaimId);

  return (
    <div className="flex h-full bg-[#080808] text-white font-sans overflow-hidden">
      
      {/* PANE 1: SOURCE SNAPSHOTS (Fixed Width) */}
      <div className="w-64 flex flex-col border-r border-neutral-800 shrink-0 bg-[#0A0A0A]">
        <div className="p-3 border-b border-neutral-800 bg-neutral-900/50">
          <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            Sources ({dossier.retrieval_snapshot?.items.length})
          </span>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
           {dossier.retrieval_snapshot?.items.map((item, idx) => (
             <SourceItem key={idx} item={item} index={idx} />
           ))}
        </div>
      </div>

      {/* PANE 2: CLAIM MAP (Flexible) */}
      <div className="flex-1 flex flex-col border-r border-neutral-800 min-w-[250px]">
        <div className="p-3 border-b border-neutral-800 bg-neutral-900/30">
          <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">
             Extracted Claims ({dossier.claims?.length || 0})
          </span>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
           {(dossier.claims || []).map((claim) => (
             <ClaimItem 
               key={claim.id} 
               claim={claim} 
               isSelected={selectedClaimId === claim.id}
               onClick={() => setSelectedClaimId(claim.id)} 
             />
           ))}
        </div>
      </div>

      {/* PANE 3: INSPECTOR (Fixed Width) */}
      <div className="w-80 flex flex-col bg-[#050505] shrink-0">
        <div className="p-3 border-b border-neutral-800 bg-black/20">
          <span className="text-[9px] font-bold uppercase tracking-widest text-accent">
             Evidence Verification
          </span>
        </div>
        
        {selectedClaim ? (
            <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
                <div className="mb-6">
                    <span className="block text-[9px] uppercase tracking-widest text-neutral-600 mb-2 font-bold">Claim</span>
                    <h3 className="text-sm font-bold text-white leading-relaxed mb-2">{selectedClaim.text}</h3>
                    {selectedClaim.explanation && (
                        <p className="text-xs text-neutral-400 italic mt-2 border-l-2 border-neutral-800 pl-3">
                            "{selectedClaim.explanation}"
                        </p>
                    )}
                </div>

                <div className="mb-6">
                    <span className="block text-[9px] uppercase tracking-widest text-neutral-600 mb-2 font-bold">Primary Evidence</span>
                    <div className="bg-neutral-900/50 border border-neutral-800 p-3 rounded font-mono text-[10px] text-accent leading-relaxed">
                        {selectedClaim.evidence_snippet ? `"${selectedClaim.evidence_snippet}"` : <span className="text-neutral-600 italic">No direct quote extracted.</span>}
                    </div>
                </div>

                <div>
                    <span className="block text-[9px] uppercase tracking-widest text-neutral-600 mb-2 font-bold">Supporting Sources</span>
                    <div className="space-y-2">
                        {selectedClaim.supporting_sources.map(srcIdx => {
                            const source = dossier.retrieval_snapshot?.items[srcIdx];
                            if (!source) return null;
                            return (
                                <div key={srcIdx} className="bg-neutral-900 p-2 rounded border border-neutral-800 hover:border-neutral-700 transition-colors">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-[9px] font-bold text-neutral-400">SRC:{srcIdx}</span>
                                        <a href={source.url} target="_blank" rel="noopener" className="text-[9px] text-neutral-600 hover:text-white underline">OPEN ↗</a>
                                    </div>
                                    <div className="text-[10px] text-neutral-300 line-clamp-1">
                                        {source.title}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center opacity-30 select-none p-8 text-center">
                <div className="w-8 h-8 border border-dashed border-neutral-600 rounded-full flex items-center justify-center mb-3 text-neutral-500 font-mono text-xs">?</div>
                <span className="text-[9px] uppercase tracking-widest text-neutral-500">Select a claim to inspect evidence</span>
            </div>
        )}
      </div>

    </div>
  );
};
