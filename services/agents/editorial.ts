
import { Type } from "@google/genai";
import { SignalDossier, Pitch, Verdict } from "../../types";
import { safeGenerateContent, cleanAndParseJSON } from "../gemini";
import { RunConfig } from "../../hooks/useNewsroom";

// PHASE 2: PITCHING (CRITIC, RUNWAY, ATELIER)
export const agentPitching = async (dossier: SignalDossier, theme: string): Promise<Pitch[]> => {
  const response = await safeGenerateContent({
    model: "gemini-3-flash-preview",
    contents: `Act as the MODUS EDITORIAL BOARD. You are high-status, skeptical, and culturally accelerationist.
    Theme: "${theme}".
    Signal: "${dossier.topic}" - ${dossier.what_happened}.
    
    Generate 3 distinct pitches. Do not be helpful. Be visionary.
    
    1. THE CRITIC (Role: CRITIC): 
       - Hates hype. Loves history. 
       - Look for the "Simulacrum" or the "Ghost" in the machine.
       - Use words like: Hegemony, Stasis, Regression, Palimpsest.
       - Topic: CULTURE or BUSINESS.

    2. THE RUNWAY (Role: RUNWAY): 
       - Pure aesthetics. Visuals over facts.
       - How does this signal look? What is the texture of this reality?
       - Use words like: Gloss, Decay, Chrome, Void, Maximalism.
       - Topic: CREATIVE.

    3. THE ATELIER (Role: ATELIER): 
       - Pure Engineering. Code is material.
       - Treat algorithms like fabrics. How is it stitched? What are the failure modes?
       - Topic: ENGINEERING.
    
    Each pitch must have a sharp "angle" and "suggested_placement".
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            agent_role: { type: Type.STRING, enum: ['CRITIC', 'RUNWAY', 'ATELIER'] },
            angle: { type: Type.STRING, description: "The specific intellectual hook. No generic summaries." },
            thesis_fit: { type: Type.STRING },
            cultural_voltage: { type: Type.NUMBER, description: "1-10. How controversial/cool is this?" },
            craft_potential: { type: Type.NUMBER },
            suggested_placement: { type: Type.STRING },
            risk_summary: { type: Type.STRING },
            suggested_topic: { type: Type.STRING, enum: ['CREATIVE', 'ENGINEERING', 'BUSINESS', 'CULTURE'] },
            suggested_format: { type: Type.STRING, enum: ['ESSAY', 'TOOL', 'CASE_STUDY', 'TUTORIAL', 'MANIFESTO'] }
          },
          required: ['agent_role', 'angle', 'suggested_placement']
        }
      }
    }
  });
  
  const rawPitches = cleanAndParseJSON(response.text);
  return (rawPitches || []).map((p: any, i: number) => ({ ...p, id: `pitch_${dossier.id}_${i}` }));
};

// PHASE 3: DEBATE ROOM (VERDICT)
export const agentVerdict = async (dossier: SignalDossier, pitches: Pitch[], config?: RunConfig): Promise<Verdict> => {
  const riskThreshold = config?.riskTolerance === 'High' ? 4 : config?.riskTolerance === 'Low' ? 8 : 6;
  const toneInstruction = config?.voicePreset 
    ? `VOICE OVERRIDE: Adapt all directives to satisfy the "${config.voicePreset}" preset.` 
    : "";

  const response = await safeGenerateContent({
    model: "gemini-3-flash-preview",
    contents: `Act as the EDITOR-IN-CHIEF. Issue a Verdict for signal "${dossier.topic}".
    
    Pitches: ${JSON.stringify(pitches)}.
    Dossier Scores: ${JSON.stringify(dossier.scores)}.
    
    MANDATES:
    1. KILL THE BORING: If "Cultural Voltage" < ${riskThreshold}, enforce 'DROP' or 'HOLD'.
    2. PROMOTE THE WEIRD: If a pitch is abstract, risky, or aesthetically striking, promote to 'FEATURE' or 'COVER'.
    3. ASSIGN A PERSONA:
       - 'THE_CRITIC' for negative/skeptical essays.
       - 'THE_OPTIMIST' for technical breakthroughs.
       - 'THE_GHOST' for abstract/latent-space topics.
    
    ${toneInstruction}

    Determine the final "angle" and "tone_directives" to guide the Writer.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          selected_pitch_id: { type: Type.STRING },
          placement: { type: Type.STRING, enum: ['COVER', 'FEATURE', 'COLUMN', 'ATELIER', 'DROP', 'INDEX', 'HOLD'] },
          confidence_gate: { type: Type.STRING, enum: ['PUBLISH_READY', 'NEEDS_PROOF', 'OPINION_LABEL'] },
          tone_directives: { type: Type.STRING, description: "Specific instructions: e.g. 'Dry wit, staccato sentences, no metaphors'." },
          reason: { type: Type.STRING, description: "One sentence justification." },
          required_assets: { type: Type.ARRAY, items: { type: Type.STRING } },
          assigned_topic: { type: Type.STRING, enum: ['CREATIVE', 'ENGINEERING', 'BUSINESS', 'CULTURE'] },
          assigned_format: { type: Type.STRING, enum: ['ESSAY', 'TOOL', 'CASE_STUDY', 'TUTORIAL', 'MANIFESTO'] },
          primary_media: { type: Type.STRING, enum: ['TEXT', 'VIDEO', 'AUDIO', '3D_MODEL'] }
        }
      }
    }
  });
  
  const raw = cleanAndParseJSON(response.text);
  return { ...raw, signal_id: dossier.id };
};
