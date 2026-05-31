import { Signal } from '../../types';
import { callJsonAgent, Schemas } from '../gemini';

export const agentConsensus = async (items: Signal[], globalDirective?: string, missionId?: string): Promise<string> => {
  const directivePrefix = globalDirective ? `DIRECTOR'S STRATEGIC DIRECTIVE: "${globalDirective}"\n\nYou MUST align your output with this directive.\n\n` : '';
  const prompt = `
    ${directivePrefix}
    You are THE DIRECTOR for The Latent Times. Review the following active signals from the wire:
    ${JSON.stringify(items.map(({ embedding, content, ...rest }) => ({
      ...rest,
      contentSnippet: content ? (content.substring(0, 400) + '...') : undefined
    })), null, 2)}
    
    Synthesize these into a single, punchy "Active Consensus" sentence that captures the current zeitgeist or overarching narrative of these signals.
    Tone: Highly intellectual, culturally observant, pairing technical reality with sophisticated narrative framing.
    
    Output JSON:
    {
      "consensus": "The synthesized sentence.",
      "confidence": 0.95
    }
  `;

  const result = await callJsonAgent<{ consensus: string, confidence: number }>(
    prompt, 
    Schemas.Consensus, 
    { consensus: "The wire is quiet; no consensus reached.", confidence: 0 }, 
    missionId
  );

  return result.consensus;
};
