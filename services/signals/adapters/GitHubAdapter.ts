import { SignalAdapter } from '../SignalBroker';
import { Signal } from '../../../types';

export class GitHubAdapter implements SignalAdapter {
  id: string;
  name: string;
  private lastFetchedAt: number;

  constructor(id: string, name: string, lastFetchedAt: number) {
    this.id = id;
    this.name = name;
    this.lastFetchedAt = lastFetchedAt;
  }

  async fetch(limit: number, onLog?: (source: string, msg: string, type: any) => void): Promise<Signal[]> {
    try {
      onLog?.(this.name, `Querying GitHub for trending repositories created after ${new Date(this.lastFetchedAt).toLocaleDateString()}...`, 'action');
      
      // Fetch trending repos (last 7 days, sorted by stars)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const res = await fetch(`https://api.github.com/search/repositories?q=created:>${sevenDaysAgo}+stars:>10+sort:stars-desc&per_page=${limit}`);
      if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
      
      const data = await res.json();
      const repos = data.items || [];
      
      const newRepos = repos
        .filter((repo: any) => {
          const createdAt = new Date(repo.created_at).getTime();
          // Fallback freshness: if source is fresh (0), allow last 24h
          const threshold = this.lastFetchedAt === 0 ? Date.now() - 24 * 60 * 60 * 1000 : this.lastFetchedAt;
          return createdAt > threshold;
        });

      onLog?.(this.name, `Found ${repos.length} candidates. ${newRepos.length} pass freshness filter.`, 'info');

      return newRepos.map((repo: any) => ({
        _id: Math.random().toString(36).substring(7),
        _creationTime: Date.now(),
        title: `${repo.full_name}: ${repo.description || 'No description'}`,
        source: this.name,
        sourceId: this.id,
        url: repo.html_url,
        content: repo.description || "",
        timestamp: new Date(repo.created_at).getTime() || Date.now(),
        sourceType: 'github',
        status: 'new'
      })) as Signal[];
    } catch (e: any) {
      onLog?.(this.name, `GitHub ingestion failed: ${e.message}`, 'error');
      console.error("GitHub fetch failed", e);
      return [];
    }
  }
}
