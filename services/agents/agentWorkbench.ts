import { GoogleGenAI } from '@google/genai';
import { Signal, SystemLog, StoryAngle } from '../../types';

export const agentWorkbench = async (
    signals: Signal[],
    userContext: string | undefined,
    addLog: (log: Omit<SystemLog, '_id' | 'timestamp'>) => void
): Promise<Pick<StoryAngle, 'title' | 'summary'>[]> => {
    try {
        addLog({
            agentName: 'Workbench',
            message: `Deconstructing ${signals.length} signals into distinct editorial angles...`,
            step: 'NEWS_TERMINAL',
            level: 'action',
        });

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error('Gemini API key is not configured');

        const ai = new GoogleGenAI({ apiKey });

        const formattedSignals = signals.map(s => 
            `[${s.sourceType}] ${s.title}\n${s.content || ''}`
        ).join('\n---\n');

        const prompt = `You are an expert editorial strategist. You have been handed a mosaic of raw intelligence signals.
Your task is to analyze these signals and propose 3-5 distinct, high-leverage narrative angles.

${userContext ? `The Editor-in-Chief has issued the following directive for this session:\n"${userContext}"\nPrioritize this directive when forming angles.` : ''}

Signals to analyze:
${formattedSignals}

Generate the angles in JSON format. The JSON should be an array of objects, where each object has:
- "title": A short, punchy working title for the angle (e.g., "The Economic Fallout" or "The Tech Perspective")
- "summary": A 2-3 sentence pitch explaining what this angle covers and why it matters based on the provided signals.

Respond ONLY with valid JSON.
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                temperature: 0.7,
                responseMimeType: "application/json",
            }
        });

        if (!response.text) {
            throw new Error('Workbench returned empty response.');
        }

        const parsed = JSON.parse(response.text) as Pick<StoryAngle, 'title' | 'summary'>[];

        addLog({
            agentName: 'Workbench',
            message: `Successfully extracted ${parsed.length} distinct angles.`,
            step: 'NEWS_TERMINAL',
            level: 'success',
        });

        return parsed;

    } catch (error: any) {
        addLog({
            agentName: 'Workbench',
            message: `Failed to synthesize angles: ${error.message}`,
            step: 'NEWS_TERMINAL',
            level: 'error',
        });
        throw error;
    }
};
