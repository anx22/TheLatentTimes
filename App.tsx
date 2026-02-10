
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CoverStory } from './components/CoverStory';
import { TheEdit } from './components/TheEdit';
import { FeatureSpread } from './components/FeatureSpread';
import { ColumnSection } from './components/ColumnSection';
import { RecipeSection } from './components/RecipeSection';
import { Footer } from './components/Footer';
import { TheNewsroom } from './components/TheNewsroom';
import { Ticker } from './components/ui/Ticker';
import { Spread } from './components/ui/Editorial';
import { RunwayNotes, Lookbook } from './components/ui/Fashion';
import { IssueContent } from './types';
import { useNewsroom } from './hooks/useNewsroom';
import { loadIssue, saveIssue, getSession, supabase } from './services/storage';

// Fully populated Sample Issue for initial load
const SAMPLE_ISSUE: IssueContent = {
  meta: {
    run_id: "demo_01",
    issue_id: "ISSUE-2025-09",
    vol: "Vol. 13",
    theme: "The Synthetic Real",
    date: "September 2025",
    editor: "System V1",
    status: 'PUBLISHED'
  },
  ticker: [
    "BREAKING: Model Collapse Observed in Region us-east-1",
    "MARKET: Compute Credits trading at all time high",
    "TREND: 'Raw' photography aesthetic up 400%",
    "RELEASE: Midjourney V7 Alpha"
  ],
  cover: {
    eyebrow: "The September Issue",
    title: "The Latent Age",
    deck: "We are no longer documenting reality. We are compiling it. An investigation into the new physics of synthetic media.",
    coverlines: [
      { eyebrow: "Feature", title: "Ghost in the Machine", deck: "Do agents dream?" },
      { eyebrow: "Report", title: "The Death of Truth", deck: "Navigating the post-content era" },
      { eyebrow: "Atelier", title: "Workflow: V6.1", deck: "Achieving hyper-realism" }
    ],
    imgPrompt: "A futuristic fashion model dissolving into digital noise, high contrast, vogue editorial"
  },
  drops: [], // Initial empty
  edit: [
    { category: "Drop", title: "Kling 3 Release", desc: "The first single-pass video generator that actually understands physics. Available now." },
    { category: "Note", title: "Gaussian Splats", desc: "Why polygons are dead and radiance fields are the future of 3D capture." },
    { category: "Trend", title: "Anti-Smoothing", desc: "The rebellion against the 'AI look'. Grain, noise, and imperfection are the new luxury." },
    { category: "Index", title: "Compute Sovereignty", desc: "Nations hoarding H100s like gold reserves." }
  ],
  // NEW: Sample Debates
  debates: [],
  features: [
    {
      id: "feat_1",
      signal_id: "sig_1",
      placement: "FEATURE",
      status: 'PUBLISHED',
      category: "Deep Dive",
      headline: "The Infinite Context",
      deck: "Memory was once a biological constraint. Now it is merely a pricing tier. What happens when history is fully addressable?",
      pull_quote: "We have traded the burden of remembering for the anxiety of retrieval.",
      body: [
        "The first time you interact with a model that remembers everything, it feels like magic. The second time, it feels like surveillance. We are building systems that do not forgive, because they do not forget.",
        "In the early days of LLMs, context windows were small—barely enough for a conversation. Today, we dump entire libraries into the prompt. The implications for narrative are staggering. If the story never has to end, how do we find meaning?",
        "This shift from 'search' to 'synthesis' marks the end of the information age and the beginning of the wisdom simulation age. We act as curators of synthetic thoughts, pruning the branches of probability trees."
      ],
      footnotes: [
        { id: "fn1", ref: "surveillance", text: "Or perhaps, extreme intimacy. The difference is consent.", type: "nerd_humor" },
        { id: "fn2", ref: "libraries", text: "Specifically, the Pile v2 and CommonCrawl 2024.", type: "provenance" }
      ],
      citations: [{ source: "Anthropic Research Paper: Long Context scaling", confidence: 0.98 }],
      img_prompt: "Infinite library, borgesian architecture, endless books, cinematic lighting",
      img_caption: "The Library of Babel, Rendered via Flux.1"
    }
  ],
  columns: [
    {
      id: "col_1",
      signal_id: "sig_2",
      placement: "COLUMN",
      status: 'PUBLISHED',
      author_persona: "THE_CRITIC",
      category: "Opinion",
      headline: "Against Smoothness",
      deck: "Why the 'AI Look' of 2023 is already vintage kitsch. The future is gritty, noisy, and beautifully imperfect.",
      body: [],
      footnotes: [],
      citations: [],
      pull_quote: "",
      img_prompt: "",
      img_caption: ""
    },
    {
      id: "col_2",
      signal_id: "sig_3",
      placement: "COLUMN",
      status: 'PUBLISHED',
      author_persona: "THE_OPTIMIST",
      category: "Theory",
      headline: "Prompt Engineering is Dead",
      deck: "The cursor is the new conductor's baton. Natural language was just a bridge to something more direct.",
      body: [],
      footnotes: [],
      citations: [],
      pull_quote: "",
      img_prompt: "",
      img_caption: ""
    }
  ],
  atelier: [
    {
      id: "rec_1",
      status: 'PUBLISHED',
      title: "Analog Simulation V2",
      intent: "Recreate the look of Kodak Portra 400 on 35mm film without using overlay textures.",
      ingredients: ["Flux.1 Dev", "LoRA: FilmGrain", "Node: ColorMatch"],
      params: { "Steps": "35", "CFG": "4.5", "Sampler": "DPM++ 2M" },
      steps: ["1. Load Checkpoint", "2. Inject Noise (15%)", "3. Color Grade Latents"],
      failure_modes: ["Oversaturation in reds", "Skin texture becoming plastic"],
      warning: "Do not use 'HDR' in prompt."
    },
    {
        id: "rec_2",
        status: 'PUBLISHED',
        title: "Glitch Weave",
        intent: "Controlled datamoshing effects for textile patterns.",
        ingredients: ["ComfyUI", "ControlNet: Canny"],
        params: { "Strength": "0.65", "EndStep": "20" },
        steps: ["Input Fabric Image", "Apply Pixel Sort", "Denoise"],
        failure_modes: [],
        warning: ""
    }
  ],
  index_keys: [
    { term: "Agentic", category: "Tech" },
    { term: "Bias", category: "Ethics" },
    { term: "Compute", category: "Econ" },
    { term: "Diffusion", category: "Tech" },
    { term: "Entropy", category: "Physics" },
    { term: "Flux", category: "Tools" },
    { term: "Latent", category: "Concept" }
  ],
  colophon: { contributors: [], sources: [], corrections: [] }
};

const App: React.FC = () => {
  const [issue, setIssue] = useState<IssueContent>(SAMPLE_ISSUE);
  const [showNewsroom, setShowNewsroom] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [session, setSession] = useState<any>(null);
  
  // Lifted state from Newsroom to App to drive Ticker
  const { logs, isProcessing, runCycle } = useNewsroom();

  // 1. Auth Listener
  useEffect(() => {
    getSession().then(setSession);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Load Content (Public Read)
  useEffect(() => {
    const init = async () => {
        setHydrated(true);
        // Always try to load the latest issue from Supabase (Row Level Security allows public read)
        const saved = await loadIssue();
        if (saved) setIssue(saved);
    };
    init();
  }, []);

  // 3. Save on change (Authenticated Write Only)
  useEffect(() => {
    if (hydrated && session) {
      saveIssue(issue);
    }
  }, [issue, hydrated, session]);
  
  const tickerItems = isProcessing 
    ? logs.slice(-5).reverse().map(l => `[${l.agent}] ${l.message}`)
    : issue.ticker;

  if (!hydrated) return null; 
  
  // --- CONTENT FILTERING FOR PUBLIC VIEW ---
  const publicDrops = issue.drops.filter(d => !d.status || d.status === 'PUBLISHED');
  const publicFeatures = issue.features.filter(f => !f.status || f.status === 'PUBLISHED');
  const publicColumns = issue.columns.filter(c => !c.status || c.status === 'PUBLISHED');
  const publicRecipes = issue.atelier.filter(r => !r.status || r.status === 'PUBLISHED');

  return (
    <div className="min-h-screen bg-background text-foreground font-display selection:bg-accent selection:text-white relative">
      {showNewsroom && (
        <TheNewsroom 
          logs={logs}
          isProcessing={isProcessing}
          onRun={runCycle}
          onPublish={(newIssue) => {
            setIssue(newIssue);
            setShowNewsroom(false);
            window.scrollTo(0,0);
          }} 
          onCancel={() => setShowNewsroom(false)} 
        />
      )}

      <Ticker items={tickerItems} />
      <Header onNavigate={() => window.scrollTo(0,0)} />
      
      {/* Floating Fab for Newsroom */}
      <button 
        onClick={() => setShowNewsroom(true)}
        className={`fixed bottom-6 right-6 z-40 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all shadow-2xl ${isProcessing ? 'bg-accent animate-pulse' : 'bg-black hover:bg-accent hover:scale-110'}`}
        title="Open Redaktion"
      >
        {isProcessing ? '⚡' : '+'}
      </button>

      <main>
        {/* 1. Cover Story */}
        <CoverStory data={issue.cover} />
        
        {/* 2. The Edit (Drops & Notes) */}
        <TheEdit data={issue.edit} drops={publicDrops} />
        
        {/* 3. The Collections (Visual Break) */}
        <section className="max-w-[1536px] mx-auto px-6 md:px-16 py-24 border-t border-black">
           <h2 className="font-display text-5xl mb-12">The Collections</h2>
           <Spread variant="split">
             <RunwayNotes notes={[
                { time: "LIVE", text: `Scanning signals for ${issue.meta.theme}`, highlight: true },
                { time: "-1H", text: "Compiling latent space datasets", highlight: false },
                { time: "-2H", text: `Ingested ${issue.meta.metrics?.signals_ingested || 12} signals`, highlight: false }
             ]} />
             <Lookbook looks={[
               { id: "01", desc: "Latent Walk v1", src: "https://picsum.photos/800/1200?random=1" },
               { id: "02", desc: "Latent Walk v2", src: "https://picsum.photos/800/1200?random=2" },
             ]} />
           </Spread>
        </section>

        {/* 4. Features (Deep Dives) */}
        {publicFeatures.map((story, i) => (
          <FeatureSpread key={i} data={story} />
        ))}

        {/* 5. Columns (Opinion) */}
        <ColumnSection columns={publicColumns} />

        {/* 6. Atelier (Technical Recipes) */}
        <RecipeSection recipes={publicRecipes} />
        
        {/* 7. Index */}
        <section className="bg-white py-20 px-6 md:px-16 border-t border-black">
           <div className="max-w-[1536px] mx-auto grid grid-cols-12 gap-6">
             <div className="col-span-12 md:col-span-3">
               <h2 className="font-display text-3xl mb-6">Index</h2>
             </div>
             <div className="col-span-12 md:col-span-9">
                <div className="flex flex-wrap gap-4">
                  {issue.index_keys.map((k, i) => (
                    <span key={i} className="text-[10px] uppercase tracking-widest border border-gray-200 px-3 py-1 hover:bg-black hover:text-white transition-colors cursor-pointer">
                      {k.term}
                    </span>
                  ))}
                </div>
             </div>
           </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default App;
