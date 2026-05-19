import { SignalAdapter } from '../SignalBroker';
import { TickerItem } from '../../../types';

export class GitHubAdapter implements SignalAdapter {
  id: string;
  name: string;
  private lastFetchedAt: number;

  constructor(id: string, name: string, lastFetchedAt: number) {
    this.id = id;
    this.name = name;
    this.lastFetchedAt = lastFetchedAt;
  }

  async fetch(limit: number): Promise<TickerItem[]> {
    try {
      // Fetch trending repos from 2024 onwards
      const res = await fetch(`https://api.github.com/search/repositories?q=created:>2024-01-01+sort:stars-desc&per_page=${limit}`);
      const data = await res.json();
      const repos = data.items || [];
      
      return repos
        .filter((repo: any) => {
          const createdAt = new Date(repo.created_at).getTime();
          return createdAt > this.lastFetchedAt;
        })
        .map((repo: any) => ({
          _id: Math.random().toString(36).substring(7),
          _creationTime: Date.now(),
          title: `${repo.full_name}: ${repo.description || 'No description'}`,
          source: this.name,
          sourceId: this.id,
          url: repo.html_url,
          content: repo.description,
          timestamp: new Date(repo.created_at).getTime() || Date.now(),
          status: 'new'
        })) as TickerItem[];
    } catch (e) {
      console.error("GitHub fetch failed", e);
      return [];
    }
  }
}
