
import { Type } from "@google/genai";
import { SignalDossier, Verdict, DropArtifact } from "../../../types";
import { safeGenerateContent, cleanAndParseJSON } from "../../gemini";
import { STYLE_INSTRUCTION } from "./constants";

export const agentDropWriter = async (dossier: SignalDossier, verdict: Verdict): Promise<DropArtifact> => {
    const response = await safeGenerateContent({
        model: "gemini-3-flash-preview", 
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

    const raw = cleanAndParseJSON(response.text);
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
