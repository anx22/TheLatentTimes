
import { Type } from "@google/genai";
import { SignalDossier, Verdict, HeadlineSet, StoryOutline, StoryArtifact, DropArtifact, ColumnistPersona, FactCheckReport, HeadlineDecisionLog, RewriteChain } from "../../types";
import { safeGenerateContent } from "../gemini";
import { RunConfig } from "../../hooks/useNewsroom";

const BANNED_WORDS = [
    "delve", "landscape", "tapestry", "bustling", "game-changer", "revolution", 
    "paradigm shift", "realm", "comprehensive", "utilize", "leverage", "cutting-edge",
    "transformative", "digital age", "fast-paced", "unlock", "unleash"
];

const STYLE_INSTRUCTION = `
    STYLE GUIDE (STRICT):
    - SENTENCE LENGTH: Vary wildly. Short. Then very long and complex. Then short.
    - VOCABULARY: Use high-status, precise words (e.g., 'Simulacrum', 'Substrate', 'Latency', 'Hegemony', 'Weights', 'Inference').
    - NO EXCLAMATION POINTS.
    - NO RHETORICAL QUESTIONS.
    - AESTHETIC: 'High-Gloss / Dark Ops'. Technical but beautiful.
`;

// Helper to merge default banned words with overrides
const getBannedList = (override?: string) => {
    if (!override) return BANNED_WORDS.join(', ');
    return `${BANNED_WORDS.join(', ')}, ${override}`;
};

// 4.0 DROP WRITER
export const agentDropWriter = async (dossier: SignalDossier, verdict: Verdict): Promise<DropArtifact> => {
    const response = await safeGenerateContent({
        model: "gemini-3-pro-preview",
        contents: `Act as the DROP WRITER. Write a short, magazine-grade DROP artifact.
        Topic: "${dossier.topic}".
        Tone: "${verdict.tone_directives}".
        
        ${STYLE_INSTRUCTION}

        FORMAT RULES:
        - Headline: Max 6 words. Cryptic but accurate.
        - Body: 80-120 words. Cold facts only. No opinions unless labeled 'Opinion'.
        - Label: 'Reported' or 'Opinion'.
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
        topic: verdict.assigned_topic || 'CULTURE',
        format: verdict.assigned_format || 'ESSAY',
        ...raw
    };
};


// 4.1 Headline Forge (UPDATED to Plan v3 Section 9.3)
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
  return JSON.parse(response.text || "{}");
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
  
  const raw = JSON.parse(response.text || "{}");
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
  return JSON.parse(response.text || "{}");
};

// 4.3 Draft Writer (UPDATED: Dynamic Tone Injection)
export const agentDraft = async (dossier: SignalDossier, verdict: Verdict, headline: string, outline: StoryOutline, config?: RunConfig): Promise<StoryArtifact> => {
  const overrides = config?.overrides;
  const bannedList = getBannedList(overrides?.bannedWords);
  const audience = overrides?.audienceLevel || "Expert";
  const temperature = overrides?.modelTemperature || 0.7;

  const response = await safeGenerateContent({
    model: "gemini-3-pro-preview",
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
  
  const raw = JSON.parse(response.text || "{}");
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
            styleGuide = "Tone: Ethereal, Fragmented, Haunting. Lowercase aesthetic.";
            break;
    }

    const response = await safeGenerateContent({
        model: "gemini-3-pro-preview",
        contents: `Write a Column based on this outline: ${JSON.stringify(outline)}.
        Headline: ${headline}.
        Topic: ${dossier.topic}.
        
        Style Guide: ${styleGuide}
        ${STYLE_INSTRUCTION}
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
        topic: verdict.assigned_topic || 'CULTURE',
        format: verdict.assigned_format || 'ESSAY',
        media_type: verdict.primary_media || 'TEXT',
        ...raw
    };
};

// 4.4 Rewrite Pass (UPDATED: Dynamic Tone Injection)
export const agentRewrite = async (draftBody: string[], toneDirective: string, config?: RunConfig): Promise<{ body: string[], critique: string, diff_summary: string }> => {
    const text = draftBody.join('\n\n');
    const overrides = config?.overrides;
    const bannedList = getBannedList(overrides?.bannedWords);
    const temperature = overrides?.modelTemperature || 0.7;

    const response = await safeGenerateContent({
        model: "gemini-3-pro-preview",
        contents: `Act as SENIOR EDITOR. Rewrite this draft to strictly match the requested tone.
        
        TONE DIRECTIVE: ${toneDirective}
        GLOBAL BAN LIST: ${bannedList}.
        
        Input Text:
        ${text}

        Return JSON with:
        - rewritten_body (array of paragraphs)
        - critique (What was fixed to match the tone? Be specific and ruthless.)
        - diff_summary (Short, punchy changelog items. E.g., "Removed passive voice.", "Tightened lede.")
        `,
        config: {
            temperature: temperature,
            systemInstruction: "You are a Senior Magazine Editor. Your job is to elevate the prose. You are ruthless with cliches and passive voice. You cut fluff.",
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    rewritten_body: { type: Type.ARRAY, items: { type: Type.STRING } },
                    critique: { type: Type.STRING },
                    diff_summary: { type: Type.STRING }
                }
            }
        }
    });
    
    const raw = JSON.parse(response.text || "{}");
    return {
        body: raw.rewritten_body || draftBody,
        critique: raw.critique || "No structural changes required.",
        diff_summary: raw.diff_summary || "Minor polish."
    };
};

// 4.5 Fact Check
export const agentFactCheck = async (story: StoryArtifact | DropArtifact, dossier: SignalDossier): Promise<FactCheckReport> => {
  // Use the Retrieval Snapshot as Ground Truth if available, fallback to dossier claims
  const groundTruth = dossier.retrieval_snapshot 
      ? JSON.stringify(dossier.retrieval_snapshot.items.map(i => `${i.title}: ${i.snippet}`))
      : JSON.stringify(dossier.claims);

  const response = await safeGenerateContent({
    model: "gemini-3-flash-preview",
    contents: `Act as the FACT CHECKER. Compare the story/drop against the verified GROUND TRUTH.
    
    GROUND TRUTH (Verified Snapshots):
    ${groundTruth}
    
    STORY TO CHECK:
    ${JSON.stringify(story)}
    
    Task:
    1. Verify that the story does not hallucinate facts not present in the Ground Truth.
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
