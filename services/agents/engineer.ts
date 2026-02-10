
import { Type } from "@google/genai";
import { SignalDossier, RecipeArtifact } from "../../types";
import { safeGenerateContent } from "../gemini";

// PHASE 5.1: ENGINEER GENERATOR
export const agentEngineer = async (dossier: SignalDossier): Promise<RecipeArtifact> => {
  const response = await safeGenerateContent({
    model: "gemini-3-flash-preview",
    contents: `Act as THE ATELIER ENGINEER. Create a generative recipe for "${dossier.topic}".
    Identify specific tools (ComfyUI, Midjourney, etc) and parameters.
    List failure modes.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          intent: { type: Type.STRING },
          ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
          params: { type: Type.OBJECT, additionalProperties: true },
          steps: { type: Type.ARRAY, items: { type: Type.STRING } },
          failure_modes: { type: Type.ARRAY, items: { type: Type.STRING } },
          warning: { type: Type.STRING }
        }
      }
    }
  });
  
  const raw = JSON.parse(response.text || "{}");
  return { ...raw, id: `recipe_${dossier.id}` };
};

// PHASE 5.2: RECIPE VALIDATOR
export const agentRecipeValidator = async (recipe: RecipeArtifact): Promise<{ valid: boolean; issues: string[]; adjusted_params?: Record<string, string> }> => {
  const response = await safeGenerateContent({
    model: "gemini-3-flash-preview",
    contents: `Act as the QUALITY ASSURANCE LEAD. Validate this generative recipe:
    ${JSON.stringify(recipe)}
    Check:
    1. Do the parameters match the tools (ingredients)? e.g. "--v 6.1" is for Midjourney, "cfg" is for Stable Diffusion.
    2. Are the steps logical?
    If invalid, provide fixed parameters.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          valid: { type: Type.BOOLEAN },
          issues: { type: Type.ARRAY, items: { type: Type.STRING } },
          adjusted_params: { type: Type.OBJECT, additionalProperties: true }
        }
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

// PHASE 5.3: VARIATIONS GENERATOR
export const agentVariationsGenerator = async (recipe: RecipeArtifact): Promise<string[]> => {
  const response = await safeGenerateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on the recipe "${recipe.title}", generate 3 distinct stylistic variation names (e.g. "Noir Mode", "Pastel Glitch", "Raw Photo").`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });
  
  return JSON.parse(response.text || "[]");
};
