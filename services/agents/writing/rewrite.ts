import { Type } from "@google/genai";
import { safeGenerateContent, cleanAndParseJSON } from "../../gemini";
import { RunConfig } from "../../../hooks/useNewsroom";
import { getBannedList, formatToneInstruction } from "./constants";
import { ToneProfile } from "../../../types";

export const agentRewrite = async (draftBody: string[], toneDirective: string, config?: RunConfig, targetProfile?: ToneProfile): Promise<{ body: string[], critique: string, structured_critique: any[], diff_summary: string, tone_profile: ToneProfile }> => {
    const text = draftBody.join('\n\n');
    const overrides = config?.overrides;
    const bannedList = getBannedList(overrides?.bannedWords);
    const temperature = overrides?.modelTemperature || 0.7;
    
    const toneLogic = formatToneInstruction(targetProfile);

    const response = await safeGenerateContent({
        model: "gemini-3-pro-preview", // RESTORED TO PRO
        contents: `Act as SENIOR EDITOR. Rewrite this draft to strictly match the requested tone.
        
        TONE DIRECTIVE: ${toneDirective}
        ${toneLogic}
        GLOBAL BAN LIST: ${bannedList}.
        
        Input Text:
        ${text}

        Return JSON with:
        - rewritten_body (array of paragraphs)
        - critique (General assessment of the draft)
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
    
    const raw = cleanAndParseJSON(response.text);
    return {
        body: raw.rewritten_body || draftBody,
        critique: raw.critique || "No structural changes required.",
        structured_critique: [], // Optimized out for speed to prevent index-matching latency
        diff_summary: raw.diff_summary || "Minor polish.",
        tone_profile: targetProfile || { drama: 3, precision: 3, metaphor_density: 3, adjective_budget: 50, sentence_mode: 'MIXED' }
    };
};