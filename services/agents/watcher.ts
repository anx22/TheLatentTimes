
import { Type } from "@google/genai";
import { StoryArtifact, SignalDossier, Verdict, Proposal } from "../../types";
import { safeGenerateContent, cleanAndParseJSON } from "../gemini";

export const agentDriftWatcher = async (
    story: StoryArtifact, 
    dossier: SignalDossier, 
    verdict: Verdict
): Promise<{ 
    drift_score: number, 
    contradictions: string[], 
    tone_adherence: number,
    proposals: Proposal[] 
}> => {

    const facts = dossier.claims.map(c => `[${c.status}] ${c.text}`).join('\n');
    const tone = verdict.tone_directives;
    const body = story.body.join('\n');

    const response = await safeGenerateContent({
        model: "gemini-3-flash-preview",
        contents: `Act as the DRIFT WATCHER. Audit this story for Internal Consistency and Tone Adherence.
        
        INPUTS:
        1. GROUND TRUTH FACTS:
        ${facts}

        2. TONE DIRECTIVE (The Law):
        "${tone}"

        3. STORY DRAFT:
        ${body}

        TASKS:
        1. Identify any "Hallucinations" or Direct Contradictions against Ground Truth.
        2. Score Tone Adherence (0-100). Is it obeying the directive?
        3. Generate Proposals to fix issues.
        
        Return JSON.
        `,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    drift_score: { type: Type.NUMBER, description: "Composite score 0-100. High is good (No Drift)." },
                    contradictions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    tone_adherence: { type: Type.NUMBER, description: "0-100" },
                    proposals: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                label: { type: Type.STRING },
                                type: { type: Type.STRING, enum: ['REWRITE', 'FACT_CHECK', 'DROP_CLAIM'] },
                                impact: { type: Type.STRING },
                                scope: { type: Type.STRING, enum: ['BODY', 'HEADLINE'] },
                                risk_delta: { type: Type.NUMBER }
                            }
                        }
                    }
                }
            }
        }
    });

    const raw = cleanAndParseJSON(response.text);
    
    // Map raw proposals to robust objects
    const proposals: Proposal[] = (raw.proposals || []).map((p: any, i: number) => ({
        id: `prop_drift_${Date.now()}_${i}`,
        type: p.type || 'REWRITE',
        label: p.label || 'Fix detected drift',
        impact: p.impact || 'Drift correction',
        agent: 'EDITOR', // The Watcher delegates to Editor
        scope: p.scope || 'BODY',
        risk_delta: p.risk_delta || -5,
        confidence_delta: 10,
        cost_estimate: 'Low'
    }));

    return {
        drift_score: raw.drift_score || 85,
        contradictions: raw.contradictions || [],
        tone_adherence: raw.tone_adherence || 80,
        proposals
    };
};
