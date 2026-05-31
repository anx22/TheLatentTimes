import { SignalAdapter } from '../SignalBroker';
import { Signal } from '../../../types';
import { fetchRSS } from '../../rss';

export class RSSAdapter implements SignalAdapter {
  id: string;
  name: string;
  private url: string;
  private lastFetchedAt: number;
  private fetchRssAction?: (args: { url: string }) => Promise<string>;

  constructor(id: string, name: string, url: string, lastFetchedAt: number, fetchRssAction?: (args: { url: string }) => Promise<string>) {
    this.id = id;
    this.name = name;
    this.url = url;
    this.lastFetchedAt = lastFetchedAt;
    this.fetchRssAction = fetchRssAction;
  }

  async fetch(limit: number, onLog?: (source: string, msg: string, type: any) => void): Promise<Signal[]> {
    try {
      const items = await fetchRSS(this.url, this.fetchRssAction);
      
      const newItems = items
        .filter(item => {
          const pubDate = new Date(item.pubDate).getTime();
          return pubDate > this.lastFetchedAt;
        })
        .slice(0, limit);

      onLog?.(this.name, `Parsed ${items.length} total signals. ${newItems.length} are new since last sync.`, 'info');

      return newItems.map(item => ({
        _id: Math.random().toString(36).substring(7),
        _creationTime: Date.now(),
        title: item.title,
        source: this.name,
        sourceId: this.id,
        url: item.link,
        content: item.description || "",
        timestamp: new Date(item.pubDate).getTime() || Date.now(),
        sourceType: 'rss',
        status: 'new'
      })) as Signal[];
    } catch (e: any) {
      onLog?.(this.name, `Ingestion failed: ${e.message}`, 'error');
      return [];
    }
  }
}
