
import { Type } from "@google/genai";
import { SignalDossier, RecipeArtifact } from "../../types";
import { safeGenerateContent } from "../gemini";

// PHASE 5.1: ENGINEER GENERATOR
export const agentEngineer = async (dossier: SignalDossier): Promise<RecipeArtifact> => {
  const response = await safeGenerateContent({
    model: "gemini-3-flash-preview",
    contents: `Act as THE ATELIER ENGINEER. Create a "Pattern Kit" or "Workflow Recipe" for the topic: "${dossier.topic}".
    
    The output should be a usable "Agentic Pattern" or "Tool Kit" (e.g. "Viral Hook Pattern", "Reasoning Loop", "Style Transfer Workflow").
    
    Identify:
    - Ingredients (Models, APIs, Frameworks)
    - Parameters (System Prompts, Temperatures, Constraints)
    - Steps (The logic flow)
    - Failure Modes (Where it breaks)
    `,
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
    contents: `Act as the QUALITY ASSURANCE LEAD. Validate this agentic recipe:
    ${JSON.stringify(recipe)}
    Check:
    1. Do the parameters match the tools?
    2. Is the logic circular or sound?
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
    contents: `Based on the recipe "${recipe.title}", generate 3 distinct variation names (e.g. "Aggressive Mode", "Strict Logic Mode", "Creative Lateral Mode").`,
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
