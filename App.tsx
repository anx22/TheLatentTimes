
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CoverStory } from './components/CoverStory';
import { TheEdit } from './components/TheEdit';
import { FeatureSpread } from './components/FeatureSpread';
import { ColumnSection } from './components/ColumnSection';
import { RecipeSection } from './components/RecipeSection';
import { Footer } from './components/Footer';
import { TheNewsroom } from './components/TheNewsroom';
import { TheArchive } from './components/TheArchive'; // New
import { Ticker } from './components/ui/Ticker';
import { Spread } from './components/ui/Editorial';
import { RunwayNotes, Lookbook } from './components/ui/Fashion';
import { IssueContent } from './types';
import { useNewsroom } from './hooks/useNewsroom';
import { loadIssue, saveIssue, getSession, supabase, IS_CONFIGURED } from './services/storage';

const App: React.FC = () => {
  const [issue, setIssue] = useState<IssueContent | null>(null);
  const [showNewsroom, setShowNewsroom] = useState(false);
  const [showArchive, setShowArchive] = useState(false); // New
  const [hydrated, setHydrated] = useState(false);
  const [session, setSession] = useState<any>(null);
  
  // Use new hook destructuring
  const { 
      logs, isProcessing, scanWire, commissionStory, runAutopilot, publishArtifact, leads, dbStatus, dbError,
      channels, addChannel, removeChannel, 
      isAutopilotActive, toggleAutopilot // New
  } = useNewsroom();

  // 1. Auth Listener
  useEffect(() => {
    getSession().then(setSession);

    if (IS_CONFIGURED) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });
      return () => subscription.unsubscribe();
    } else {
        // Fallback for Mock Auth events
        const handleMockAuth = () => {
            getSession().then(setSession);
        };
        window.addEventListener('modus-mock-auth', handleMockAuth);
        return () => window.removeEventListener('modus-mock-auth', handleMockAuth);
    }
  }, []);

  // 2. Load Content (Trigger on Mount AND Session Change)
  useEffect(() => {
    const init = async () => {
        setHydrated(true);
        // Reload issue when session status changes (e.g. login) to get protected data
        const saved = await loadIssue();
        if (saved) setIssue(saved);
    };
    init();
  }, [session]);

  // 3. Save on change (Only if this is a fresh run/edit, NOT when loading from archive)
  useEffect(() => {
    if (hydrated && session && issue && issue.meta.run_id !== 'loaded') {
      saveIssue(issue);
    }
  }, [issue, hydrated, session]);
  
  const handleLoadIssue = async (id: string) => {
      const archived = await loadIssue(id);
      if (archived) {
          setIssue(archived);
          setShowArchive(false);
          window.scrollTo(0,0);
      }
  };

  // Ticker Logic
  const tickerItems = isProcessing 
    ? logs.slice(-5).reverse().map(l => `[${l.agent}] ${l.message}`)
    : (issue?.ticker || ["SYSTEM ONLINE", "AWAITING SIGNAL INGESTION", "OPEN NEWSROOM TO BEGIN"]);

  if (!hydrated) return null; 
  
  return (
    <div className="min-h-screen bg-background text-foreground font-display selection:bg-accent selection:text-white relative flex flex-col">
      {showNewsroom && (
        <TheNewsroom 
          logs={logs}
          isProcessing={isProcessing}
          scanWire={scanWire}
          commissionStory={commissionStory}
          runAutopilot={runAutopilot}
          leads={leads}
          dbStatus={dbStatus}
          dbError={dbError}
          channels={channels}
          onAddChannel={addChannel}
          onRemoveChannel={removeChannel}
          onPublishArtifact={publishArtifact}
          onPublish={(newIssue) => {
            setIssue(newIssue);
            // We keep newsroom open so user can publish more
          }} 
          onCancel={() => setShowNewsroom(false)} 
          isAutopilotActive={isAutopilotActive}
          onToggleAutopilot={toggleAutopilot}
        />
      )}
      
      {showArchive && (
          <TheArchive 
            onLoadIssue={handleLoadIssue}
            onClose={() => setShowArchive(false)}
          />
      )}

      <Ticker items={tickerItems} />
      <Header 
        onNavigate={() => window.scrollTo(0,0)} 
        onOpenNewsroom={() => setShowNewsroom(true)} 
        onOpenArchive={() => setShowArchive(true)}
        session={session}
      />
      
      <main className="flex-grow">
        {issue ? (
            // --- RENDER PUBLISHED ISSUE ---
            <>
                <CoverStory data={issue.cover} />
                <TheEdit data={issue.edit} drops={issue.drops} />
                
                <section className="max-w-[1536px] mx-auto px-6 md:px-16 py-24 border-t border-black">
                   <div className="flex justify-between items-end mb-12 border-b-4 border-black pb-4">
                       <h2 className="font-display text-[8vw] leading-[0.8] uppercase tracking-tighter">Collections</h2>
                       <span className="text-xs font-sans font-bold tracking-widest uppercase hidden md:block mb-1">FW / 25</span>
                   </div>
                   <Spread variant="split">
                     <RunwayNotes notes={[
                        { time: "LIVE", text: `Scanning signals for ${issue.meta.theme}`, highlight: true },
                        { time: "-1H", text: "Compiling latent space datasets", highlight: false },
                        { time: "-2H", text: `Ingested ${issue.meta.metrics?.signals_ingested || 0} signals`, highlight: false }
                     ]} />
                     <Lookbook looks={[
                       { id: "01", desc: "Latent Walk v1", src: "https://picsum.photos/800/1200?random=1" },
                       { id: "02", desc: "Latent Walk v2", src: "https://picsum.photos/800/1200?random=2" },
                     ]} />
                   </Spread>
                </section>

                {issue.features.map((story, i) => (
                  <FeatureSpread key={i} data={story} />
                ))}

                <ColumnSection columns={issue.columns} />
                <RecipeSection recipes={issue.atelier} />
                
                <section className="bg-white py-20 px-6 md:px-16 border-t border-black">
                   <div className="max-w-[1536px] mx-auto grid grid-cols-12 gap-6">
                     <div className="col-span-12 md:col-span-3">
                       <h2 className="font-display text-3xl mb-6 uppercase tracking-tight font-bold">Index</h2>
                     </div>
                     <div className="col-span-12 md:col-span-9">
                        <div className="flex flex-wrap gap-4">
                          {issue.index_keys.map((k, i) => (
                            <span key={i} className="text-[10px] uppercase tracking-widest border border-gray-200 px-3 py-1 hover:bg-black hover:text-white transition-colors cursor-pointer font-bold">
                              {k.term}
                            </span>
                          ))}
                        </div>
                     </div>
                   </div>
                </section>
            </>
        ) : (
            // --- RENDER TABULA RASA (EMPTY STATE) ---
            <section className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6">
                <div className="max-w-4xl">
                    <span className="inline-block px-3 py-1 border border-black text-[10px] font-sans font-bold uppercase tracking-widest mb-8">
                        System Status: Idle
                    </span>
                    <h2 className="font-display text-7xl md:text-9xl font-bold tracking-tighter uppercase mb-6 opacity-10">
                        Tabula Rasa
                    </h2>
                    <p className="font-sans text-lg text-neutral-500 max-w-xl mx-auto mb-12">
                        The issue is unpublished. The wire is silent. 
                        Press <strong className="text-black bg-neutral-200 px-1 rounded">ALT</strong> to access the Redaktion.
                    </p>
                </div>
            </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default App;
