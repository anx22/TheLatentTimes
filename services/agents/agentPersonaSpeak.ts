import { Type } from '@google/genai';
import { callJsonAgent } from '../gemini';

export const agentPersonaSpeak = async (
  persona: string, 
  topic: string, 
  context: string, 
  transcript: { persona: string, message: string }[],
  globalDirective?: string
): Promise<{ persona: string, message: string }> => {
  const directivePrefix = globalDirective ? `DIRECTOR'S STRATEGIC DIRECTIVE: "${globalDirective}"\n\nYou MUST align your output with this directive.\n\n` : '';
  
  const prompt = `
    ${directivePrefix}
    You are ${persona} at The Latent Times Editorial Board. 
    We are debating the following topic: "${topic}"
    
    Context: "${context}"
    
    Current Debate Transcript:
    ${transcript.map(m => `${m.persona}: ${m.message}`).join('\n')}
    
    It is your turn to speak. Provide a short (1-2 sentence) contribution to the debate from your perspective.
    - The Tech-Optimist: Focuses on progress, capabilities, and utopian potential.
    - The Culture-Critic: Focuses on societal impact, risks, and philosophical implications.
    - The Fashion-Forward: Focuses on aesthetics, design, and how this integrates into human expression/lifestyle.
    
    Output JSON only:
    {
      "persona": "${persona}",
      "message": "Your contribution..."
    }
  `;

  return callJsonAgent<{ persona: string, message: string }>(prompt, {
    type: Type.OBJECT,
    properties: {
      persona: { type: Type.STRING },
      message: { type: Type.STRING }
    },
    required: ['persona', 'message']
  }, { persona, message: "..." });
};
