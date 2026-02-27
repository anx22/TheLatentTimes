import { Type } from '@google/genai';
import { EditorialAngle } from '../../types';
import { callJsonAgent } from '../gemini';

export const agentDebate = async (topic: string, context: string, globalDirective?: string, transcript?: { persona: string, message: string }[]): Promise<{ transcript: { persona: string, message: string }[], angles: EditorialAngle[] }> => {
  const directivePrefix = globalDirective ? `DIRECTOR'S STRATEGIC DIRECTIVE: "${globalDirective}"\n\nYou MUST align your output with this directive.\n\n` : '';
  
  const transcriptSection = transcript ? `
    The debate has already happened. Here is the transcript:
    ${transcript.map(m => `${m.persona}: ${m.message}`).join('\n')}
    
    Based on this debate, generate 3 distinct editorial angles.
  ` : `
    First, generate a short debate transcript (3-4 messages total) between the following personas discussing the topic:
    1. The Tech-Optimist (Focuses on progress, capabilities, and utopian potential)
    2. The Culture-Critic (Focuses on societal impact, risks, and philosophical implications)
    3. The Fashion-Forward (Focuses on aesthetics, design, and how this integrates into human expression/lifestyle)

    Then, generate 3 distinct editorial angles for this story from those 3 personas.
  `;

  const prompt = `
    ${directivePrefix}
    You are the The Latent Times Editorial Board. You need to debate how to cover the following technical signal.
    Topic: "${topic}"
    Context: "${context}"

    ${transcriptSection}
    
    Output JSON only:
    {
      "transcript": [
        { "persona": "Tech-Optimist", "message": "..." },
        { "persona": "Culture-Critic", "message": "..." }
      ],
      "angles": [
        {
          "id": "opt",
          "persona": "Tech-Optimist",
          "headline": "Proposed Headline (UPPERCASE)",
          "angle": "A 2-sentence description of the angle and why it works."
        },
        {
          "id": "crit",
          "persona": "Culture-Critic",
          "headline": "Proposed Headline (UPPERCASE)",
          "angle": "A 2-sentence description of the angle and why it works."
        },
        {
          "id": "fash",
          "persona": "Fashion-Forward",
          "headline": "Proposed Headline (UPPERCASE)",
          "angle": "A 2-sentence description of the angle and why it works."
        }
      ]
    }
  `;

  return callJsonAgent<{ transcript: { persona: string, message: string }[], angles: EditorialAngle[] }>(prompt, {
    type: Type.OBJECT,
    properties: {
      transcript: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            persona: { type: Type.STRING },
            message: { type: Type.STRING }
          },
          required: ['persona', 'message']
        }
      },
      angles: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            persona: { type: Type.STRING },
            headline: { type: Type.STRING },
            angle: { type: Type.STRING }
          },
          required: ['id', 'persona', 'headline', 'angle']
        }
      }
    },
    required: ['transcript', 'angles']
  }, { transcript: [], angles: [] });
};
