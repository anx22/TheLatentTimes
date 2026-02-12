
import { Type } from "@google/genai";
import { SignalDossier, Verdict, StoryOutline, StoryArtifact, ColumnistPersona } from "../../../types";
import { safeGenerateContent } from "../../gemini";
import { STYLE_INSTRUCTION } from "./constants";

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
