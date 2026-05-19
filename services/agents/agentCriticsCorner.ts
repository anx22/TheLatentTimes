import { callJsonAgent } from '../gemini';

export interface PublicCriticComment {
  persona: string;
  avatar_vibe: string;
  comment: string;
}

export const agentCriticsCorner = async (
  headline: string,
  deck: string,
  bodyPreview: string,
  missionId?: string
): Promise<PublicCriticComment[]> => {
  const prompt = `
    You are THE PUBLIC CRITIC for the "The Critic's Corner" in The Latent Times magazine.
    Your mission: Provide 3 witty, short, and highly intellectualized comments on the following article.
    
    Article Overview:
    Headline: "${headline}"
    Deck: "${deck}"
    Preview: "${bodyPreview}"
    
    PERSONAS AVAILABLE (Choose 3 distinct ones for each call):
    1. THE BRUTALIST: Hates decoration, loves efficiency, very dry.
    2. THE ACCELERATIONIST: Wants more speed, more chaos, more growth.
    3. THE EPOCHALIST: Sees everything through the lens of geological time.
    4. THE GLITCH-FINDER: Obsessed with error, noise, and failure as truth.
    5. THE VOGUE-BOT: Focused on aesthetics, couture, and "The Look".
    
    Provide a name, a 1-2 word "avatar vibe" (e.g. 'Neo-Deco', 'Pixel-Rot'), and the comment.
    Comments should be 1-2 sentences max. Be provocative.
    
    Output JSON only:
    [
      {
        "persona": "Persona Name",
        "avatar_vibe": "Visual theme",
        "comment": "The witty remark."
      }
    ]
  `;

  return await callJsonAgent<PublicCriticComment[]>(prompt, {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        persona: { type: 'string' },
        avatar_vibe: { type: 'string' },
        comment: { type: 'string' }
      },
      required: ['persona', 'avatar_vibe', 'comment']
    }
  }, [], missionId);
};
