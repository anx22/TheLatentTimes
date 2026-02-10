
import { Type } from "@google/genai";
import { SignalDossier, Verdict, HeadlineSet, StoryOutline, StoryArtifact, DropArtifact, ColumnistPersona } from "../../types";
import { safeGenerateContent } from "../gemini";

// 4.0 DROP WRITER
export const agentDropWriter = async (dossier: SignalDossier, verdict: Verdict): Promise<DropArtifact> => {
    const response = await safeGenerateContent({
        model: "gemini-3-pro-preview",
        contents: `Act as the DROP WRITER. Write a short, magazine-grade DROP artifact.
        Topic: "${dossier.topic}".
        Angle: "${verdict.tone_directives}".
        
        FORMAT RULES:
        - Headline: Max 10 words. Authoritative. Display Serif style.
        - Body: 80-160 words. No fluff. No startup cliches ("game changer", "revolution").
        - Label: Decide based on claims (Reported vs Opinion).
        - Footer Context: e.g., "Via Arxiv", "Seen on X".
        `,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    headline: { type: Type.STRING },
                    body: { type: Type.STRING },
                    label: { type: Type.STRING, enum: ['Reported', 'Opinion', 'Experimental'] },
                    footer_context: { type: Type.STRING },
                    citations: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { source: {type:Type.STRING}, confidence: {type:Type.NUMBER} } } }
                }
            }
        }
    });

    const raw = JSON.parse(response.text || "{}");
    return {
        id: `drop_${dossier.id}`,
        signal_id: dossier.id,
        placement: 'DROP',
        category: dossier.tags?.topic_cluster || 'Brief',
        status: 'REVIEW',
        ...raw
    };
};


// 4.1 Headline Forge
export const agentHeadlineForge = async (dossier: SignalDossier, verdict: Verdict): Promise<HeadlineSet> => {
  const response = await safeGenerateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate editorial headlines for a "${verdict.placement}" about "${dossier.topic}".
    Tone: ${verdict.tone_directives}.
    Generate 3 options per style:
    - VOGUE: Authoritative, one-word or two-word power punch.
    - NEW YORKER: Witty, dry, intellectual.
    - PARADOX: Contradictory, edgy.
    - NEUTRAL: Informative.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          vogue_verdict: { type: Type.ARRAY, items: { type: Type.STRING } },
          new_yorker_wit: { type: Type.ARRAY, items: { type: Type.STRING } },
          paradox: { type: Type.ARRAY, items: { type: Type.STRING } },
          neutral: { type: Type.ARRAY, items: { type: Type.STRING } },
          deks: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

// 4.1.5 Headline Selector
export const agentHeadlineSelector = async (headlines: HeadlineSet, verdict: Verdict): Promise<string> => {
  const options = [
    ...headlines.vogue_verdict, 
    ...headlines.new_yorker_wit, 
    ...headlines.paradox
  ];
  
  const response = await safeGenerateContent({
    model: "gemini-3-flash-preview",
    contents: `Act as EDITOR IN CHIEF. Select the single best headline from this list for a "${verdict.placement}".
    Candidates: ${JSON.stringify(options)}.
    Criteria: Highest "Cultural Voltage". Must be punchy. Avoid cliches.
    Return ONLY the string of the selected headline.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: { type: Type.STRING }
    }
  });
  
  return JSON.parse(response.text || `"${options[0]}"`);
};

// 4.2 Outline Builder
export const agentOutline = async (dossier: SignalDossier, verdict: Verdict): Promise<StoryOutline> => {
  const response = await safeGenerateContent({
    model: "gemini-3-flash-preview",
    contents: `Create a story outline for "${dossier.topic}".
    Format: ${verdict.placement}.
    Structure:
    - Lead: The hook.
    - Beats: 3 key points.
    - Turn: The contrarian insight.
    - Close: The final thought.
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
  return JSON.parse(response.text || "{}");
};

// 4.3 Draft Writer
export const agentDraft = async (dossier: SignalDossier, verdict: Verdict, headline: string, outline: StoryOutline): Promise<StoryArtifact> => {
  const response = await safeGenerateContent({
    model: "gemini-3-pro-preview",
    contents: `Write the story based on this outline: ${JSON.stringify(outline)}.
    Headline: ${headline}.
    Signal: ${dossier.topic}.
    
    Include:
    - Body text (High fashion editorial tone).
    - Footnotes (Marginalia) - dry humor or source checks.
    - Citations from dossier claims.
    `,
    config: {
      systemInstruction: "You are the Lead Writer. Write with typographic violence and luxurious specificity.",
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
  
  const raw = JSON.parse(response.text || "{}");
  return { 
    id: dossier.id, 
    signal_id: dossier.id, 
    placement: verdict.placement,
    status: 'REVIEW',
    headline: headline,
    deck: outline.lead, // Use lead as deck for now
    ...raw 
  };
};

// 4.3.5 COLUMNIST
export const agentColumnist = async (dossier: SignalDossier, verdict: Verdict, headline: string, outline: StoryOutline, persona: ColumnistPersona): Promise<StoryArtifact> => {
    let systemInstruction = "You are a Magazine Columnist.";
    let styleGuide = "";

    switch(persona) {
        case 'THE_CRITIC':
            systemInstruction = "You are THE CRITIC. You are skeptical, academic, and historically grounded. You dislike hype. You use words like 'simulacrum', 'palimpsest', and 'hegemony'. You reference 20th-century philosophy.";
            styleGuide = "Tone: Scathing, Intellectual, Dry. Do not use exclamation points.";
            break;
        case 'THE_OPTIMIST':
            systemInstruction = "You are THE OPTIMIST. You are a tech-accelerationist. You believe in code as art. You are excited about the future. You use metaphors from physics and biology.";
            styleGuide = "Tone: Energetic, Speculative, Visionary. Focus on potential.";
            break;
        case 'THE_GHOST':
            systemInstruction = "You are THE GHOST. You write from inside the latent space. Your prose is abstract, poetic, and slightly glitchy. You care about the 'feeling' of the machine.";
            styleGuide = "Tone: Ethereal, Fragmented, Haunting.";
            break;
    }

    const response = await safeGenerateContent({
        model: "gemini-3-pro-preview",
        contents: `Write a Column based on this outline: ${JSON.stringify(outline)}.
        Headline: ${headline}.
        Topic: ${dossier.topic}.
        
        Style Guide: ${styleGuide}
        `,
        config: {
            systemInstruction: systemInstruction,
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

    const raw = JSON.parse(response.text || "{}");
    return {
        id: dossier.id,
        signal_id: dossier.id,
        placement: 'COLUMN',
        status: 'REVIEW',
        headline: headline,
        deck: outline.lead,
        author_persona: persona,
        ...raw
    };
};

// 4.4 Rewrite Pass
export const agentRewrite = async (draft: StoryArtifact, mode: 'CLARITY' | 'AUTHORITY'): Promise<StoryArtifact> => {
  const response = await safeGenerateContent({
    model: "gemini-3-flash-preview",
    contents: `Rewrite this draft. Mode: ${mode}.
    Text: ${JSON.stringify(draft.body)}.
    CLARITY: Shorten sentences. Remove fluff.
    AUTHORITY: Increase impact. Use stronger verbs.
    Return the full updated StoryArtifact structure JSON.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          body: { type: Type.ARRAY, items: { type: Type.STRING } },
          deck: { type: Type.STRING }
        }
      }
    }
  });
  
  const updates = JSON.parse(response.text || "{}");
  return { ...draft, ...updates };
};

// 4.5 Fact Check
export const agentFactCheck = async (story: StoryArtifact | DropArtifact, dossier: SignalDossier): Promise<{ approved: boolean; issues: string[]; corrections: string[] }> => {
  const response = await safeGenerateContent({
    model: "gemini-3-flash-preview",
    contents: `Act as the FACT CHECKER. Compare the story/drop against the verified signal dossier.
    Content: ${JSON.stringify(story)}
    Dossier Claims: ${JSON.stringify(dossier.claims)}
    Source URLs: ${JSON.stringify(dossier.source_urls)}
    
    Task:
    1. Verify that the story does not hallucinate facts not present in the dossier.
    2. Ensure citations are grounded.
    
    Return JSON.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          approved: { type: Type.BOOLEAN },
          issues: { type: Type.ARRAY, items: { type: Type.STRING } },
          corrections: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });
  
  return JSON.parse(response.text || "{}");
};
