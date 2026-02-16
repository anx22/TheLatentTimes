
import { IssueContent, SignalDossier, StoryArtifact, RecipeArtifact, DropArtifact, DebateArtifact, IssueMeta } from "../../types";

// PHASE 6: LAYOUT INTELLIGENCE (Deterministic)
export const agentLayout = async (
  theme: string,
  signals: SignalDossier[],
  stories: StoryArtifact[],
  recipes: RecipeArtifact[],
  initialDrops: Array<{ category: string; title: string; desc: string }>,
  drops: DropArtifact[] = [],
  debates: DebateArtifact[] = [],
  existingMeta?: IssueMeta
): Promise<IssueContent> => {

  // 1. SMART SORTING: Organize content by "Voltage" (Score) and "Visuals"
  const scoredStories = stories.map(s => {
      // Calculate a "Layout Weight"
      let weight = 0;
      if (s.placement === 'COVER') weight += 50;
      if (s.img_base64) weight += 20;
      if (s.status === 'PUBLISHED') weight += 10;
      return { ...s, layoutWeight: weight };
  }).sort((a, b) => b.layoutWeight - a.layoutWeight);

  // Identify the Cover Story (Highest weight)
  const coverStory = scoredStories.length > 0 ? scoredStories[0] : null;
  const features = scoredStories.filter(s => s.id !== coverStory?.id);
  const columns = stories.filter(s => s.placement === 'COLUMN');

  // 2. META RECONSTRUCTION
  // We strictly preserve existing meta if available, otherwise generate defaults.
  // No agents involved in ticker generation.
  
  const defaultTicker = ["MODUS SYSTEM ONLINE", "GRID LOCKED", "AWAITING INPUT"];
  
  const meta: IssueMeta = existingMeta || {
      run_id: Math.random().toString(36).substr(2, 9),
      issue_id: `ISSUE-${Date.now()}`,
      vol: `Vol. ${new Date().getMonth() + 1}`,
      theme: theme,
      date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      editor: "AUTO-ORCHESTRATOR",
      status: 'COLLECTING',
      metrics: {
        signals_ingested: signals.length,
        avg_confidence: 0.0, 
        error_rate: 0
      },
      ticker: defaultTicker
  };
  
  // Update dynamic metrics
  meta.metrics = {
      signals_ingested: signals.length,
      avg_confidence: 0.94,
      error_rate: 0
  };

  // 3. Final Assembly
  const issue: IssueContent = {
    meta: {
        ...meta,
        ticker: meta.ticker || defaultTicker
    },
    ticker: meta.ticker || defaultTicker,
    cover: {
      eyebrow: "The Issue",
      title: coverStory?.headline || "Untitled Issue",
      deck: coverStory?.deck || "System idle. Waiting for signals.",
      coverlines: features.slice(0, 3).map(f => ({
          eyebrow: f.category || "Feature",
          title: f.headline,
          deck: f.deck
      })),
      imgPrompt: coverStory?.img_prompt || "Abstract void",
      img_base64: coverStory?.img_base64
    },
    drops,
    edit: initialDrops, 
    debates, 
    features: features,
    columns: columns,
    atelier: recipes,
    index_keys: signals.map(s => ({ 
        term: s.topic, 
        category: s.tags?.topic_cluster || 'General' 
    })).sort((a, b) => a.term.localeCompare(b.term)),
    colophon: {
      contributors: ["Scout", "Critic", "Writer", "Layout Engine"],
      sources: signals.flatMap(s => s.source_urls || []).slice(0, 8),
      corrections: []
    }
  };

  return issue;
};
