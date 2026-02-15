
import { Type } from "@google/genai";
import { SignalDossier, Verdict, StoryOutline, StoryArtifact, ToneProfile } from "../../../types";
import { safeGenerateContent, cleanAndParseJSON } from "../../gemini";
import { RunConfig } from "../../../hooks/useNewsroom";
import { getBannedList, STYLE_INSTRUCTION, formatToneInstruction } from "./constants";
import { getConstraintsFor } from "../../design-system";

// 4.2 Outline Builder
export const agentOutline = async (dossier: SignalDossier, verdict: Verdict): Promise<StoryOutline> => {
  const response = await safeGenerateContent({
    model: "gemini-3-pro-preview", 
    contents: `Create a story outline for "${dossier.topic}".
    Format: ${verdict.placement}.
    Structure:
    - Lead: An anecdotal hook or a cold hard fact. No warm-ups.
    - Beats: 3 key arguments.
    - Turn: The 'But' moment. The contradiction.
    - Close: An open-ended, lingering thought. Not a summary.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          lead: { type: Type.STRING },
          beats: { type: Type.ARRAY, items: { type: Type.STRING } },
          turn: { type: Type.STRING },
          close: { type: Type.STRING }
        }
      }
    }
  });
  return cleanAndParseJSON(response.text);
};

// 4.3 Draft Writer
export const agentDraft = async (
    dossier: SignalDossier, 
    verdict: Verdict, 
    headline: string, 
    outline: StoryOutline, 
    config?: RunConfig
): Promise<StoryArtifact> => {
  const overrides = config?.overrides;
  const bannedList = getBannedList(overrides?.bannedWords);
  const audience = overrides?.audienceLevel || "Expert";
  const temperature = overrides?.modelTemperature || 0.7;
  
  // DETERMINE TARGET BLOCK & CONSTRAINTS
  // We infer the likely block type based on placement to give the writer spatial awareness
  let likelyBlockType = 'FeatureCard';
  if (verdict.placement === 'COVER') likelyBlockType = 'HeroTypePlate';
  if (verdict.placement === 'COLUMN') likelyBlockType = 'CategoryColumn'; // Or QuotePlate
  
  const constraints = getConstraintsFor(likelyBlockType);
  const spatialConstraint = `
    SPATIAL CONSTRAINTS (Layout: ${likelyBlockType}):
    - HEADLINE: Must be under ${constraints.max_headline_chars} characters.
    - DECK: Must be under ${constraints.max_deck_chars > 0 ? constraints.max_deck_chars : 150} characters.
    - TONE FIT: ${constraints.recommended_tone}.
  `;

  // Tone Setup
  const toneProfile: ToneProfile = config?.toneProfile || {
      drama: 3,
      precision: 3,
      metaphor_density: 3,
      adjective_budget: 50,
      sentence_mode: 'MIXED'
  };
  const toneLogic = formatToneInstruction(toneProfile);

  const response = await safeGenerateContent({
    model: "gemini-3-pro-preview",
    contents: `Write the story based on this outline: ${JSON.stringify(outline)}.
    Headline: ${headline}.
    Signal: ${dossier.topic}.
    
    ${spatialConstraint}
    
    TONE DIRECTIVE: ${verdict.tone_directives}.
    ${toneLogic}
    AUDIENCE: ${audience}.
    
    ${STYLE_INSTRUCTION}
    ADDITIONAL BANNED WORDS: ${bannedList}

    REQUIRED OUTPUTS:
    1. Body Text: Adhere strictly to the Tone Profile.
    2. Signature Blocks:
       - 'THE_CANON': Historical context/precedent.
       - 'COUNTERPOINT': The strongest argument *against* this article.
       - 'VERDICT': A one-sentence final judgment.
       - 'DELTA': What changed this week?
    `,
    config: {
      temperature: temperature,
      systemInstruction: `You are the Lead Writer. You are elite, detached, and highly intelligent. 
      You are spatially aware of the layout block you are writing for.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          headline: { type: Type.STRING, description: "Optimized for the spatial constraint." },
          deck: { type: Type.STRING, description: "Optimized for the spatial constraint." },
          body: { type: Type.ARRAY, items: { type: Type.STRING } },
          footnotes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: {type:Type.STRING}, ref:{type:Type.STRING}, text:{type:Type.STRING}, type:{type:Type.STRING} } } },
          pull_quote: { type: Type.STRING },
          citations: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { source: {type:Type.STRING}, confidence: {type:Type.NUMBER} } } },
          img_prompt: { type: Type.STRING },
          img_caption: { type: Type.STRING },
          category: { type: Type.STRING },
          signature_blocks: {
              type: Type.ARRAY,
              items: {
                  type: Type.OBJECT,
                  properties: {
                      type: { type: Type.STRING, enum: ['THE_CANON', 'COUNTERPOINT', 'VERDICT', 'DELTA', 'QUOTE'] },
                      heading: { type: Type.STRING },
                      content: { type: Type.STRING }
                  }
              }
          }
        }
      }
    }
  });
  
  const raw = cleanAndParseJSON(response.text);
  
  // Assign IDs to blocks
  const blocks = (raw.signature_blocks || []).map((b: any, i: number) => ({
      id: `blk_${Date.now()}_${i}`,
      ...b
  }));

  return { 
    id: dossier.id, 
    signal_id: dossier.id, 
    placement: verdict.placement,
    status: 'REVIEW',
    headline: raw.headline || headline, // Use the spatially optimized headline
    deck: raw.deck || outline.lead,
    topic: verdict.assigned_topic || 'CULTURE',
    format: verdict.assigned_format || 'ESSAY',
    media_type: verdict.primary_media || 'TEXT',
    tone_profile: toneProfile,
    signature_blocks: blocks,
    ...raw 
  };
};
