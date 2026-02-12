
import { Type } from "@google/genai";
import { SignalDossier, StoryArtifact, DropArtifact, FactCheckReport } from "../../../types";
import { safeGenerateContent, cleanAndParseJSON } from "../../gemini";

export const agentFactCheck = async (story: StoryArtifact | DropArtifact, dossier: SignalDossier): Promise<FactCheckReport> => {
  // Use the Retrieval Snapshot as Ground Truth if available, fallback to dossier claims
  const groundTruth = dossier.retrieval_snapshot 
      ? JSON.stringify(dossier.retrieval_snapshot.items.map(i => `${i.title}: ${i.snippet}`))
      : JSON.stringify(dossier.claims);

  const response = await safeGenerateContent({
    model: "gemini-3-flash-preview",
    contents: `Act as the FACT CHECKER. Compare the story/drop against the verified GROUND TRUTH.
    
    GROUND TRUTH (Verified Snapshots):
    ${groundTruth}
    
    STORY TO CHECK:
    ${JSON.stringify(story)}
    
    Task:
    1. Verify that the story does not hallucinate facts not present in the Ground Truth.
    2. Ensure citations are grounded.
    
    Return JSON.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          approved: { type: Type.BOOLEAN },
          issues: { type: Type.ARRAY, items: { type: Type.STRING } },
          corrections: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });
  
  return cleanAndParseJSON(response.text);
};
