
import { Type } from "@google/genai";
import { SignalDossier, Verdict, HeadlineSet, HeadlineDecisionLog } from "../../../types";
import { safeGenerateContent, cleanAndParseJSON } from "../../gemini";

// 4.1 Headline Forge
export const agentHeadlineForge = async (dossier: SignalDossier, verdict: Verdict): Promise<HeadlineSet> => {
  const response = await safeGenerateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate editorial headlines for a "${verdict.placement}" about "${dossier.topic}".
    Tone Directive: ${verdict.tone_directives}.
    
    TASK: Generate 3 options per preset using these SYNTACTIC TEMPLATES:

    1. VOGUE (High-Gloss, Authoritative):
       - Template: "The [Noun] of [Noun]" (e.g., "The Architecture of Grief", "The Latent Space")
       - Template: "[Tech] is the New [Fashion]" (e.g., "Glitch is the New Rouge")
       - Template: One Word (e.g., "Protocol", "Weights")

    2. NEW YORKER (Witty, Specific):
       - Template: "The [Role]'s [Dilemma]" (e.g., "The Curator's Dilemma")
       - Template: "Why [Subject] is [Unexpected Action]"
       - Dry, intellectual, precise.

    3. PARADOX (Future Shock):
       - Template: "Post-[Concept]" (e.g., "Post-Authenticity")
       - Template: "[Concept] vs. [Concept]"
       - Contradictory, edgy, accelerationist.

    4. NEUTRAL (Index Style):
       - Just the facts. Clear and utilitarian. E.g. "Viral Hooks 101".

    Also generate:
    - COVER_LINE: Max statement. 3 words max.
    - SOCIAL_TEASER: A provocative statement for X/Twitter.
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
          deks: { type: Type.ARRAY, items: { type: Type.STRING } },
          functional_copy: {
              type: Type.OBJECT,
              properties: {
                  cover_line: { type: Type.STRING },
                  index_line: { type: Type.STRING },
                  social_teaser: { type: Type.STRING }
              }
          }
        }
      }
    }
  });
  return cleanAndParseJSON(response.text);
};

// 4.1.5 Headline Selector
export const agentHeadlineSelector = async (headlines: HeadlineSet, verdict: Verdict): Promise<{ selected: string; log: HeadlineDecisionLog }> => {
  const options = [
    ...headlines.vogue_verdict, 
    ...headlines.new_yorker_wit, 
    ...headlines.paradox
  ];
  
  const response = await safeGenerateContent({
    model: "gemini-3-flash-preview",
    contents: `Act as EDITOR IN CHIEF. Select the single best headline.
    Candidates: ${JSON.stringify(options)}.
    
    CRITERIA:
    1. PRIORITIZE RISK: Choose the headline that sounds most expensive/dangerous.
    2. AVOID CLICKBAIT: If it sounds like YouTube or Buzzfeed, reject it.
    3. PREFER ABSTRACT: "The Void" is better than "Why Vacuums Are Empty".
    4. PREFER SHORT: 3-5 words is the sweet spot.
    
    Return JSON with selection and reasoning.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
            selected_text: { type: Type.STRING },
            reasoning: { type: Type.STRING },
            cultural_voltage_score: { type: Type.NUMBER },
            risk_score: { type: Type.NUMBER }
        }
      }
    }
  });
  
  const raw = cleanAndParseJSON(response.text);
  const selected = raw.selected_text || options[0];
  
  return {
      selected,
      log: {
          candidate_id: `hl_dec_${Date.now()}`,
          selected_text: selected,
          rejected_candidates: options.filter(o => o !== selected),
          reasoning: raw.reasoning || "Selected for voltage.",
          cultural_voltage_score: raw.cultural_voltage_score || 5,
          risk_score: raw.risk_score || 0
      }
  };
};
