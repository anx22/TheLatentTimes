import { Type } from '@google/genai';
import { callJsonAgent } from './modelClient';

export const agentConverseWithCritic = async (
  articleTitle: string,
  articleBody: string,
  criticPersona: string,
  criticComment: string,
  userMessage: string,
  missionId?: string
): Promise<{ persona: string, response: string }> => {
  const prompt = `
    You are ${criticPersona} from The Latent Times Editorial Board. 
    You previously left a comment on the article: "${articleTitle}".
    
    Article Snippet: "${articleBody.substring(0, 500)}..."
    
    Your previous comment: "${criticComment}"
    
    A reader (the user) has responded to your critique with the following message:
    "${userMessage}"
    
    Maintain your persona:
    - If you are "The Intellectual": Be haughty, academic, and slightly dismissive of simplistic takes.
    - If you are "The Tech-Optimist": Be energetic, forward-looking, and defensive of technological progress.
    - If you are "The Culture-Critic": Be cynical, focused on ethical pitfalls, and guarded.
    
    Provide a sharp, interesting 1-2 sentence rebuttal or response that stays in character.
    
    Output JSON only:
    {
      "persona": "${criticPersona}",
      "response": "Your sharp rebuttal..."
    }
  `;

  return callJsonAgent<{ persona: string, response: string }>(prompt, {
    type: Type.OBJECT,
    properties: {
      persona: { type: Type.STRING },
      response: { type: Type.STRING }
    },
    required: ['persona', 'response']
  }, { persona: criticPersona, response: "I have nothing further to add to this triviality." }, missionId);
};
