import { TickerItem } from '../../types';
import { generateEmbedding } from '../gemini';

export interface SignalAdapter {
  id: string;
  name: string;
  fetch: (limit: number) => Promise<TickerItem[]>;
}

export interface IngestionResult {
  newItems: TickerItem[];
  sourceId: string;
  timestamp: number;
}

/**
 * SignalBroker
 * 
 * A DEEP module responsible for the ingestion, normalization, and 
 * semantic grouping of incoming technical signals.
 */
export class SignalBroker {
  private adapters: SignalAdapter[] = [];

  constructor(adapters: SignalAdapter[] = []) {
    this.adapters = adapters;
  }

  registerAdapter(adapter: SignalAdapter) {
    this.adapters.push(adapter);
  }

  /**
   * Ingests from all registered adapters and returns normalized items.
   */
  async broadcastIngestion(limitPerSource: number = 10, noiseFilter: number = 20): Promise<TickerItem[]> {
    const rawResults = await Promise.all(
      this.adapters.map(async (adapter) => {
        try {
          return await adapter.fetch(limitPerSource);
        } catch (error) {
          console.error(`Broker failure for adapter ${adapter.id}:`, error);
          return [];
        }
      })
    );

    const allItems = rawResults.flat();
    
    // Sort by default significance (if any) or timestamp
    allItems.sort((a, b) => b.timestamp - a.timestamp);

    // Apply noise filter (keep top N%)
    const keepCount = Math.max(1, Math.floor(allItems.length * ((100 - noiseFilter) / 100)) + 1);
    const filteredItems = allItems.slice(0, keepCount);

    // Generate Embeddings for the filtered items
    // This moves the computation behind the broker interface
    const enrichedItems = await Promise.all(
      filteredItems.map(async (item) => {
        try {
          const textToEmbed = `${item.title} ${item.content || ''}`;
          item.embedding = await generateEmbedding(textToEmbed);
        } catch (e) {
          console.error("Failed to generate embedding for item", item.title, e);
          item.embedding = [];
        }
        return item;
      })
    );

    return enrichedItems;
  }
}
