import React, { useContext, useState } from 'react';
import { MessageSquare, Loader2, Sparkles, AlertTriangle, Layers, Edit3, ChevronRight, PenTool, CheckCircle, Wand2, X, RefreshCw } from 'lucide-react';
import { NewsroomContext } from '../../contexts/NewsroomContext';

export const TheBullpen: React.FC = () => {
  const context = useContext(NewsroomContext);
  const [selectedAngleId, setSelectedAngleId] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<{ blockId: string, sentenceId?: string } | null>(null);
  const [customInstruction, setCustomInstruction] = useState('');

  if (!context) return null;

  const { 
    topic, 
    runDebate, 
    isDebating, 
    debateTranscript, 
    angles, 
    runPipeline, 
    isDrafting, 
    draft, 
    annotations, 
    rewriteBlock,
    isRewriting,
    reDraft,
    setStep,
    runFinalPolish,
    isPolishing
  } = context;

  const handleStartDebate = () => {
    runDebate();
  };

  const selectedAngle = angles.find(a => a.id === selectedAngleId);

  const handleEntitySelect = (blockId: string, sentenceId?: string) => {
    setSelectedEntity({ blockId, sentenceId });
    setCustomInstruction('');
  };

  const handleRewrite = (instruction: string) => {
    if (!selectedEntity) return;
    rewriteBlock(selectedEntity.blockId, instruction, selectedEntity.sentenceId);
  };

  const selectedAnnotation = selectedEntity ? annotations.find(a => 
    a.blockId === selectedEntity.blockId && 
    (selectedEntity.sentenceId ? a.sentenceId === selectedEntity.sentenceId : !a.sentenceId)
  ) : null;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#0a0a0a]">
      {/* Editorial Header */}
      <div className="h-16 border-b border-zinc-800 flex items-center px-6 gap-6 bg-black/40 shrink-0">
        <div className="flex-1 overflow-hidden">
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 truncate">Current Workspace</div>
            <h2 className="text-sm font-bold text-emerald-400 font-mono truncate uppercase tracking-widest">{topic || 'No Topic Selected'}</h2>
        </div>
        
        <div className="flex gap-3">
          {draft && (
            <button 
              onClick={runFinalPolish}
              disabled={isPolishing}
              className="flex items-center gap-2 border border-emerald-500/30 px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500/10 transition-colors disabled:opacity-50 text-emerald-400"
            >
              {isPolishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
              Final Polish
            </button>
          )}

          <button 
            onClick={reDraft}
            disabled={isDrafting || !topic}
            className="flex items-center gap-2 border border-zinc-800 px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-900 transition-colors disabled:opacity-50"
          >
            {isDrafting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Refresh Draft
          </button>

          <button 
            onClick={handleStartDebate}
            disabled={isDebating || !topic}
            className="flex items-center gap-2 border border-zinc-800 px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-900 transition-colors disabled:opacity-50"
          >
            {isDebating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageSquare className="w-3.5 h-3.5" />}
            Convene Board
          </button>
          
          <button 
            onClick={() => runPipeline(selectedAngle || undefined)}
            disabled={isDrafting || (!selectedAngle && angles.length > 0) || !topic}
            className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500 transition-colors disabled:bg-zinc-800 disabled:text-zinc-500"
          >
            {isDrafting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            Execute
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Debate & Angles */}
        <div className="w-1/3 flex flex-col border-r border-zinc-800">
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Debate Transcript */}
            {debateTranscript.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4">
                  <MessageSquare className="w-3 h-3" />
                  Editorial Friction
                </div>
                {debateTranscript.map((msg, i) => (
                  <div key={i} className="space-y-2 group animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="text-[9px] font-mono font-bold uppercase tracking-widest text-emerald-500/70">{msg.persona}</div>
                    <div className="text-xs leading-relaxed text-zinc-400 font-serif italic border-l border-zinc-800 pl-4 py-1">
                      {msg.message}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Generated Angles */}
            {angles.length > 0 && (
              <div className="space-y-6 pt-4">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4">
                  <Layers className="w-3 h-3" />
                  Editorial Angles
                </div>
                <div className="space-y-3">
                  {angles.map((angle) => (
                    <button
                      key={angle.id}
                      onClick={() => setSelectedAngleId(angle.id)}
                      className={`w-full text-left p-4 rounded-sm border transition-all ${
                        selectedAngleId === angle.id 
                        ? 'bg-emerald-500/5 border-emerald-500/50' 
                        : 'bg-zinc-900/20 border-zinc-900 hover:border-zinc-700'
                      }`}
                    >
                      <div className="text-[8px] font-mono uppercase tracking-widest text-zinc-500 mb-1">{angle.persona}</div>
                      <h4 className="text-[11px] font-bold text-zinc-200 mb-2 leading-tight uppercase tracking-wide">{angle.headline}</h4>
                      <p className="text-[10px] text-zinc-500 leading-tight font-serif italic line-clamp-2">{angle.angle}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {debateTranscript.length === 0 && !isDebating && (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-zinc-700 space-y-4">
                <div className="p-4 rounded-full border border-dashed border-zinc-800">
                  <MessageSquare className="w-8 h-8 opacity-20" />
                </div>
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] leading-relaxed">Editorial board must be convened to establish narrative parameters</p>
              </div>
            )}
          </div>
        </div>

        {/* Center/Right: Drafting & Micro-actions */}
        <div className="flex-1 flex flex-col bg-black/20 overflow-hidden">
          {isDrafting ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
               <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-6" />
               <h3 className="font-mono text-xs uppercase tracking-[0.4em] text-emerald-400 mb-2">Columnist Working</h3>
               <p className="text-[10px] text-zinc-500 font-mono max-w-xs uppercase tracking-widest">Synthesizing draft from selected editorial vector...</p>
            </div>
          ) : draft ? (
            <div className="flex-1 flex overflow-hidden">
               {/* Actual Content Editor */}
               <div className="flex-1 overflow-y-auto p-12 space-y-12">
                  <header className="max-w-2xl mx-auto space-y-6">
                    <div className="flex gap-2">
                       {draft.tags?.map(t => (
                         <span key={t} className="text-[9px] font-mono uppercase border border-zinc-800 px-2 py-0.5 rounded text-zinc-400">{t}</span>
                       ))}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-black leading-none tracking-tighter uppercase">{draft.headline}</h1>
                    <p className="text-lg font-serif italic text-zinc-400 border-l-2 border-emerald-500/50 pl-6 py-2 leading-relaxed">{draft.deck}</p>
                  </header>

                  <div className="max-w-2xl mx-auto space-y-10 pb-32">
                    {draft.blocks.map((block) => {
                       const annotation = annotations.find(a => a.blockId === block.id);
                       return (
                          <div 
                            key={block.id} 
                            className={`group relative p-6 -mx-6 transition-all border border-transparent cursor-pointer ${
                              selectedEntity?.blockId === block.id && !selectedEntity.sentenceId 
                                ? 'bg-emerald-500/5 border-emerald-500/20' 
                                : annotation ? 'bg-amber-950/5 border-amber-900/30' : 'hover:bg-zinc-900/10'
                            }`}
                            onClick={() => handleEntitySelect(block.id)}
                          >
                            {/* Micro-Actions Menu */}
                            <div className="absolute right-4 top-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button 
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    handleRewrite("Make this more evocative and tech-forward");
                                 }}
                                 className="bg-zinc-800 p-1.5 rounded hover:bg-zinc-700 transition-colors"
                                 title="Micro-Rewrite Paragraph"
                               >
                                 <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                               </button>
                            </div>

                            <div className="font-serif text-lg leading-relaxed text-zinc-200">
                              {block.sentences.map(s => (
                                <span 
                                 key={s.id} 
                                 className={`inline-block mr-1 transition-all cursor-pointer rounded-sm px-0.5 -mx-0.5 ${
                                   selectedEntity?.sentenceId === s.id 
                                     ? 'bg-emerald-500/30 ring-1 ring-emerald-500/50 text-white' 
                                     : annotation?.sentenceId === s.id 
                                       ? 'bg-amber-400/10 border-b border-amber-500/50 hover:bg-amber-400/20' 
                                       : 'hover:bg-emerald-500/20'
                                 }`}
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleEntitySelect(block.id, s.id);
                                 }}
                               >
                                 {s.text}
                                </span>
                              ))}
                            </div>

                           {/* Annotation Box */}
                           {annotation && (
                             <div className="mt-4 flex gap-3 bg-amber-500/5 border border-amber-500/10 p-3 rounded-sm">
                                <div className="shrink-0 pt-0.5">
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                </div>
                                <div>
                                   <div className="text-[9px] font-mono uppercase tracking-widest text-amber-500 font-bold mb-1">
                                     Editor Critique: {annotation.persona || 'Editorial'} - {annotation.type}
                                   </div>
                                   <p className="text-[10px] text-amber-500/80 font-mono italic leading-relaxed">
                                     {annotation.comment}
                                   </p>
                                   {annotation.suggestion && (
                                     <button 
                                       onClick={() => rewriteBlock(block.id, annotation.suggestion || "")}
                                       className="mt-2 text-[9px] font-mono text-white bg-amber-600 px-2 py-1 uppercase tracking-widest hover:bg-amber-500 transition-colors"
                                     >
                                       Apply Fix
                                     </button>
                                   )}
                                </div>
                             </div>
                           )}

                           {isRewriting === block.id && (
                             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                                <div className="flex items-center gap-3">
                                   <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                                   <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">Surgical Rewrite in Progress...</span>
                                </div>
                             </div>
                           )}
                         </div>
                       );
                    })}
                  </div>
               </div>

               {/* Editorial Desk Sidebar */}
               <div className="w-80 border-l border-zinc-800 bg-[#0c0c0c] flex flex-col shrink-0 animate-in slide-in-from-right duration-300">
                  <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-zinc-100">
                      <Edit3 className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold">Editorial Desk</span>
                    </div>
                    {selectedEntity && (
                      <button onClick={() => setSelectedEntity(null)}>
                        <X className="w-3.5 h-3.5 text-zinc-500 hover:text-white" />
                      </button>
                    )}
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-5 space-y-8">
                    {selectedEntity ? (
                      <div className="space-y-6">
                        <div className="space-y-2">
                           <div className="text-[9px] font-mono uppercase text-emerald-500 tracking-widest font-bold">Selection</div>
                           <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-sm text-[11px] text-zinc-300 leading-relaxed font-serif italic">
                              {selectedEntity.sentenceId 
                                ? draft.blocks.find(b => b.id === selectedEntity.blockId)?.sentences.find(s => s.id === selectedEntity.sentenceId)?.text
                                : "Entire Paragraph Selected"}
                           </div>
                        </div>

                        {selectedAnnotation && (
                          <div className="space-y-3 bg-amber-500/5 border border-amber-500/20 p-4 rounded-sm">
                             <div className="flex items-center gap-2 text-amber-500">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span className="text-[9px] font-mono uppercase tracking-widest font-bold">Criticism by {selectedAnnotation.persona}</span>
                             </div>
                             <p className="text-[11px] text-amber-500/80 leading-relaxed font-mono">
                                {selectedAnnotation.comment}
                             </p>
                             <button 
                               onClick={() => handleRewrite(selectedAnnotation.suggestion || "Fix it")}
                               disabled={!!isRewriting}
                               className="w-full bg-amber-600 hover:bg-amber-500 text-white py-2 text-[9px] font-mono uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                             >
                                {isRewriting === selectedEntity.blockId ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                                Apply Suggestion
                             </button>
                          </div>
                        )}

                        <div className="space-y-3 pt-2">
                          <label className="text-[9px] font-mono uppercase text-zinc-500 tracking-widest">Surgical Instruction</label>
                          <textarea 
                             value={customInstruction}
                             onChange={(e) => setCustomInstruction(e.target.value)}
                             placeholder="e.g. 'Make this more punchy', 'Add technical depth'..."
                             className="w-full h-24 bg-zinc-900 border border-zinc-800 p-3 text-[11px] text-zinc-300 focus:outline-none focus:border-emerald-500/50 resize-none font-mono"
                          />
                          <button 
                            onClick={() => handleRewrite(customInstruction)}
                            disabled={!customInstruction.trim() || !!isRewriting}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 text-[9px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:bg-zinc-800"
                          >
                             {isRewriting === selectedEntity.blockId ? <Loader2 className="w-3 h-3 animate-spin" /> : <Edit3 className="w-3 h-3" />}
                             Execute Rewrite
                          </button>
                        </div>

                        <div className="pt-4 border-t border-zinc-900 grid grid-cols-2 gap-2">
                           <button 
                             onClick={() => handleRewrite("Make it more sophisticated")}
                             className="p-2 border border-zinc-800 text-[8px] font-mono uppercase text-zinc-500 hover:bg-zinc-900 transition-colors"
                           >
                             Sophisticate
                           </button>
                           <button 
                             onClick={() => handleRewrite("Simplify for clarity")}
                             className="p-2 border border-zinc-800 text-[8px] font-mono uppercase text-zinc-500 hover:bg-zinc-900 transition-colors"
                           >
                             Simplify
                           </button>
                           <button 
                             onClick={() => handleRewrite("Add technical jargon")}
                             className="p-2 border border-zinc-800 text-[8px] font-mono uppercase text-zinc-500 hover:bg-zinc-900 transition-colors"
                           >
                             Technify
                           </button>
                           <button 
                             onClick={() => handleRewrite("Make it more provocative")}
                             className="p-2 border border-zinc-800 text-[8px] font-mono uppercase text-zinc-500 hover:bg-zinc-900 transition-colors"
                           >
                             Provoke
                           </button>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30 px-6">
                        <Edit3 className="w-8 h-8" />
                        <p className="text-[10px] font-mono uppercase tracking-[0.2em] leading-relaxed">Select a sentence or block to begin surgical editing</p>
                      </div>
                    )}
                  </div>

                  {/* Metadata Footer */}
                  <div className="p-5 border-t border-zinc-800 bg-black/40 space-y-4">
                     <div className="space-y-2">
                        <label className="text-[8px] font-mono uppercase text-zinc-600 tracking-widest">Metadata</label>
                        <div className="flex flex-wrap gap-1.5">
                           {draft.tags?.map(t => (
                             <span key={t} className="text-[8px] font-mono bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 text-zinc-400">{t}</span>
                           ))}
                        </div>
                     </div>
                     <button 
                        onClick={() => setStep('DARKROOM')}
                        className="w-full flex items-center justify-between bg-zinc-100 text-black px-4 py-3 rounded-sm hover:bg-white transition-all group"
                      >
                         <span className="text-[10px] font-bold uppercase tracking-widest">Enter Darkroom</span>
                         <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                  </div>
               </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center text-zinc-800 bg-[#0a0a0a]">
                <PenTool className="w-12 h-12 mb-6 opacity-10" />
                <h3 className="font-mono text-xs uppercase tracking-[0.4em] mb-2">Columnist Standby</h3>
                <p className="text-[10px] max-w-xs uppercase tracking-[0.2em] leading-relaxed">Drafting module locked until board consensus is reached</p>
                
                {!isDebating && topic && debateTranscript.length === 0 && (
                   <button 
                    onClick={handleStartDebate}
                    className="mt-8 border border-zinc-800 px-8 py-3 text-[10px] font-mono uppercase tracking-widest hover:border-zinc-600 transition-all text-zinc-500 hover:text-white"
                   >
                     Initialize Debate Loop
                   </button>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
