import { safeGenerateContent, generateImage, cleanAndParseJSON, searchTrend } from './gemini';
import { Type } from '@google/genai';
import { AspectRatio, GeneratedArticle, TickerItem } from '../types';

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

export const agentScout = async (sources: { github: boolean, arxiv: boolean, techcrunch: boolean }, noiseFilter: number): Promise<string[]> => {
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
    You are THE SCOUT for MODUS. Your job is to find 3 distinct, highly specific hard-tech topics for our next article based on current real-world signals.
    
    CRITICAL RULE: Focus ONLY on technology (AI models, code, workflows, hardware). Ignore fashion, culture, and social issues entirely at this stage. We need the raw technical foundation.
    
    FILTERING DIRECTIVE: ${strictness}
    
    Here is the raw data from the live web:
    ${searchResult.text}
    
    Synthesize this into 3 punchy topic phrases (max 5-7 words each).
    
    Output as a simple JSON array of strings:
    ["Topic 1", "Topic 2", "Topic 3"]
  `;

  const response = await safeGenerateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  return cleanAndParseJSON(response.text) || ["Local LLM Orchestration", "Agentic Workflow Patterns", "Synthetic Data Pipelines"];
};

export const agentTargetedSearch = async (topic: string): Promise<{ context: string; grounded: boolean; urls: { title: string; url: string }[] }> => {
  // Deep dive into a specific topic
  const searchResult = await searchTrend(`latest technical details, documentation, and real-world developments regarding: ${topic}`);
  
  const prompt = `
    You are THE SCOUT. The Editor has requested a deep-dive on the following topic: "${topic}".
    
    Review the live web data below and extract the most crucial, cutting-edge technical facts, context, and recent developments.
    
    Raw Data:
    ${searchResult.text}
    
    If the raw data does NOT contain relevant information about "${topic}" (i.e., it's a fictional or non-existent technical topic), you MUST start your response with "UNGROUNDED:".
    
    Otherwise, provide a concise, highly technical briefing (max 3 sentences) that will serve as the foundation for the Columnist.
  `;

  const response = await safeGenerateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt
  });

  const text = response.text?.trim() || "";
  const isGrounded = !text.startsWith("UNGROUNDED:");
  const cleanText = text.replace("UNGROUNDED:", "").trim() || `No real-world technical grounding found for "${topic}". Proceeding with speculative synthesis.`;

  return { 
    context: cleanText, 
    grounded: isGrounded,
    urls: searchResult.groundingUrls
  };
};

export const agentDebate = async (topic: string, context: string): Promise<any[]> => {
  const prompt = `
    You are the MODUS Editorial Board. You need to debate how to cover the following technical signal.
    Topic: "${topic}"
    Context: "${context}"

    Generate 3 distinct editorial angles for this story from 3 different personas:
    1. The Tech-Optimist (Focuses on progress, capabilities, and utopian potential)
    2. The Culture-Critic (Focuses on societal impact, risks, and philosophical implications)
    3. The Fashion-Forward (Focuses on aesthetics, design, and how this integrates into human expression/lifestyle)

    Output JSON only:
    [
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
            persona: { type: Type.STRING },
            headline: { type: Type.STRING },
            angle: { type: Type.STRING }
          },
          required: ['id', 'persona', 'headline', 'angle']
        }
      }
    }
  });

  return cleanAndParseJSON(response.text) || [];
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
      "blocks": [
        {
          "id": "b1",
          "type": "p",
          "content": "First paragraph text...",
          "status": "clean"
        },
        {
          "id": "b2",
          "type": "p",
          "content": "Second paragraph text...",
          "status": "clean"
        }
      ],
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
          blocks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING },
                content: { type: Type.STRING },
                status: { type: Type.STRING }
              },
              required: ['id', 'type', 'content', 'status']
            }
          },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          suggested_visual_prompt: { type: Type.STRING }
        },
        required: ['headline', 'deck', 'blocks', 'tags', 'suggested_visual_prompt']
      }
    }
  });

  const parsed = cleanAndParseJSON(response.text);
  if (parsed) {
    // Legacy support: concatenate blocks into a single body string
    parsed.body = parsed.blocks.map((b: any) => b.content).join('\\n\\n');
  }
  return parsed;
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
