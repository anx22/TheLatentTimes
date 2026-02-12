
import { Type } from "@google/genai";
import { SignalDossier, Verdict, StoryOutline, StoryArtifact } from "../../../types";
import { safeGenerateContent, cleanAndParseJSON } from "../../gemini";
import { RunConfig } from "../../../hooks/useNewsroom";
import { getBannedList, STYLE_INSTRUCTION } from "./constants";

// 4.2 Outline Builder
export const agentOutline = async (dossier: SignalDossier, verdict: Verdict): Promise<StoryOutline> => {
  const response = await safeGenerateContent({
    model: "gemini-3-flash-preview",
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
export const agentDraft = async (dossier: SignalDossier, verdict: Verdict, headline: string, outline: StoryOutline, config?: RunConfig): Promise<StoryArtifact> => {
  const overrides = config?.overrides;
  const bannedList = getBannedList(overrides?.bannedWords);
  const audience = overrides?.audienceLevel || "Expert";
  const temperature = overrides?.modelTemperature || 0.7;

  const response = await safeGenerateContent({
    model: "gemini-3-flash-preview", // OPTIMIZATION: Use Flash for Drafting (Writer)
    contents: `Write the story based on this outline: ${JSON.stringify(outline)}.
    Headline: ${headline}.
    Signal: ${dossier.topic}.
    
    TONE DIRECTIVE: ${verdict.tone_directives}.
    AUDIENCE: ${audience} (Adjust complexity accordingly).
    
    ${STYLE_INSTRUCTION}
    ADDITIONAL BANNED WORDS: ${bannedList}

    Include:
    - Body text (Adhere strictly to style guide).
    - Footnotes (Use these for dry humor or technical specs).
    - Citations from dossier claims.
    `,
    config: {
      temperature: temperature,
      systemInstruction: `You are the Lead Writer. You are elite, detached, and highly intelligent. 
      You do not 'explore' topics; you dissect them. 
      You are writing for an ${audience} audience.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          body: { type: Type.ARRAY, items: { type: Type.STRING } },
          footnotes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: {type:Type.STRING}, ref:{type:Type.STRING}, text:{type:Type.STRING}, type:{type:Type.STRING} } } },
          pull_quote: { type: Type.STRING },
          citations: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { source: {type:Type.STRING}, confidence: {type:Type.NUMBER} } } },
          img_prompt: { type: Type.STRING },
          img_caption: { type: Type.STRING },
          category: { type: Type.STRING }
        }
      }
    }
  });
  
  const raw = cleanAndParseJSON(response.text);
  return { 
    id: dossier.id, 
    signal_id: dossier.id, 
    placement: verdict.placement,
    status: 'REVIEW',
    headline: headline,
    deck: outline.lead, // Use lead as deck for now
    topic: verdict.assigned_topic || 'CULTURE',
    format: verdict.assigned_format || 'ESSAY',
    media_type: verdict.primary_media || 'TEXT',
    ...raw 
  };
};
