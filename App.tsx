
import React, { useState, useEffect } from 'react';
import { LayoutEngine } from './components/layout/LayoutEngine';
import { IssueContent, MagazineItem } from './types';
import { NewsroomFloor } from './components/newsroom-v2/NewsroomFloor';
import { TEMPLATE_REGISTRY } from './services/templates';
import { Header } from './components/Header'; 
import { NewsroomProvider } from './contexts/NewsroomContext';
import { ArchiveModal } from './components/ui/ArchiveModal';
import { useQuery, useMutation } from "convex/react";
import { api } from "./convex/_generated/api";

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

  const handlePublishItem = async (newItem: MagazineItem) => {
      // Optimistic update
      setIssue(prev => ({
          ...prev,
          items: [newItem, ...(prev.items || [])]
      }));
      
      // Persist to DB
      await addItemMutation({ item: newItem });
  };

  const handleSelectIssue = async (selectedIssue: any) => {
      if (selectedIssue && selectedIssue.content) {
          setIssue(selectedIssue.content as IssueContent);
          setShowArchive(false);
      }
  };

  if (!hydrated) return null;

  // Resolve Template
  const activeTemplateKey = issue.meta.template_key || 'T1_CoverRail';
  // Use persistent sections from Issue if available (customized), otherwise fall back to registry default
  const activeSections = issue.sections || TEMPLATE_REGISTRY[activeTemplateKey]?.sections || TEMPLATE_REGISTRY['T1_CoverRail'].sections;

  return (
    <NewsroomProvider onPublish={handlePublishItem}>
      <div className="min-h-screen bg-background text-foreground font-sans selection:bg-accent selection:text-white pb-32">
         
         {/* 1. GLOBAL SYSTEM HEADER (Controls) */}
         <Header 
            onNavigate={() => {}}
            onOpenNewsroom={() => setShowNewsroom(true)}
            onOpenArchive={() => setShowArchive(true)}
            onShare={handleShare}
            session={session}
            meta={issue.meta}
         />

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

         {/* 3. CONTENT LAYER (Layout Engine) */}
         <LayoutEngine 
            sections={activeSections} 
            data={issue} 
         />
         
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
