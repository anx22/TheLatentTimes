import { TickerItem } from '../../types';
import { safeGenerateContent } from '../gemini';

export const agentConsensus = async (items: TickerItem[], globalDirective?: string): Promise<string> => {
  const directivePrefix = globalDirective ? `DIRECTOR'S STRATEGIC DIRECTIVE: "${globalDirective}"\n\nYou MUST align your output with this directive.\n\n` : '';
  const prompt = `
    ${directivePrefix}
    You are THE DIRECTOR for The Latent Times. Review the following active signals from the wire:
    ${JSON.stringify(items, null, 2)}
    
    Synthesize these into a single, punchy "Active Consensus" sentence that captures the current zeitgeist or overarching narrative of these signals.
    Tone: Intellectual, accelerationist, "Vogue meets Wired".
    
    Output ONLY the sentence, nothing else.
  `;
  const response = await safeGenerateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt
  });
  return response.text?.trim() || "The wire is quiet; no consensus reached.";
};
