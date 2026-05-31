
import React, { useState, useEffect } from 'react';
import { IssueContent, MagazineItem, LayoutItem } from './types';
import { NewsroomFloor } from './components/newsroom-v2/NewsroomFloor';
import { Header } from './components/Header'; 
import { NewsroomProvider } from './contexts/NewsroomContext';
import { AuthProvider } from './contexts/AuthContext';
import { ArchiveModal } from './components/ui/ArchiveModal';
import { ArticleDetail } from './components/ArticleDetail';
import { MagazineGrid } from './components/MagazineGrid';
import { useQuery, useMutation } from "convex/react";
import { api } from "./frontendApi";

const MainNewspaper: React.FC<{ items: MagazineItem[], onItemClick: (item: MagazineItem) => void }> = ({ items, onItemClick }) => {
  const safeItems = items || [];
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="space-y-16">
        {safeItems.map((item) => (
          <article 
            key={item.id} 
            className="group cursor-pointer"
            onClick={() => onItemClick(item)}
          >
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-400 mb-4">
                  {item.tags.join(' • ')}
                </div>
                <h2 className="font-serif text-4xl leading-tight mb-4 group-hover:text-zinc-600 transition-colors">
                  {item.title}
                </h2>
                <p className="font-serif text-zinc-600 leading-relaxed italic">
                  {item.dek}
                </p>
              </div>
              {item.hero_image_url && (
                <div className="aspect-[4/3] overflow-hidden bg-zinc-100 rounded-sm">
                  <img 
                    src={item.hero_image_url} 
                    alt={item.title}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
            </div>
          </article>
        ))}
        {safeItems.length === 0 && (
          <div className="text-center py-32 border-2 border-dashed border-zinc-200 rounded-lg">
            <p className="font-mono text-xs uppercase tracking-widest text-zinc-400">No Articles Published Yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Decorative band — strings are not data-driven; the Ticker concept was
// retired from the core backend workflow (see DECISIONS, Signal Convergence).
const TICKER_LINES = [
  "THE LATENT TIMES",
  "SIGNAL: HIGH",
  "NOISE FILTER: ACTIVE",
  "GRID LOCKED",
];

const Ticker: React.FC = () => (
  <div className="w-full bg-black text-white py-2 overflow-hidden border-b border-zinc-800">
    <div className="flex whitespace-nowrap animate-marquee">
      {[...TICKER_LINES, ...TICKER_LINES, ...TICKER_LINES].map((item, i) => (
        <span key={i} className="mx-8 text-[10px] font-mono uppercase tracking-[0.3em] flex items-center gap-4">
          <span className="w-1.5 h-1.5 bg-zinc-800 rounded-full"></span>
          {item}
        </span>
      ))}
    </div>
  </div>
);

// Initial Data State — empty shell. Real content arrives via Convex `getLatestIssue`.
const SHELL_DATA: IssueContent = {
    meta: {
        run_id: 'shell_v1',
        issue_id: 'shell_v1',
        vol: 'VOL. 1.0',
        theme: 'THE GENESIS ISSUE',
        date: 'OCT 2025',
        editor: 'SYSTEM',
        status: 'COLLECTING',
        template_key: 'T1_CoverRail',
        metrics: { signals_ingested: 0, avg_confidence: 0, error_rate: 0 }
    },
    items: [],
    cover: {
        eyebrow: "ISSUE 01",
        title: "ZERO DAY", 
        deck: "Blank slate. Rigid grid. Pure signal.",
        coverlines: [],
        imgPrompt: "Void",
        img_base64: ""
    },
    edit: [],
    drops: [],
    debates: [],
    features: [],
    columns: [],
    atelier: [],
    index_keys: [],
    colophon: { contributors: [], sources: [], corrections: [] }
};

const App: React.FC = () => {
  const [issue, setIssue] = useState<IssueContent>(SHELL_DATA);
  const [hydrated, setHydrated] = useState(false);
  const [showNewsroom, setShowNewsroom] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MagazineItem | null>(null);
  const session = { user: { email: 'editor@latent.times', id: 'dev-bypass-id' } }; // Mock session
  
  const latestIssue = useQuery(api.newsroom.queries.getLatestIssue);
  const addItemMutation = useMutation(api.newsroom.mutations.addItemToLatestIssue);

  useEffect(() => {
    if (latestIssue !== undefined) {
        if (latestIssue) {
            setIssue(latestIssue.content as IssueContent);
        }
        setHydrated(true);
    }
  }, [latestIssue]);

  const handleShare = () => {
      const url = window.location.href;
      navigator.clipboard.writeText(url);
      alert("Issue Link Copied to Clipboard");
  };

  const handlePublishItem = async (newItem: MagazineItem, layout?: LayoutItem[]) => {
      // Optimistic update
      setIssue(prev => ({
          ...prev,
          items: [newItem, ...(prev.items || [])],
          layout: layout || prev.layout
      }));
      
      // Persist to DB
      await addItemMutation({ item: newItem, layout: layout });
  };

  const handleManualLayoutChange = async (newLayout: LayoutItem[]) => {
      setIssue(prev => ({ ...prev, layout: newLayout }));
      // We could also add a dedicated mutation for layout-only updates if needed
      // For now, it updates locally and will be saved on the next addition or state save
  };

  const handleSelectIssue = async (selectedIssue: any) => {
      if (selectedIssue && selectedIssue.content) {
          setIssue(selectedIssue.content as IssueContent);
          setShowArchive(false);
      }
  };

  if (!hydrated) return null;

  return (
    <AuthProvider>
    <NewsroomProvider onPublish={handlePublishItem}>
      <div className="min-h-screen bg-[#faf9f6] text-foreground font-sans selection:bg-accent selection:text-white pb-32">
         
         {/* 1. GLOBAL SYSTEM HEADER (Controls) */}
         <Header 
            onNavigate={() => {}}
            onOpenNewsroom={() => setShowNewsroom(true)}
            onOpenArchive={() => setShowArchive(true)}
            onShare={handleShare}
            session={session}
            meta={issue.meta}
         />
         <Ticker />

         {/* 2. OPS LAYER (Newsroom Overlay) */}
         {showNewsroom && (
             <NewsroomFloor 
                 onClose={() => setShowNewsroom(false)}
             />
         )}

         {/* 2.5 ARCHIVE MODAL */}
         {showArchive && (
             <ArchiveModal 
                 onClose={() => setShowArchive(false)}
                 onSelectIssue={handleSelectIssue}
             />
         )}

         {/* 3. CONTENT LAYER */}
         <div className="pt-16">
           {issue.layout && issue.layout.length > 0 ? (
             <MagazineGrid 
               layout={issue.layout} 
               onLayoutChange={handleManualLayoutChange}
               onItemClick={setSelectedItem} 
             />
           ) : (
             <MainNewspaper items={issue.items || []} onItemClick={setSelectedItem} />
           )}
         </div>
         
          {/* 6. ARTICLE MODAL */}
          {selectedItem && (
            <ArticleDetail 
              item={{ i: selectedItem.id, x: 0, y: 0, w: 1, h: 1, headline: selectedItem.title, blockType: 'standard', data: selectedItem }}
              onClose={() => setSelectedItem(null)}
            />
          )}
         
         {/* Floating Toggle (Backup access) */}
         {!showNewsroom && session && (
             <div className="fixed bottom-6 right-6 z-50">
                 <button 
                      onClick={() => setShowNewsroom(true)}
                      className="bg-black text-white w-12 h-12 rounded-full flex items-center justify-center font-bold shadow-2xl hover:scale-110 transition-transform"
                      title="Open Redaktion"
                 >
                     Ops
                 </button>
             </div>
         )}
      </div>
    </NewsroomProvider>
    </AuthProvider>
  );
};

export default App;
