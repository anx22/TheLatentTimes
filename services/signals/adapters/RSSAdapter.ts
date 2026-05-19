import { SignalAdapter } from '../SignalBroker';
import { TickerItem } from '../../../types';
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

  async fetch(limit: number): Promise<TickerItem[]> {
    const items = await fetchRSS(this.url, this.fetchRssAction);
    
    return items
      .filter(item => {
        const pubDate = new Date(item.pubDate).getTime();
        return pubDate > this.lastFetchedAt;
      })
      .slice(0, limit)
      .map(item => ({
        _id: Math.random().toString(36).substring(7),
        _creationTime: Date.now(),
        title: item.title,
        source: this.name,
        sourceId: this.id,
        url: item.link,
        content: item.description,
        timestamp: new Date(item.pubDate).getTime() || Date.now(),
        status: 'new'
      })) as TickerItem[];
  }
}
