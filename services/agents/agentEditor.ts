import { DraftBlock, BlockAnnotation } from '../../types';
import { callJsonAgent, Schemas } from '../gemini';

export const agentEditor = async (blocks: DraftBlock[], context: string, lens: string, globalDirective?: string, missionId?: string): Promise<BlockAnnotation[]> => {
  const directivePrefix = globalDirective ? `DIRECTOR'S STRATEGIC DIRECTIVE: "${globalDirective}"\n\nYou MUST align your output with this directive.\n\n` : '';
  const prompt = `
    ${directivePrefix}
    You are THE EDITORIAL BOARD for The Latent Times, a high-fashion, accelerationist magazine.
    Your job is to act as a KI-Linter. Review the following draft blocks against the provided context and editorial lens.
    
    Context: "${context}"
    Lens: "${lens}"
    
    Draft Blocks:
    ${JSON.stringify(blocks, null, 2)}
    
    Identify specific sentences (or entire blocks) that need improvement. 
    
    SIMULATE A HEATED EDITORIAL DEBATE between the following three personas:
    1. THE CRITIC: An avant-garde cultural editor. Seeks to elevate the prose beyond the industry standard, demanding poetic precision, the 'Wort-Bild-Schere', and unexpected cultural synthesis.
    2. THE TECHNOLOGIST: A cynical systems architect. Demands clinical accuracy, preferring to expose the cold hard metal of the narrative rather than relying on hand-wavy metaphors.
    3. THE ACCELERATIONIST: A provocative philosopher. Seeks to push the underlying thesis into uncomfortable, systemic truths about scale, speed, and societal momentum.

    For each issue found, specify which persona is raising the concern. 
    We want conflicting opinions. If one block uses assumed industry framing, THE CRITIC must dismantle it.
    
    Focus on:
    1. NARRATIVE ELEGANCE: Is the text relying on tired industry idioms? Elevate it to a higher cultural register.
    2. CLARITY: Are the technical concepts precise and grounded in reality?
    3. TONE_MISMATCH: Does it lack the refined, slightly detached, and highly observational tone of our publication?
    4. RHYTHM: Are the sentences carrying the weight they should? Fix clunky pacing.
    
    Output JSON only. Return an array of annotations.
    [
      {
        "id": "anno_1",
        "blockId": "b1",
        "sentenceId": "b1_s2",
        "persona": "The Critic",
        "type": "TONE_MISMATCH",
        "comment": "This metaphor is overly aggressive and leans into melodrama.",
        "suggestion": "Focus on the generative beauty instead."
      }
    ]
  `;

  return callJsonAgent<BlockAnnotation[]>(prompt, Schemas.Editor, [], missionId);
};
