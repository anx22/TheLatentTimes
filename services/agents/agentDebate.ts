import { EditorialAngle } from '../../types';
import { callJsonAgent, Schemas } from '../gemini';

export const agentDebate = async (topic: string, context: string, globalDirective?: string, transcript?: { persona: string, message: string }[], missionId?: string): Promise<{ transcript: { persona: string, message: string }[], angles: EditorialAngle[] }> => {
  const directivePrefix = globalDirective ? `DIRECTOR'S STRATEGIC DIRECTIVE: "${globalDirective}"\n\nYou MUST align your output with this directive.\n\n` : '';
  
  const transcriptSection = transcript ? `
    The debate has already happened. Here is the transcript:
    ${transcript.map(m => `${m.persona}: ${m.message}`).join('\n')}
    
    Based on this debate, generate exactly 3 distinct editorial angles, one for each of the following personas:
    1. The Critic
    2. The Technologist
    3. The Accelerationist
  ` : `
    First, generate a short debate transcript (3-4 messages total) strictly between the following 3 personas (no others allowed):
    1. The Critic (An avant-garde cultural editor: demands stylistic refinement, poetic tension, and unexpected cultural synthesis.)
    2. The Technologist (A cynical systems architect: demands clinical accuracy, preferring structural truths over superficial hype.)
    3. The Accelerationist (A provocative philosopher: seeks to push the underlying thesis into uncomfortable truths about societal momentum.)

    Then, generate exactly 3 distinct editorial angles, one for each of these personas. For each angle, provide 3 distinct headline options.
  `;

  const prompt = `
    ${directivePrefix}
    You are the The Latent Times Editorial Board ("Vogue meets Wired"). You need to debate how to cover the following technical signal in a highly refined, artistic, and sophisticated manner.
    Topic: "${topic}"
    Context: "${context}"

    ${transcriptSection}
    
    Output JSON only. The "angles" array must contain exactly 3 objects, corresponding to the 3 personas defined above.
    The headlines MUST be intellectual, stark, and free of typical marketing/tech-bro chatter. High aesthetic value.
    {
      "transcript": [
        { "persona": "The Critic", "message": "..." },
        { "persona": "The Technologist", "message": "..." }
      ],
      "angles": [
        {
          "id": "critic",
          "persona": "The Critic",
          "headline": "PRIMARY HEADLINE (AUSTERE, UPPERCASE)",
          "headlineOptions": ["Option 1", "Option 2", "Option 3"],
          "angle": "A 2-sentence description of the angle and why it works."
        },
        {
          "id": "technologist",
          "persona": "The Technologist",
          "headline": "PRIMARY HEADLINE (CLINICAL, UPPERCASE)",
          "headlineOptions": ["Option 1", "Option 2", "Option 3"],
          "angle": "A 2-sentence description of the angle and why it works."
        },
        {
          "id": "accelerationist",
          "persona": "The Accelerationist",
          "headline": "PRIMARY HEADLINE (PROVOCATIVE, UPPERCASE)",
          "headlineOptions": ["Option 1", "Option 2", "Option 3"],
          "angle": "A 2-sentence description of the angle and why it works."
        }
      ]
    }
  `;

  return callJsonAgent<{ transcript: { persona: string, message: string }[], angles: EditorialAngle[] }>(prompt, Schemas.Debate, { transcript: [], angles: [] }, missionId);
};
