import { SignalAdapter } from '../SignalBroker';
import { Signal } from '../../../types';
import { searchTrend, callJsonAgent } from '../../gemini';
import { Type } from '@google/genai';

export class SearchAdapter implements SignalAdapter {
  id: string = 'search_fallback';
  name: string = 'Neural Search';
  private query: string;
  private globalDirective?: string;

  constructor(query: string, globalDirective?: string) {
    this.query = query;
    this.globalDirective = globalDirective;
  }

  async fetch(limit: number, onLog?: (source: string, msg: string, type: any) => void): Promise<Signal[]> {
    onLog?.(this.name, `Initiating synthetic signal search for: "${this.query}"...`, 'action');
    
    const searchResult = await searchTrend(this.query);
    const directivePrefix = this.globalDirective ? `DIRECTOR'S STRATEGIC DIRECTIVE: "${this.globalDirective}"\n\nYou MUST align your output with this directive.\n\n` : '';
    
    const prompt = `
      ${directivePrefix}
      You are THE WIRE for The Latent Times. Extract up to ${limit} distinct, highly technical news signals from the following search results.
      
      PHILOSOPHY: We are a MAINSTREAM POWERHOUSE. Seek out the "Big Movements".
      
      Raw Data:
      ${searchResult.text}
      
      Format as JSON array of objects:
      [
        {
          "title": "A punchy, 1-sentence summary of the news.",
          "url": "https://...",
          "content": "A short summary of the content.",
          "innovation_score": 0-100
        }
      ]
    `;

    const items = await callJsonAgent<any[]>(prompt, {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          url: { type: Type.STRING },
          content: { type: Type.STRING },
          innovation_score: { type: Type.NUMBER }
        },
        required: ['title', 'content', 'innovation_score']
      }
    }, []);

    onLog?.(this.name, `Found ${items.length} synthetic signals.`, 'success');

    return items.map(item => ({
      _id: Math.random().toString(36).substring(7),
      _creationTime: Date.now(),
      title: item.title,
      source: this.name,
      sourceId: this.id as any,
      url: item.url || `https://google.com/search?q=${encodeURIComponent(item.title)}`,
      content: item.content,
      timestamp: Date.now(),
      status: 'new',
      sourceType: 'api',
      innovation_score: item.innovation_score
    })) as Signal[];
  }
}
