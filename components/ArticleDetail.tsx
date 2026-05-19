import React, { useState } from 'react';
import { X, ArrowLeft, Share2, Bookmark, Send, Loader2 } from 'lucide-react';
import { LayoutItem } from '../types';
import Markdown from 'react-markdown';
import { agentConverseWithCritic } from '../services/agents';

interface ArticleDetailProps {
  item: LayoutItem;
  onClose: () => void;
}

export const ArticleDetail: React.FC<ArticleDetailProps> = ({ item, onClose }) => {
  const data = item.data;
  const title = data?.title || item.headline || "Untitled Article";
  const dek = data?.dek || "No description available.";
  const body = data?.body || "The full text of this article is currently being processed by the system. Please check back later for the complete editorial analysis.";
  const imageUrl = data?.hero_image_url || 'https://picsum.photos/1200/800?random=detail';
  const tags = data?.tags || ['EDITORIAL', 'SYSTEM'];
  const date = data?.published_at ? new Date(data.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "MARCH 2026";

  const [comments, setComments] = useState(data?.public_comments || []);
  const [replyingIdx, setReplyingIdx] = useState<number | null>(null);
  const [replyValue, setReplyValue] = useState("");
  const [isResponding, setIsResponding] = useState(false);

  const handleSendReply = async (idx: number) => {
    if (!replyValue.trim()) return;
    
    setIsResponding(true);
    const target = comments[idx];
    
    try {
      const rebuttal = await agentConverseWithCritic(
        title,
        body,
        target.persona,
        target.comment,
        replyValue
      );
      
      const newComments = [...comments];
      if (!newComments[idx].replies) newComments[idx].replies = [];
      newComments[idx].replies.push({
        user: replyValue,
        ai: rebuttal.response
      });
      
      setComments(newComments);
      setReplyValue("");
      setReplyingIdx(null);
    } catch (e) {
      console.error("Conversation failed", e);
    } finally {
      setIsResponding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto animate-fade-in">
      {/* Navigation Bar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-black px-6 h-16 flex items-center justify-between">
        <button 
          onClick={onClose}
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-100 px-3 py-2 rounded transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Issue
        </button>
        
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-zinc-100 rounded transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-zinc-100 rounded transition-colors">
            <Bookmark className="w-4 h-4" />
          </button>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <header className="mb-12">
          <div className="flex gap-2 mb-6">
            {(tags as string[]).map((tag: string) => (
              <span key={tag} className="text-[10px] font-mono uppercase tracking-widest border border-black px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
          
          <h1 className="font-serif text-6xl md:text-8xl leading-[0.85] tracking-tighter mb-8 text-black">
            {title}
          </h1>
          
          <p className="font-serif text-2xl md:text-3xl text-zinc-600 leading-tight mb-8">
            {dek}
          </p>
          
          <div className="flex items-center justify-between border-t border-b border-black py-4 font-mono text-[10px] uppercase tracking-widest text-black">
            <div>By {data?.author || "SYSTEM EDITOR"}</div>
            <div>{date}</div>
          </div>
        </header>

        {/* Hero Image */}
        <figure className="mb-16 -mx-6 md:-mx-12">
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full aspect-video object-cover border-t border-b border-black"
            referrerPolicy="no-referrer"
          />
          {data?.dek && (
            <figcaption className="px-6 md:px-12 mt-4 font-mono text-[10px] text-zinc-500 uppercase tracking-wide text-center">
              {data.dek}
            </figcaption>
          )}
        </figure>

        {/* Main Content Area */}
        <div className="grid md:grid-cols-[1fr_320px] gap-12 items-start">
          {/* Body Text */}
          <div className="prose prose-zinc prose-lg max-w-none font-serif leading-relaxed text-zinc-900 border-r border-zinc-100 pr-12">
            <div className="markdown-body">
              <Markdown>{body}</Markdown>
            </div>
          </div>

          {/* Critic's Corner Sidebar */}
          <aside className="space-y-8 sticky top-24">
            <div className="border-b border-black pb-2 mb-6">
              <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-black">The Critic's Corner</h3>
            </div>
            
            {comments.length > 0 ? (
              <div className="space-y-12">
                {comments.map((comment, idx) => (
                  <div key={idx} className="group border-b border-zinc-50 pb-8 last:border-0">
                    <div className="flex items-center gap-3 mb-3">
                       <div className="w-8 h-8 bg-black flex items-center justify-center text-[8px] font-mono text-white rounded-full group-hover:scale-110 transition-transform">
                         {comment.persona.substring(0, 2).toUpperCase()}
                       </div>
                       <div>
                         <div className="text-[9px] font-bold uppercase tracking-widest text-black">{comment.persona}</div>
                         <div className="text-[7px] font-mono text-zinc-400 uppercase tracking-widest">{comment.avatar_vibe}</div>
                       </div>
                    </div>
                    <p className="text-[11px] font-mono text-zinc-600 leading-relaxed italic mb-4">
                      "{comment.comment}"
                    </p>

                    {/* Replies */}
                    {comment.replies && comment.replies.map((reply: any, ridx: number) => (
                      <div key={ridx} className="mt-4 space-y-4 border-l border-zinc-200 pl-4 py-1">
                        <div className="text-[10px] font-mono text-zinc-400">
                          <span className="font-bold text-zinc-800 uppercase">[READER]:</span> {reply.user}
                        </div>
                        <div className="text-[10px] font-mono text-black leading-relaxed">
                          <span className="font-bold uppercase">[{comment.persona.toUpperCase()}]:</span> {reply.ai}
                        </div>
                      </div>
                    ))}

                    {/* Reply Action */}
                    {replyingIdx === idx ? (
                      <div className="mt-4 flex flex-col gap-2">
                        <textarea
                          autoFocus
                          value={replyValue}
                          onChange={(e) => setReplyValue(e.target.value)}
                          placeholder="Compose a rebuttal..."
                          className="w-full text-[10px] font-mono border border-black p-2 focus:outline-none placeholder:text-zinc-300 min-h-[60px]"
                        />
                        <div className="flex justify-end gap-2">
                           <button 
                             onClick={() => setReplyingIdx(null)}
                             className="text-[8px] font-mono uppercase tracking-widest text-zinc-400 hover:text-black"
                           >
                             Cancel
                           </button>
                           <button 
                             disabled={isResponding || !replyValue.trim()}
                             onClick={() => handleSendReply(idx)}
                             className="text-[8px] font-mono uppercase tracking-widest border border-black px-2 py-1 flex items-center gap-2 hover:bg-black hover:text-white transition-colors disabled:opacity-50"
                           >
                             {isResponding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                             Submit
                           </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setReplyingIdx(idx)}
                        className="text-[8px] font-mono uppercase tracking-widest font-bold underline underline-offset-4 decoration-zinc-200 hover:decoration-black transition-all"
                      >
                        Challenge Perspective
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[9px] font-mono text-zinc-400 italic">
                System still collecting peer reviews for this dispatch.
              </div>
            )}

            <div className="pt-8 border-t border-zinc-100">
               <div className="text-[8px] font-mono text-zinc-400 uppercase tracking-widest mb-2">Technical Specs</div>
               <div className="space-y-1 text-[8px] font-mono text-zinc-500 uppercase tracking-widest">
                  <div>LATENT_MODEL: GEMINI-3-FLASH</div>
                  <div>DIALOGUE_ENGINE: ATOMIC_CONVERSE</div>
                  <div>OBSERVABILITY: MISSIONS_V2</div>
               </div>
            </div>
          </aside>
        </div>

        {/* Footer */}
        <footer className="mt-24 pt-12 border-t border-black">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="max-w-xs">
              <h4 className="font-serif font-bold text-xl mb-4 text-black">About the Author</h4>
              <p className="text-sm text-zinc-600 leading-relaxed">
                The System Editor is an autonomous agent specializing in the synthesis of latent space signals and the curation of digital ephemera.
              </p>
            </div>
            
            <div className="flex gap-4">
              <button className="bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors">
                Share Article
              </button>
              <button className="border border-black px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-zinc-100 transition-colors">
                Save to Library
              </button>
            </div>
          </div>
        </footer>
      </article>
    </div>
  );
};
