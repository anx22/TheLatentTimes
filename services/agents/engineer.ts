
import { Type } from "@google/genai";
import { SignalDossier, RecipeArtifact } from "../../types";
import { safeGenerateContent, cleanAndParseJSON } from "../gemini";

// PHASE 5.1: ENGINEER GENERATOR
export const agentEngineer = async (dossier: SignalDossier): Promise<RecipeArtifact> => {
  const response = await safeGenerateContent({
    model: "gemini-3-flash-preview",
    contents: `Act as THE ATELIER ENGINEER. Create a "Pattern Kit" or "Workflow Recipe" for the topic: "${dossier.topic}".
    
    The output should be a usable "Agentic Pattern" or "Tool Kit" (e.g. "Viral Hook Pattern", "Reasoning Loop", "Style Transfer Workflow").
    
    Identify:
    - Ingredients (Models, APIs, Frameworks)
    - Parameters (System Prompts, Temperatures, Constraints) -> Return as Key-Value pairs in 'param_list'.
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
          // FIXED: Use array of KV pairs instead of open object to prevent "properties should be non-empty" error
          param_list: { 
              type: Type.ARRAY, 
              items: { 
                  type: Type.OBJECT, 
                  properties: {
                      key: { type: Type.STRING },
                      value: { type: Type.STRING }
                  }
              } 
          },
          steps: { type: Type.ARRAY, items: { type: Type.STRING } },
          failure_modes: { type: Type.ARRAY, items: { type: Type.STRING } },
          warning: { type: Type.STRING }
        }
      }
    }
  });
  
  const raw = cleanAndParseJSON(response.text);
  
  // Transform kv list to object for the frontend
  const params: Record<string, string> = {};
  if (raw.param_list && Array.isArray(raw.param_list)) {
      raw.param_list.forEach((p: any) => {
          if (p.key) params[p.key] = p.value || "";
      });
  }

  return { ...raw, params, id: `recipe_${dossier.id}` };
};
