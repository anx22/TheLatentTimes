import React, { useContext, useState } from 'react';
import { Printer, CheckCircle, XCircle, ChevronDown, ChevronUp, AlertCircle, FileText, Check, Trash2, Clock, Sparkles } from 'lucide-react';
import { NewsroomContext } from '../../../contexts/NewsroomContext';
import { NewsroomButton, NewsroomLabel, NewsroomPanel } from '../NewsroomUI';
import { cn } from '../../../lib/utils';

export const PrintingPress: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const context = useContext(NewsroomContext);
  const [expandedDraftId, setExpandedDraftId] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState<string | null>(null);
  const [isRejecting, setIsRejecting] = useState<string | null>(null);

  if (!context) return null;

  const { drafts, mutations, logMessage } = context;

  // Filter drafts to show those that need editorial review
  const pendingDrafts = (drafts || []).filter(d => (d as any).status !== 'published');
  const publishedDrafts = (drafts || []).filter(d => (d as any).status === 'published');

  const handleApprove = async (draft: any) => {
    setIsApproving(draft._id);
    try {
      // High-fidelity curated visual assets for a sleek "Wired meets Vogue" aesthetic
      const fallbackImages = [
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80", // Slate abstract
        "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80", // Tech cyber neon
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80", // Tech circuitry
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80"  // Fiber optic network
      ];
      const imgIdx = Math.abs(draft._id.charCodeAt(0) + draft._id.charCodeAt(1)) % fallbackImages.length;
      const imgUrl = fallbackImages[imgIdx];

      const blocksToInclude = draft.blocks && draft.blocks.length > 0 ? draft.blocks : [
        {
          id: "b1",
          type: "text",
          sentences: [{ id: "b1-s1", text: draft.body }]
        }
      ];

      // Prepare standard Magazine item
      const newItem = {
        id: draft._id,
        title: draft.headline,
        dek: draft.deck,
        published_at: new Date().toISOString(),
        tags: draft.tags || ["Autonomous"],
        media_type: 'image',
        hero_image_url: imgUrl,
        status: 'published',
        featured_level: 'none',
        score: { final: 9, recency: 10, trust: 9, novelty: 8, visual_fit: 9 },
        body: draft.body,
        blocks: blocksToInclude,
        public_comments: [
          { commenter: "The Board", comment: "Editorial consensus achieved. Quality benchmark met.", level: "success" },
          { commenter: "The Editor", comment: "Draft successfully committed under independent sign-off.", level: "info" }
        ]
      };

      // Push into database issues table
      if (mutations.addItemToLatestIssue) {
        await mutations.addItemToLatestIssue({ item: newItem });
      }

      // Update source draft document status to published
      if (mutations.updateDraftStatus) {
        await mutations.updateDraftStatus({ id: draft._id, status: 'published' });
      }

      await logMessage(
        'THE PUBLISHER',
        `APPROVED & DISPATCHED: "${draft.headline.slice(0, 45)}..." is now live on the cover grid!`,
        'success'
      );
    } catch (err: any) {
      console.error(err);
      context.setError(err.message || "Failed to approve draft.");
    } finally {
      setIsApproving(null);
    }
  };

  const handleReject = async (draftId: string, headline: string) => {
    setIsRejecting(draftId);
    try {
      if (mutations.deleteDraft) {
        await mutations.deleteDraft({ id: draftId as any });
      }
      await logMessage(
        'THE PUBLISHER',
        `DE-STRUCK: Draft "${headline.slice(0, 40)}..." has been rejected and permanently recycled.`,
        'warning'
      );
    } catch (err: any) {
      console.error(err);
      context.setError(err.message || "Failed to reject draft.");
    } finally {
      setIsRejecting(null);
    }
  };

  return (
    <div className="flex-1 bg-zinc-950 p-6 overflow-y-auto flex flex-col h-full font-sans selection:bg-[#ccff00] selection:text-black">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 shrink-0 pb-4 border-b border-zinc-900">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-mono font-bold text-white uppercase tracking-widest">Publishing Room</h1>
            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-1">Live Editorial Grid Registry & Sign-off Channel</p>
          </div>
        </div>

        {onClose && (
          <button 
            onClick={onClose}
            className="text-[11px] font-mono text-[#ccff00] hover:text-white uppercase tracking-widest border border-[#ccff00]/30 hover:border-white px-3 py-1.5 transition-all bg-[#ccff00]/5"
          >
            [ Exit Press ]
          </button>
        )}
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 content-start">
        {/* Left List Pane */}
        <div className="lg:col-span-8 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#ccff00] font-black">
                Unapproved Editorial Queue ({pendingDrafts.length})
              </span>
              <span className="text-[9px] font-mono text-zinc-600 uppercase">Awaiting Sign-off</span>
            </div>

            {pendingDrafts.length === 0 ? (
              <div className="p-12 border border-zinc-800 bg-zinc-900/10 text-center space-y-4">
                <FileText className="w-8 h-8 text-zinc-700 mx-auto" />
                <p className="text-xs font-serif italic text-zinc-500">The unapproved draft registry is clean. All active columns have either been stamped live or recycled.</p>
                <div className="text-[9px] font-mono uppercase text-zinc-600">Waiting for autonomously generated columns, or manual boards.</div>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingDrafts.map((draft: any) => {
                  const isExpanded = expandedDraftId === draft._id;
                  const approving = isApproving === draft._id;
                  const rejecting = isRejecting === draft._id;

                  return (
                    <div 
                      key={draft._id} 
                      className="border border-zinc-800 bg-black hover:border-zinc-700 transition-all duration-300"
                    >
                      {/* Top Header Card */}
                      <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 bg-[#ccff00]/10 text-[#ccff00] font-mono text-[8px] uppercase font-bold border border-[#ccff00]/20">
                              {draft.tags?.[0] || 'Unassigned'}
                            </span>
                            <span className="flex items-center gap-1 font-mono text-[9px] text-zinc-500">
                              <Clock className="w-3 h-3 text-zinc-600" />
                              {new Date(draft.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                            {draft.status === 'review' && (
                              <span className="px-1.5 py-0.5 bg-yellow-950/40 text-yellow-500 font-mono text-[8px] uppercase border border-yellow-500/20 flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5" /> Autonomous Draft
                              </span>
                            )}
                          </div>
                          <h2 className="text-sm md:text-base font-serif font-black text-white hover:text-[#ccff00] transition-colors leading-snug pt-1">
                            {draft.headline}
                          </h2>
                          <p className="text-xs text-zinc-500 font-sans font-medium line-clamp-1">{draft.deck}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 justify-end self-end md:self-auto shrink-0">
                          <button
                            onClick={() => setExpandedDraftId(isExpanded ? null : draft._id)}
                            className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all"
                            title="Expand story text"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>

                          <button
                            disabled={approving || rejecting}
                            onClick={() => handleReject(draft._id, draft.headline)}
                            className={cn(
                              "px-3.5 py-2 border border-red-500/20 bg-red-950/10 text-red-400 hover:bg-red-950/30 hover:border-red-500 font-mono text-[10px] uppercase font-black tracking-widest transition-all",
                              (approving || rejecting) && "opacity-40 cursor-not-allowed"
                            )}
                          >
                            {rejecting ? "Recycling..." : "Reject"}
                          </button>

                          <button
                            disabled={approving || rejecting}
                            onClick={() => handleApprove(draft)}
                            className={cn(
                              "px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-[10px] uppercase font-black tracking-widest transition-all flex items-center gap-1.5",
                              (approving || rejecting) && "opacity-40 cursor-not-allowed"
                            )}
                          >
                            {approving ? (
                              <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            {approving ? "Approving..." : "Approve"}
                          </button>
                        </div>
                      </div>

                      {/* Collapsible Content detail */}
                      {isExpanded && (
                        <div className="px-5 pb-5 pt-3 border-t border-zinc-900 bg-zinc-950 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="space-y-4 max-w-2xl">
                            <div className="pb-3 border-b border-zinc-900">
                              <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-600 block mb-1">Suggested Visual Prompt (Photographer art cues)</span>
                              <p className="text-[10px] font-mono leading-relaxed text-zinc-400 italic">"{draft.suggested_visual_prompt || 'No specific cue available'}"</p>
                            </div>
                            <div>
                              <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-600 block mb-2">Pillar Body Copy</span>
                              <div className="text-xs text-zinc-400 font-serif leading-relaxed space-y-3 whitespace-pre-wrap selection:bg-[#ccff00] selection:text-black">
                                {draft.body}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Info Pane / Newspaper Stats */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-5 border border-zinc-800 bg-black space-y-6">
            <div className="pb-4 border-b border-zinc-900">
              <span className="font-mono text-[11px] uppercase tracking-widest text-[#ccff00] font-black block mb-1.5">Editorial Dashboard</span>
              <p className="text-[10px] text-zinc-500 font-mono uppercase">Live Magazine Statistics</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-zinc-900/40 border border-zinc-900/60 font-mono text-center">
                <span className="text-[9px] text-zinc-600 uppercase block mb-1">Approved Stikes</span>
                <span className="text-lg md:text-xl font-bold text-emerald-400">{publishedDrafts.length}</span>
              </div>
              <div className="p-3 bg-zinc-900/40 border border-zinc-900/60 font-mono text-center">
                <span className="text-[9px] text-zinc-600 uppercase block mb-1">Pending Cues</span>
                <span className="text-lg md:text-xl font-bold text-yellow-500">{pendingDrafts.length}</span>
              </div>
            </div>

            <div className="space-y-3.5 pt-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 font-black block">Recent Approved Publications</span>
              {publishedDrafts.length === 0 ? (
                <div className="text-[10px] font-serif font-medium italic text-zinc-600 text-center py-4">No columns have been stamped live in this cycle yet.</div>
              ) : (
                <div className="space-y-2.5 max-h-56 overflow-y-auto custom-scrollbar">
                  {publishedDrafts.map((draft: any) => (
                    <div key={draft._id} className="p-2.5 border border-zinc-900 bg-zinc-950 flex items-start gap-2.5">
                      <div className="p-1 border border-emerald-500/10 text-emerald-500 mt-0.5 bg-emerald-500/5 shrink-0">
                        <CheckCircle className="w-3 h-3" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-[11px] font-serif text-zinc-200 font-black truncate">{draft.headline}</h4>
                        <div className="flex gap-2 items-center mt-1">
                          <span className="text-[8px] font-mono text-zinc-600 uppercase">TAGS: {draft.tags?.[0] || 'Default'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
