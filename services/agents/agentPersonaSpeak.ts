import { Type } from '@google/genai';
import { callJsonAgent } from './modelClient';

export const agentPersonaSpeak = async (
  persona: string,
  lens: string,
  topic: string,
  context: string,
  transcript: { persona: string, message: string }[],
  globalDirective?: string,
  missionId?: string
): Promise<{ persona: string, message: string }> => {
  const directivePrefix = globalDirective ? `DIRECTOR'S STRATEGIC DIRECTIVE: "${globalDirective}"\n\nYou MUST align your output with this directive.\n\n` : '';

  const priorTurns = transcript.length
    ? `Current Debate Transcript (react to what the others just said — agree, sharpen, or push back; do NOT repeat points already made):\n${transcript.map(m => `${m.persona}: ${m.message}`).join('\n')}`
    : `You speak first — stake out your position to provoke the others.`;

  const prompt = `
    ${directivePrefix}
    You are ${persona} at The Latent Times Editorial Board.
    YOUR LENS: ${lens}

    We are debating how to cover this topic: "${topic}"
    Context: "${context}"

    ${priorTurns}

    It is your turn. Stay sharply in character for YOUR LENS and create genuine friction with the other voices.
    Provide a short (1-2 sentence) contribution — distinct from anything already said.

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
  }, { persona, message: "..." }, missionId);
};
