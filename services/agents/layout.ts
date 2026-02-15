
import { Type } from "@google/genai";
import { IssueContent, SignalDossier, StoryArtifact, RecipeArtifact, DropArtifact, DebateArtifact, IssueMeta } from "../../types";
import { safeGenerateContent, cleanAndParseJSON } from "../gemini";
import { DESIGN_SYSTEM } from "../design-system";

// PHASE 6: LAYOUT INTELLIGENCE
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

  // 2. HOLISTIC AUDIT AGENT
  // Checks for repetition, ensures the cover line isn't identical to a feature headline, etc.
  let refinedTicker = existingMeta?.ticker || [];
  let refinedCoverLines = features.slice(0, 3).map(f => ({ 
      eyebrow: f.category, 
      title: f.headline, 
      deck: f.deck 
  }));

  if (stories.length > 0) {
      try {
          const auditContext = {
              cover_headline: coverStory?.headline,
              feature_headlines: features.map(f => f.headline),
              ticker_items: refinedTicker
          };

          // Ask Gemini to audit and refine the text for the "Whole Issue" context
          const response = await safeGenerateContent({
              model: "gemini-3-flash-preview",
              contents: `Act as the COPY CHIEF. Review this issue's layout text for repetition and punchiness.
              
              CONTEXT:
              ${JSON.stringify(auditContext)}
              
              DESIGN SYSTEM RULES:
              - Hero Type Plate (Cover): Max ${DESIGN_SYSTEM['HeroTypePlate'].constraints.max_headline_chars} chars.
              - Ticker: Max ${DESIGN_SYSTEM['TopicTicker'].constraints.max_headline_chars} chars per item.
              
              TASK:
              1. Optimize the Ticker Items (Make them cryptic, data-driven, non-repetitive).
              2. Generate 3 sharp Coverlines based on the feature headlines (Short, punchy).
              
              Return JSON.`,
              config: {
                  responseMimeType: "application/json",
                  responseSchema: {
                      type: Type.OBJECT,
                      properties: {
                          refined_ticker: { type: Type.ARRAY, items: { type: Type.STRING } },
                          coverlines: { 
                              type: Type.ARRAY, 
                              items: { 
                                  type: Type.OBJECT,
                                  properties: {
                                      eyebrow: { type: Type.STRING },
                                      title: { type: Type.STRING },
                                      deck: { type: Type.STRING }
                                  }
                              } 
                          }
                      }
                  }
              }
          });
          
          const auditResult = cleanAndParseJSON(response.text);
          if (auditResult.refined_ticker) refinedTicker = auditResult.refined_ticker;
          if (auditResult.coverlines) refinedCoverLines = auditResult.coverlines;

      } catch (e) {
          console.warn("Layout Audit Failed, using raw values.", e);
      }
  } else if (refinedTicker.length === 0) {
      refinedTicker = ["SYSTEM ONLINE", "AWAITING INPUT", "GRID LOCKED", "NO SIGNAL"];
  }

  // 3. Resolve Meta
  const meta: IssueMeta = existingMeta || {
      run_id: Math.random().toString(36).substr(2, 9),
      issue_id: `ISSUE-${Date.now()}`,
      vol: `Vol. ${new Date().getMonth() + 13}`,
      theme: theme,
      date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      editor: "AUTO-ORCHESTRATOR",
      status: 'COLLECTING',
      metrics: {
        signals_ingested: signals.length,
        avg_confidence: 0.9, 
        error_rate: 0
      }
  };
  
  // Ensure metrics update even if meta exists
  meta.metrics = {
      signals_ingested: signals.length,
      avg_confidence: 0.94,
      error_rate: 0
  };

  // 4. Final Assembly
  const issue: IssueContent = {
    meta: {
        ...meta,
        ticker: refinedTicker
    },
    ticker: refinedTicker,
    cover: {
      eyebrow: "The Issue",
      title: coverStory?.headline || "Untitled Issue",
      deck: coverStory?.deck || "No strong signals detected. System idle.",
      coverlines: refinedCoverLines,
      imgPrompt: coverStory?.img_prompt || "Abstract high fashion aesthetic, minimal, void",
      img_base64: coverStory?.img_base64
    },
    drops,
    edit: initialDrops, // Keeping this simple for now, can be enhanced later
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
