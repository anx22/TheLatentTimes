
import { Type } from "@google/genai";
import { IssueContent, SignalDossier, StoryArtifact, RecipeArtifact, DropArtifact, DebateArtifact, IssueMeta } from "../../types";
import { safeGenerateContent, cleanAndParseJSON } from "../gemini";

// PHASE 6: LAYOUT AGENT
export const agentLayout = async (
  theme: string,
  signals: SignalDossier[],
  stories: StoryArtifact[],
  recipes: RecipeArtifact[],
  initialDrops: Array<{ category: string; title: string; desc: string }>,
  drops: DropArtifact[] = [],
  debates: DebateArtifact[] = [],
  existingMeta?: IssueMeta // NEW: Stability param
): Promise<IssueContent> => {

  // 1. Sort Content
  let coverStory = stories.find(s => s.placement === 'COVER');
  if (!coverStory && stories.length > 0) {
      coverStory = stories[0];
  }
  
  const features = stories.filter(s => 
    (s.placement === 'FEATURE' || s.placement === 'COVER') && s.id !== coverStory?.id
  );
  
  const columns = stories.filter(s => s.placement === 'COLUMN');

  // 2. Intelligent Edit (The Edit section backfill)
  const finalEditItems = [...initialDrops];
  if (finalEditItems.length < 4 && signals.length > 0) {
      const usedTitles = new Set(finalEditItems.map(i => i.title));
      const unusedSignals = signals.filter(s => !usedTitles.has(s.topic) && !usedTitles.has(s.title_candidate || ""));
      
      unusedSignals.slice(0, 4 - finalEditItems.length).forEach(s => {
          finalEditItems.push({
              category: "Index",
              title: s.title_candidate || s.topic,
              desc: s.one_liner || "Developing signal."
          });
      });
  }

  // 3. Ticker Tape Generation (OPTIMIZED)
  // Only generate if we have signals AND the existing meta doesn't have a ticker yet.
  // This prevents hitting the LLM on every partial UI update.
  let tickerItems: string[] = existingMeta?.ticker || [];
  
  if (tickerItems.length === 0 && signals.length > 0) {
      try {
          const tickerPrompt = `Generate 5 punchy, high-fashion ticker tape news items for a magazine issue about "${theme}".
          Signals involved: ${signals.map(s => s.topic).join(', ')}.
          Format: "BREAKING: [Headline]", "MARKET: [Stat]", "TREND: [Observation]".
          Keep it under 10 words per item.`;

          const resp = await safeGenerateContent({
              model: 'gemini-3-flash-preview',
              contents: tickerPrompt,
              config: {
                  responseMimeType: 'application/json',
                  responseSchema: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                  }
              }
          });
          tickerItems = cleanAndParseJSON(resp.text);
      } catch (e) {
          tickerItems = signals.map(s => `SIGNAL: ${s.topic.toUpperCase()} (${s.scores.heat}/5)`);
      }
  } else if (tickerItems.length === 0) {
      tickerItems = ["SYSTEM ONLINE", "AWAITING INPUT"];
  }

  // 4. Resolve Meta
  const meta: IssueMeta = existingMeta || {
      run_id: Math.random().toString(36).substr(2, 9),
      issue_id: `ISSUE-${Date.now()}`, // Stable ID for DB
      vol: `Vol. ${new Date().getMonth() + 13}`, // Synthetic Volume numbering
      theme: theme,
      date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      editor: "AUTO-ORCHESTRATOR",
      status: 'COLLECTING',
      metrics: {
        signals_ingested: 0,
        avg_confidence: 0,
        error_rate: 0
      }
  };

  // Update dynamic metrics
  meta.metrics = {
      signals_ingested: signals.length,
      avg_confidence: 0.9, // Placeholder
      error_rate: 0
  };

  // 5. Final Assembly
  const issue: IssueContent = {
    meta: {
        ...meta,
        ticker: tickerItems
    },
    ticker: tickerItems,
    cover: {
      eyebrow: "The Issue",
      title: coverStory?.headline || "Untitled Issue",
      deck: coverStory?.deck || "No strong signals detected. System idle.",
      coverlines: features.slice(0, 3).map(f => ({ 
          eyebrow: f.category, 
          title: f.headline, 
          deck: f.deck 
      })),
      imgPrompt: coverStory?.img_prompt || "Abstract high fashion aesthetic, minimal, void",
      img_base64: coverStory?.img_base64
    },
    drops,
    edit: finalEditItems,
    debates, 
    features: features,
    columns: columns,
    atelier: recipes,
    index_keys: signals.map(s => ({ 
        term: s.topic, 
        category: s.tags?.topic_cluster || 'General' 
    })).sort((a, b) => a.term.localeCompare(b.term)),
    colophon: {
      contributors: ["Scout v1", "Critic v2.1", "Gemini 3 Pro", "Layout Bot"],
      sources: signals.flatMap(s => s.source_urls || []).slice(0, 8),
      corrections: []
    }
  };

  return issue;
};
