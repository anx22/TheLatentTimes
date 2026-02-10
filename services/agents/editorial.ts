
import { Type } from "@google/genai";
import { SignalDossier, Pitch, Verdict } from "../../types";
import { safeGenerateContent } from "../gemini";

// PHASE 2: PITCHING (CRITIC, RUNWAY, ATELIER)
export const agentPitching = async (dossier: SignalDossier, theme: string): Promise<Pitch[]> => {
  const response = await safeGenerateContent({
    model: "gemini-3-flash-preview",
    contents: `Act as the Editorial Board (Critic, Runway Editor, Atelier Engineer).
    Theme: "${theme}".
    Signal: "${dossier.topic}" - ${dossier.what_happened}.
    
    Generate 3 pitches (one from each perspective):
    1. CRITIC: Focus on cultural impact, philosophy, and critique.
    2. RUNWAY: Focus on aesthetics, fashion, and trends.
    3. ATELIER: Focus on craft, tooling, and how-to.
    
    Each pitch must have a specific "angle" and "suggested_placement".
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            agent_role: { type: Type.STRING, enum: ['CRITIC', 'RUNWAY', 'ATELIER'] },
            angle: { type: Type.STRING },
            thesis_fit: { type: Type.STRING },
            cultural_voltage: { type: Type.NUMBER },
            craft_potential: { type: Type.NUMBER },
            suggested_placement: { type: Type.STRING },
            risk_summary: { type: Type.STRING }
          },
          required: ['agent_role', 'angle', 'suggested_placement']
        }
      }
    }
  });
  
  const rawPitches = JSON.parse(response.text || "[]");
  return rawPitches.map((p: any, i: number) => ({ ...p, id: `pitch_${dossier.id}_${i}` }));
};

// PHASE 3: DEBATE ROOM (VERDICT)
export const agentVerdict = async (dossier: SignalDossier, pitches: Pitch[]): Promise<Verdict> => {
  const response = await safeGenerateContent({
    model: "gemini-3-flash-preview",
    contents: `Act as the RUNWAY EDITOR (Verdict Authority). Review these pitches for the signal "${dossier.topic}".
    Dossier Scores: ${JSON.stringify(dossier.scores)}.
    Pitches: ${JSON.stringify(pitches)}.
    
    RULES ENGINE:
    - DROP: Requires Novelty >= 3 AND Proof >= 2.
    - INDEX: If informative but low Novelty (< 3).
    - HOLD: If unclear or Needs Proof.
    - COVER/FEATURE: Only if Cultural Voltage >= 4.5.
    
    Issue a Verdict.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          selected_pitch_id: { type: Type.STRING },
          placement: { type: Type.STRING, enum: ['COVER', 'FEATURE', 'COLUMN', 'ATELIER', 'DROP', 'INDEX', 'HOLD'] },
          confidence_gate: { type: Type.STRING, enum: ['PUBLISH_READY', 'NEEDS_PROOF', 'OPINION_LABEL'] },
          tone_directives: { type: Type.STRING },
          reason: { type: Type.STRING, description: "One sentence justification." },
          required_assets: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });
  
  const raw = JSON.parse(response.text || "{}");
  return { ...raw, signal_id: dossier.id };
};
