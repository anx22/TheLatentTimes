
import { Type } from "@google/genai";
import { safeGenerateContent } from "../../gemini";
import { RunConfig } from "../../../hooks/useNewsroom";
import { getBannedList } from "./constants";

export const agentRewrite = async (draftBody: string[], toneDirective: string, config?: RunConfig): Promise<{ body: string[], critique: string, structured_critique: any[], diff_summary: string }> => {
    const text = draftBody.join('\n\n');
    const overrides = config?.overrides;
    const bannedList = getBannedList(overrides?.bannedWords);
    const temperature = overrides?.modelTemperature || 0.7;

    const response = await safeGenerateContent({
        model: "gemini-3-flash-preview", // OPTIMIZATION: Use Flash for Rewrite
        contents: `Act as SENIOR EDITOR. Rewrite this draft to strictly match the requested tone.
        
        TONE DIRECTIVE: ${toneDirective}
        GLOBAL BAN LIST: ${bannedList}.
        
        Input Text:
        ${text}

        Return JSON with:
        - rewritten_body (array of paragraphs)
        - critique (General assessment of the draft)
        - specific_changes (Array of objects with 'point' and 'paragraph_indices' indicating which paragraphs in the REWRITTEN version were significantly altered/improved)
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
                    specific_changes: { 
                        type: Type.ARRAY, 
                        items: { 
                            type: Type.OBJECT, 
                            properties: {
                                point: { type: Type.STRING },
                                paragraph_indices: { type: Type.ARRAY, items: { type: Type.NUMBER } }
                            }
                        } 
                    },
                    diff_summary: { type: Type.STRING }
                }
            }
        }
    });
    
    const raw = JSON.parse(response.text || "{}");
    return {
        body: raw.rewritten_body || draftBody,
        critique: raw.critique || "No structural changes required.",
        structured_critique: raw.specific_changes || [],
        diff_summary: raw.diff_summary || "Minor polish."
    };
};
