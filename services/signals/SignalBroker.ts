import { Signal } from '../../types';
import { generateEmbedding } from '../gemini';

export interface SignalAdapter {
  id: string;
  name: string;
  fetch: (limit: number, onLog?: (source: string, msg: string, type: any) => void) => Promise<Signal[]>;
}

export interface IngestionResult {
  newItems: Signal[];
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
   * Now includes Entropy-based Innovation Scoring and Cross-Source Synthesis.
   */
  async broadcastIngestion(limitPerSource: number = 10, noiseFilter: number = 20, missionId?: string, onLog?: (source: string, msg: string, type: any) => void): Promise<Signal[]> {
    const rawResults = await Promise.all(
      this.adapters.map(async (adapter) => {
        try {
          onLog?.('SIGNAL_BROKER', `Ingesting signals from: ${adapter.name}...`, 'action');
          const results = await adapter.fetch(limitPerSource);
          onLog?.('SIGNAL_BROKER', `Success: ${results.length} nodes received from ${adapter.name}.`, 'success');
          return results;
        } catch (error: any) {
          onLog?.('SIGNAL_BROKER', `Failure for ${adapter.name}: ${error.message}`, 'error');
          console.error(`Broker failure for adapter ${adapter.id}:`, error);
          return [];
        }
      })
    );

    const allItems = rawResults.flat();
    if (allItems.length === 0) return [];

    onLog?.('SIGNAL_BROKER', `Unified pool size: ${allItems.length} nodes. Enriching semantic vectors...`, 'info');
    
    // 1. Initial Enrichment (Embeddings)
    // We need embeddings BEFORE filtering to do semantic deduplication
    const enrichedPool = await Promise.all(
      allItems.map(async (item) => {
        try {
          const textToEmbed = `${item.title} ${item.content || ''}`;
          item.embedding = await generateEmbedding(textToEmbed, missionId);
          // Set a baseline innovation score
          item.innovation_score = 50; 
        } catch (e) {
          item.embedding = [];
        }
        return item;
      })
    );

    // 2. Semantic Deduplication & Cross-Source Resonance
    // If two items are semantic twins (>0.96 similarity), we merge them and boost resonance
    const synthesizedPool: Signal[] = [];
    const SIMILARITY_THRESHOLD = 0.96;

    for (const item of enrichedPool) {
      if (!item.embedding || item.embedding.length === 0) {
        synthesizedPool.push(item);
        continue;
      }

      let foundTwin = false;
      for (const existing of synthesizedPool) {
        if (!existing.embedding || existing.embedding.length === 0) continue;
        
        // Dot product similarity (embeddings are normalized by Gemini)
        const similarity = item.embedding.reduce((acc, val, i) => acc + val * (existing.embedding![i]), 0);
        
        if (similarity > SIMILARITY_THRESHOLD) {
          // It's a duplicate or high-resonance overlap
          existing.source = `${existing.source} + ${item.source}`;
          // Boost innovation because multiple sources are talking about the same thing
          existing.innovation_score = Math.min(99, (existing.innovation_score || 50) + 15);
          foundTwin = true;
          break;
        }
      }

      if (!foundTwin) {
        synthesizedPool.push(item);
      }
    }

    onLog?.('SIGNAL_BROKER', `Synthesis complete. Merged ${allItems.length} raw into ${synthesizedPool.length} resonant signals.`, 'success');

    // 3. Innovation Entropy Calculation
    // Items that are "far" from the average of the batch are more innovative
    if (synthesizedPool.length > 1) {
      // Calculate Centroid
      const embeddingLength = synthesizedPool.find(p => p.embedding && p.embedding.length > 0)?.embedding?.length || 0;
      if (embeddingLength > 0) {
        const centroid = new Array(embeddingLength).fill(0);
        let validEmbeds = 0;
        
        synthesizedPool.forEach(p => {
          if (p.embedding && p.embedding.length === embeddingLength) {
            p.embedding.forEach((v, i) => centroid[i] += v);
            validEmbeds++;
          }
        });

        if (validEmbeds > 0) {
          const meanCentroid = centroid.map(v => v / validEmbeds);
          
          synthesizedPool.forEach(p => {
            if (p.embedding && p.embedding.length === embeddingLength) {
              const distFromMean = p.embedding.reduce((acc, val, i) => acc + val * meanCentroid[i], 0);
              // distance = 1 - similarity. High distance = high "Entropy" = high innovation
              const entropyMultiplier = (1 - distFromMean) * 100;
              p.innovation_score = Math.min(99, Math.floor((p.innovation_score || 50) + entropyMultiplier));
            }
          });
        }
      }
    }

    // Sort by innovation score and timestamp
    synthesizedPool.sort((a, b) => {
      const scoreA = (a.innovation_score || 0) * (a.timestamp / 1e12); // Weight recent + innovative
      const scoreB = (b.innovation_score || 0) * (b.timestamp / 1e12);
      return scoreB - scoreA;
    });

    onLog?.('SIGNAL_BROKER', `Neural analysis complete. Most innovative signal: "${synthesizedPool[0]?.title}" (${synthesizedPool[0]?.innovation_score}% innovation).`, 'success');

    return synthesizedPool;
  }
}
