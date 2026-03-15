
import React, { useState, useEffect } from 'react';
import { IssueContent, MagazineItem, LayoutItem } from './types';
import { NewsroomFloor } from './components/newsroom-v2/NewsroomFloor';
import { Header } from './components/Header'; 
import { NewsroomProvider } from './contexts/NewsroomContext';
import { ArchiveModal } from './components/ui/ArchiveModal';
import { DebugStatus } from './components/DebugStatus';
import { useQuery, useMutation } from "convex/react";
import { api } from "./convex/_generated/api";
import { NewspaperGrid } from './components/newsroom-v2/printing-press/grid/NewspaperGrid';

const MainNewspaper: React.FC<{ layout?: LayoutItem[] }> = ({ layout }) => {
  return <NewspaperGrid layout={layout} onLayoutChange={() => {}} readOnly={true} />;
};

const Ticker: React.FC<{ items: string[] }> = ({ items }) => (
  <div className="w-full bg-black text-white py-2 overflow-hidden border-b border-zinc-800">
    <div className="flex whitespace-nowrap animate-marquee">
      {[...items, ...items, ...items].map((item, i) => (
        <span key={i} className="mx-8 text-[10px] font-mono uppercase tracking-[0.3em] flex items-center gap-4">
          <span className="w-1.5 h-1.5 bg-[#e60042] rounded-full"></span>
          {item}
        </span>
      ))}
    </div>
  </div>
);

// --- MOCK V3 CONTENT (The "MagazineItems") ---
const MOCK_ITEMS: MagazineItem[] = [
    {
        id: 'item_1',
        title: "The Architecture of Latent Space",
        dek: "Why modern LLMs are developing a spatial understanding of concepts, and what it means for digital geography.",
        published_at: new Date().toISOString(),
        tags: ['Theory', 'Engineering'],
        media_type: 'image',
        hero_image_url: 'https://picsum.photos/800/600?random=1',
        status: 'published',
        featured_level: 'featured',
        score: { final: 9, recency: 10, trust: 8, novelty: 9, visual_fit: 10 }
    },
    {
        id: 'item_2',
        title: "Glitch as Currency",
        dek: "In a world of perfect generation, the artifact is the only proof of humanity left.",
        published_at: new Date().toISOString(),
        tags: ['Culture', 'Art'],
        media_type: 'image',
        hero_image_url: 'https://picsum.photos/800/600?random=2',
        status: 'published',
        featured_level: 'featured',
        score: { final: 8, recency: 7, trust: 9, novelty: 8, visual_fit: 9 }
    },
    {
        id: 'item_3',
        title: "Recursive Self-Improvement",
        dek: "Agents building agents. The loop is closing faster than we thought.",
        published_at: new Date().toISOString(),
        tags: ['Engineering', 'Future'],
        media_type: 'text',
        hero_image_url: 'https://picsum.photos/800/600?random=3',
        status: 'published',
        featured_level: 'none',
        score: { final: 7, recency: 9, trust: 8, novelty: 7, visual_fit: 6 }
    }
];

// Initial Data State
const SHELL_DATA: IssueContent = {
    meta: {
        run_id: 'shell_v1',
        issue_id: 'shell_v1',
        vol: 'VOL. 1.0',
        theme: 'THE GENESIS ISSUE',
        date: 'OCT 2025',
        editor: 'SYSTEM',
        status: 'COLLECTING',
        template_key: 'T1_CoverRail', // Default
        metrics: { signals_ingested: 124, avg_confidence: 94, error_rate: 0 }
    },
    items: MOCK_ITEMS, 
    ticker: ["THE LATENT TIMES V1.0", "GRID LOCKED", "NOISE FILTER: ACTIVE", "SIGNAL: HIGH"],
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

  const handlePublishItem = async (newItem: MagazineItem, layout: any[]) => {
      // Optimistic update
      setIssue(prev => ({
          ...prev,
          items: [newItem, ...(prev.items || [])],
          layout: layout
      }));
      
      // Persist to DB
      await addItemMutation({ item: newItem, layout });
  };

  const handleSelectIssue = async (selectedIssue: any) => {
      if (selectedIssue && selectedIssue.content) {
          setIssue(selectedIssue.content as IssueContent);
          setShowArchive(false);
      }
  };

  if (!hydrated) return null;

  return (
    <NewsroomProvider onPublish={handlePublishItem} initialLayout={issue.layout}>
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
         <Ticker items={issue.ticker || []} />

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

         {/* 3. CONTENT LAYER (React Grid Layout) */}
         <div className="pt-16">
           <MainNewspaper layout={issue.layout} />
         </div>
         
         <DebugStatus />
         
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
  );
};

export default App;
