import { Type } from '@google/genai';
import { TickerItem } from '../../types';
import { searchTrend, callJsonAgent } from '../gemini';

export const agentTicker = async (sources: { github: boolean, arxiv: boolean, techcrunch: boolean }, noiseFilter: number, globalDirective?: string): Promise<TickerItem[]> => {
  let query = "latest breaking news in AI, machine learning, and software engineering";
  const activeSources = [];
  if (sources.github) activeSources.push("github.com");
  if (sources.arxiv) activeSources.push("arxiv.org");
  if (sources.techcrunch) activeSources.push("techcrunch.com");
  
  if (activeSources.length > 0) {
    query += ` site:\${activeSources.join(' OR site:')}`;
  }

  const searchResult = await searchTrend(query);
  const directivePrefix = globalDirective ? `DIRECTOR'S STRATEGIC DIRECTIVE: "${globalDirective}"\n\nYou MUST align your output with this directive.\n\n` : '';
  
  const prompt = `
    ${directivePrefix}
    You are THE WIRE for The Latent Times. Extract 3-5 distinct, highly technical news signals from the following search results.
    
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

  let items = await callJsonAgent<TickerItem[]>(prompt, {
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
  }, []);
  
  if (!Array.isArray(items)) items = [];
  
  const keepCount = Math.max(1, Math.floor(items.length * ((100 - noiseFilter) / 100)) + 1);
  return items.slice(0, keepCount);
};
