import { Type } from '@google/genai';
import { searchTrend, callJsonAgent, generateEmbedding } from '../gemini';
import { fetchRSS } from '../rss';
import { Source } from '../../types';

export const agentTicker = async (
  sources: Source[],
  noiseFilter: number,
  globalDirective?: string,
  fetchRssAction?: (args: { url: string }) => Promise<string>
): Promise<any[]> => {
  let allItems: any[] = [];
  
  for (const source of sources) {
    if (!source.isActive) continue;
    
    if (source.type === 'rss') {
      const rssItems = await fetchRSS(source.url, fetchRssAction);
      
      // Filter by lastFetchedAt
      const newItems = rssItems.filter(item => {
        const pubDate = new Date(item.pubDate).getTime();
        return pubDate > source.lastFetchedAt;
      });
      
      for (const item of newItems) {
        allItems.push({
          source: source.name,
          sourceId: source._id,
          title: item.title,
          url: item.link,
          content: item.description,
          timestamp: new Date(item.pubDate).getTime() || Date.now(),
        });
      }
    } else if (source.type === 'github') {
      // Basic GitHub API fetch for trending repos or specific user/org
      try {
        const res = await fetch(`https://api.github.com/search/repositories?q=created:>2024-01-01+sort:stars-desc`);
        const data = await res.json();
        const repos = data.items || [];
        
        const newRepos = repos.filter((repo: any) => {
          const createdAt = new Date(repo.created_at).getTime();
          return createdAt > source.lastFetchedAt;
        });
        
        for (const repo of newRepos) {
          allItems.push({
            source: source.name,
            sourceId: source._id,
            title: `${repo.full_name}: ${repo.description}`,
            url: repo.html_url,
            content: repo.description,
            timestamp: new Date(repo.created_at).getTime() || Date.now(),
          });
        }
      } catch (e) {
        console.error("GitHub fetch failed", e);
      }
    }
  }
  
  // If no sources configured or all failed, fall back to searchTrend
  if (allItems.length === 0) {
    const query = "latest breaking news in AI, machine learning, and software engineering";
    const searchResult = await searchTrend(query);
    const directivePrefix = globalDirective ? `DIRECTOR'S STRATEGIC DIRECTIVE: "${globalDirective}"\n\nYou MUST align your output with this directive.\n\n` : '';
    
    const prompt = `
      ${directivePrefix}
      You are THE WIRE for The Latent Times. Extract 3-5 distinct, highly technical news signals from the following search results.
      
      PHILOSOPHY: We favor the "Small Voice". Seek out the hidden technical gems, the obscure research papers, the niche GitHub repositories, and the underground forum discussions. If 10 big outlets are covering something, it's already "Old News" for us. find the one that ONLY 1-2 sources are mentioning, but which has massive technical potential.

      Raw Data:
      ${searchResult.text}
      
      Format as JSON array of objects:
      [
        {
          "id": "unique_string",
          "source": "Name of source (e.g. GitHub, Arxiv, TechCrunch)",
          "title": "A punchy, 1-sentence summary of the news/repo/paper.",
          "time": "e.g. '2h ago' or 'Just now'",
          "url": "https://...",
          "content": "A short summary of the content.",
          "innovation_score": 0-100 (Weight niche sources higher)
        }
      ]
    `;

    let items = await callJsonAgent<any[]>(prompt, {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          source: { type: Type.STRING },
          title: { type: Type.STRING },
          time: { type: Type.STRING },
          url: { type: Type.STRING },
          content: { type: Type.STRING },
          innovation_score: { type: Type.NUMBER }
        },
        required: ['id', 'source', 'title', 'time', 'url', 'content', 'innovation_score']
      }
    }, []);
    
    if (!Array.isArray(items)) items = [];
    
    // Sort by innovation score
    items.sort((a, b) => b.innovation_score - a.innovation_score);

    allItems = items.map(item => ({
      source: item.source,
      title: item.title,
      url: item.url || `https://google.com/search?q=${encodeURIComponent(item.title)}`,
      content: item.content || item.title,
      timestamp: Date.now(),
      innovation_score: item.innovation_score
    }));
  }

  // Apply noise filter (keep top N%)
  const keepCount = Math.max(1, Math.floor(allItems.length * ((100 - noiseFilter) / 100)) + 1);
  const filteredItems = allItems.slice(0, keepCount);

  // Generate Embeddings for the filtered items
  for (const item of filteredItems) {
    try {
      const textToEmbed = `${item.title} ${item.content || ''}`;
      item.embedding = await generateEmbedding(textToEmbed);
    } catch (e) {
      console.error("Failed to generate embedding for item", item.title, e);
      item.embedding = []; // Fallback empty array
    }
  }
  
  return filteredItems;
};
