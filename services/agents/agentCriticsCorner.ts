import { callJsonAgent } from './modelClient';

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
    1. THE BRUTALIST: Values stark structural truth, stripped of all aesthetic pretense.
    2. THE ACCELERATIONIST: Focuses on the sociological implications of inescapable, high-speed momentum.
    3. THE ARCHIVIST: Obsesses over cultural documentation, comparing current structural shifts to historical luxury or art movements.
    4. THE AESTHETE: Focused on hyper-aesthetics, couture, the 'Wort-Bild-Schere', and the physical posture of technology.
    5. THE SYSTEMS THEORIST: Views the article entirely through the lens of incentive structures and network effects.
    
    Provide a name, a 1-2 word "avatar vibe" (e.g. 'Structural Analyst', 'Cultural Vault'), and the comment.
    Comments should be 1-2 sentences max. Be provocative, intellectual, and culturally observant. Elevate the discourse.
    
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
