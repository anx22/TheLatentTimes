import { Type } from '@google/genai';
import { EditorialAngle } from '../../types';
import { callJsonAgent } from '../gemini';

export const agentDebate = async (topic: string, context: string, globalDirective?: string, transcript?: { persona: string, message: string }[]): Promise<{ transcript: { persona: string, message: string }[], angles: EditorialAngle[] }> => {
  const directivePrefix = globalDirective ? `DIRECTOR'S STRATEGIC DIRECTIVE: "${globalDirective}"\n\nYou MUST align your output with this directive.\n\n` : '';
  
  const transcriptSection = transcript ? `
    The debate has already happened. Here is the transcript:
    ${transcript.map(m => `${m.persona}: ${m.message}`).join('\n')}
    
    Based on this debate, generate exactly 3 distinct editorial angles, one for each of the following personas:
    1. The Intellectual
    2. The AI Visionary
    3. The Disruptor
  ` : `
    First, generate a short debate transcript (3-4 messages total) strictly between the following 3 personas (no others allowed):
    1. The Intellectual (Focuses on deep analysis, philosophical implications, and systemic shifts)
    2. The AI Visionary (Focuses on the bleeding edge, future trajectories, and paradigm shifts)
    3. The Disruptor (Focuses on challenging the status quo, contrarian takes, and radical impacts)

    Then, generate exactly 3 distinct editorial angles, one for each of these personas. For each angle, provide 3 distinct headline options.
  `;

  const prompt = `
    ${directivePrefix}
    You are the The Latent Times Editorial Board. You need to debate how to cover the following technical signal.
    Topic: "${topic}"
    Context: "${context}"

    ${transcriptSection}
    
    Output JSON only. The "angles" array must contain exactly 3 objects, corresponding to the 3 personas defined above.
    {
      "transcript": [
        { "persona": "The Intellectual", "message": "..." },
        { "persona": "The Disruptor", "message": "..." }
      ],
      "angles": [
        {
          "id": "intellectual",
          "persona": "The Intellectual",
          "headline": "Primary Headline (UPPERCASE)",
          "headlineOptions": ["Option 1", "Option 2", "Option 3"],
          "angle": "A 2-sentence description of the angle and why it works."
        },
        {
          "id": "visionary",
          "persona": "The AI Visionary",
          "headline": "Primary Headline (UPPERCASE)",
          "headlineOptions": ["Option 1", "Option 2", "Option 3"],
          "angle": "A 2-sentence description of the angle and why it works."
        },
        {
          "id": "disruptor",
          "persona": "The Disruptor",
          "headline": "Primary Headline (UPPERCASE)",
          "headlineOptions": ["Option 1", "Option 2", "Option 3"],
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
            headlineOptions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            angle: { type: Type.STRING }
          },
          required: ['id', 'persona', 'headline', 'headlineOptions', 'angle']
        }
      }
    },
    required: ['transcript', 'angles']
  }, { transcript: [], angles: [] });
};
