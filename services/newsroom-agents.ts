import { safeGenerateContent, generateImage, cleanAndParseJSON, searchTrend } from './gemini';
import { Type } from '@google/genai';
import { AspectRatio } from '../types';

export interface GeneratedArticle {
  headline: string;
  deck: string;
  body: string;
  tags: string[];
  suggested_visual_prompt: string;
}

export interface TickerItem {
  id: string;
  source: string;
  text: string;
  time: string;
  type: string;
}

export const agentTicker = async (sources: { github: boolean, arxiv: boolean, techcrunch: boolean }, noiseFilter: number): Promise<TickerItem[]> => {
  let query = "latest breaking news in AI, machine learning, and software engineering";
  const activeSources = [];
  if (sources.github) activeSources.push("github.com");
  if (sources.arxiv) activeSources.push("arxiv.org");
  if (sources.techcrunch) activeSources.push("techcrunch.com");
  
  if (activeSources.length > 0) {
    query += ` site:${activeSources.join(' OR site:')}`;
  }

  const searchResult = await searchTrend(query);
  
  const prompt = `
    You are THE WIRE for MODUS. Extract 3-5 distinct, highly technical news signals from the following search results.
    
    Raw Data:
    ${searchResult.text}
    
    Format as JSON array of objects:
    [
      {
        "id": "unique_string",
        "source": "Name of source (e.g. GitHub, Arxiv, TechCrunch)",
        "text": "A punchy, 1-sentence summary of the news/repo/paper.",
        "time": "e.g. '2h ago' or 'Just now'",
        "type": "news"
      }
    ]
  `;

  const response = await safeGenerateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            source: { type: Type.STRING },
            text: { type: Type.STRING },
            time: { type: Type.STRING },
            type: { type: Type.STRING }
          },
          required: ['id', 'source', 'text', 'time', 'type']
        }
      }
    }
  });

  let items = cleanAndParseJSON(response.text) || [];
  if (!Array.isArray(items)) items = [];
  
  // Apply noise filter (simulate by dropping items if filter is strict)
  // If noiseFilter is 100 (strict), keep fewer items. If 0 (broad), keep all.
  const keepCount = Math.max(1, Math.floor(items.length * ((100 - noiseFilter) / 100)) + 1);
  return items.slice(0, keepCount);
};

export const agentScout = async (sources: { github: boolean, arxiv: boolean, techcrunch: boolean }, noiseFilter: number): Promise<string> => {
  let query = "latest developments in AI models, open-source code repositories, machine learning workflows, and bleeding-edge technology";
  
  const activeSources = [];
  if (sources.github) activeSources.push("github.com");
  if (sources.arxiv) activeSources.push("arxiv.org");
  if (sources.techcrunch) activeSources.push("techcrunch.com");
  
  if (activeSources.length > 0) {
    query += ` site:${activeSources.join(' OR site:')}`;
  }

  const strictness = noiseFilter > 70 ? "EXTREMELY STRICT: Only return highly credible, groundbreaking, and verified technical breakthroughs." : "BROAD: You can include speculative, emerging, or niche technical trends.";

  const searchResult = await searchTrend(query);
  
  const prompt = `
    You are THE SCOUT for MODUS. Your job is to find a single, highly specific hard-tech topic for our next article based on current real-world signals.
    
    CRITICAL RULE: Focus ONLY on technology (AI models, code, workflows, hardware). Ignore fashion, culture, and social issues entirely at this stage. We need the raw technical foundation.
    
    FILTERING DIRECTIVE: ${strictness}
    
    Here is the raw data from the live web:
    ${searchResult.text}
    
    Synthesize this into a SINGLE, punchy topic phrase (max 5-7 words).
    Examples: "The Rise of Local LLMs", "ComfyUI Node Architectures", "Synthetic Data Generation".
    
    Output ONLY the topic phrase, nothing else.
  `;

  const response = await safeGenerateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt
  });

  return response.text?.trim() || "Local LLM Orchestration";
};

export const agentTargetedSearch = async (topic: string): Promise<string> => {
  // Deep dive into a specific topic
  const searchResult = await searchTrend(`latest technical details and developments regarding: ${topic}`);
  
  const prompt = `
    You are THE SCOUT. The Editor has requested a deep-dive on the following topic: "${topic}".
    
    Review the live web data below and extract the most crucial, cutting-edge technical facts, context, and recent developments.
    
    Raw Data:
    ${searchResult.text}
    
    Provide a concise, highly technical briefing (max 3 sentences) that will serve as the foundation for the Columnist.
  `;

  const response = await safeGenerateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt
  });

  return response.text?.trim() || `Deep dive context for ${topic} acquired.`;
};

export const agentColumnist = async (topic: string, context: string, lens: string, wordCountTarget: string): Promise<GeneratedArticle> => {
  let lengthInstruction = "2-3 paragraphs";
  if (wordCountTarget.includes("300")) lengthInstruction = "1-2 short, punchy paragraphs";
  if (wordCountTarget.includes("1200")) lengthInstruction = "4-5 detailed paragraphs";

  const prompt = `
    You are THE COLUMNIST for MODUS, a high-fashion, accelerationist magazine.
    
    Base Topic (The Tech Foundation): "${topic}"
    Context/Briefing: "${context}"
    
    Your task is to write an article about this technical topic, but you MUST apply the following Editorial Lens: "${lens}".
    This means you must view the hard technology through the perspective of ${lens}.
    
    Tone: Intellectual, haughty, insightful, "Vogue meets Wired".
    Length: ${lengthInstruction}.
    
    Output JSON only:
    {
      "headline": "A 3-5 word striking title (UPPERCASE)",
      "deck": "A provocative subtitle.",
      "body": "The main prose. Use markdown for emphasis.",
      "tags": ["Tag1", "Tag2"],
      "suggested_visual_prompt": "A detailed description for an AI image generator that captures the mood."
    }
  `;

  const response = await safeGenerateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          headline: { type: Type.STRING },
          deck: { type: Type.STRING },
          body: { type: Type.STRING },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          suggested_visual_prompt: { type: Type.STRING }
        },
        required: ['headline', 'deck', 'body', 'tags', 'suggested_visual_prompt']
      }
    }
  });

  return cleanAndParseJSON(response.text);
};

export const agentPhotographer = async (prompt: string, visualStyle: string, aspectRatio: AspectRatio): Promise<string> => {
  // We use the prompt generated by the Columnist and enhance it with the selected visual style
  const styleMap: Record<string, string> = {
    'Editorial Photography': 'high-end editorial fashion photography, 35mm film, studio lighting, Vogue cover style',
    'Cyberpunk Render': 'cyberpunk aesthetic, neon lighting, octane render, unreal engine 5, highly detailed 3d',
    'Technical Blueprint': 'architectural blueprint style, technical drawing, wireframe, schematic, minimalist lines',
    'Abstract Latent': 'abstract latent space visualization, fluid dynamics, glitch art, surreal digital noise'
  };
  
  const stylePrompt = styleMap[visualStyle] || styleMap['Editorial Photography'];
  const enhancedPrompt = `${stylePrompt}, ${prompt}, 8k resolution, masterpiece.`;
  
  return await generateImage(enhancedPrompt, aspectRatio);
};
