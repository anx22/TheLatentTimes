
import { Type } from "@google/genai";
import { StoryArtifact, ImageBrief, ColumnistPersona, LayoutDirectives } from "../../types";
import { safeGenerateContent } from "../gemini";

// PHASE 9: IMAGE BRIEF AGENT
export const agentImageBrief = async (story: StoryArtifact): Promise<ImageBrief> => {
  let styleGuidance = "High-fashion editorial, Vogue Italia aesthetic, cinematic lighting, grain.";
  
  if (story.author_persona === 'THE_GHOST') {
      styleGuidance = "Glitch art, latent space interpolation, datamoshing, ethereal, abstract, ghostly figures.";
  } else if (story.author_persona === 'THE_OPTIMIST') {
      styleGuidance = "Solarpunk, bright, clean lines, futuristic, optimistic, high saturation, crystalline.";
  } else if (story.author_persona === 'THE_CRITIC') {
      styleGuidance = "Brutalist, monochrome, high contrast, architectural, grainy, serious.";
  }

  const response = await safeGenerateContent({
    model: "gemini-3-flash-preview",
    contents: `Act as the ART DIRECTOR. Create a visual brief for this story:
    Headline: "${story.headline}"
    Deck: "${story.deck}"
    Persona Style: ${styleGuidance}
    
    Task:
    1. Define a core "Visual Metaphor" that represents the story abstractly.
    2. Define a "Technical Prompt" optimized for Flux.1 or Midjourney V6.
    
    Return JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          concept: { type: Type.STRING },
          visual_metaphor: { type: Type.STRING },
          color_palette: { type: Type.STRING },
          composition: { type: Type.STRING },
          technical_prompt: { type: Type.STRING, description: "Detailed generative prompt including --params" }
        }
      }
    }
  });

  const raw = JSON.parse(response.text || "{}");
  
  return {
    concept: "Abstract Data Visualization",
    visual_metaphor: "A network of light",
    color_palette: "Monochrome",
    composition: "Center weighted",
    technical_prompt: "High fashion editorial photography, abstract concept --v 6.1",
    ...raw
  };
};

// PHASE 10: LAYOUT INTELLIGENCE (Art Director)
export const agentLayoutDirectives = async (story: StoryArtifact): Promise<LayoutDirectives> => {
    const response = await safeGenerateContent({
        model: "gemini-3-flash-preview",
        contents: `Act as the ART DIRECTOR. Assign a Layout Strategy for this story.
        Headline: "${story.headline}"
        Persona: "${story.author_persona || 'Standard'}"
        Placement: "${story.placement}"

        DESIGN GUIDELINES:
        - "THE_CRITIC" => MINIMAL template, CENTER alignment, STANDARD scale.
        - "THE_OPTIMIST" => IMMERSIVE template, LEFT alignment, MASSIVE scale.
        - "THE_GHOST" => EDITORIAL template, LEFT alignment, DISPLAY scale.
        - Standard Features => EDITORIAL template, SPLIT_RIGHT position.
        
        Return JSON.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    template: { type: Type.STRING, enum: ['MINIMAL', 'EDITORIAL', 'IMMERSIVE'] },
                    headline_scale: { type: Type.STRING, enum: ['STANDARD', 'MASSIVE', 'DISPLAY'] },
                    hero_position: { type: Type.STRING, enum: ['TOP', 'SPLIT_RIGHT', 'BACKGROUND'] },
                    alignment: { type: Type.STRING, enum: ['LEFT', 'CENTER'] },
                    drop_cap: { type: Type.BOOLEAN }
                }
            }
        }
    });

    return JSON.parse(response.text || `{"template": "EDITORIAL", "headline_scale": "STANDARD", "hero_position": "TOP", "alignment": "LEFT", "drop_cap": true}`);
};
