
import { Signal } from "../../types";
import { ScoringEngine } from "./ScoringEngine";
import { generateEmbedding } from "../gemini";

export class SourceFetcher {
  /**
   * Main fetch loop for LNT v2.5
   */
  static async fetchAll(
    sources: any[], 
    limitPerSource: number = 20, 
    missionId?: string,
    actions?: any,
    onLog?: (source: string, msg: string, type: string) => void
  ): Promise<Signal[]> {
    
    onLog?.('FETCHER', `Initializing Newsroom v2.5 Fetcher: Targeting ${sources.length} active nodes.`, 'action');

    const results = await Promise.all(
      sources.map(async (source) => {
        try {
          if (!source.isActive) return [];
          
          let rawSignals: any[] = [];
          
          if (source.type === 'rss') {
            onLog?.(`${source.name}`, `Scan initiation...`, 'info');
            rawSignals = await actions.fetchRss({ url: source.url });
          } else if (source.type === 'api' && source.id === 'github-trending') {
            onLog?.(`${source.name}`, `Querying GitHub API...`, 'info');
            rawSignals = await actions.fetchGitHub({ limit: limitPerSource });
          } else if (source.type === 'api') {
            onLog?.(`${source.name}`, `API interface check (Pending Implementation/Sim)...`, 'info');
            rawSignals = []; 
          }

          // Normalize and Enrich with Registry Metadata
          return (Array.isArray(rawSignals) ? rawSignals : []).filter(s => s.title && s.url).map(s => ({
            ...s,
            source: source.name,
            sourceId: source._id,
            sourcePack: source.pack,
            sourceTrustTier: source.trustTier,
            sourcePriority: source.priority,
            fetchedAt: Date.now(),
            missionId
          }));
        } catch (e: any) {
          onLog?.('FETCHER', `Failed node ${source.name}: ${e.message}`, 'error');
          return [];
        }
      })
    );

    const flatSignals = results.flat();
    
    // Fallback: If no signals, generate dummy signals for demonstration purposes
    if (flatSignals.length === 0) {
      onLog?.('FETCHER', 'All nodes returned empty. Injecting simulated high-value signal pool for demonstration...', 'warning');
      return [
        { 
          title: 'SMRs Emerge as Primary Power for AI Superfactories', 
          source: 'Simulated', 
          sourceType: 'rss', 
          status: 'new', 
          url: 'https://simulated.com/smr',
          content: 'Small Modular Reactors provide the baseline load for 100GW AI data centers.', 
          missionId, 
          innovation_score: 90,
          timestamp: Date.now(),
          _id: "sim-1" as any,
          _creationTime: Date.now()
        },
        { 
          title: 'Sovereign AI: Secure Private Enterprise Training', 
          source: 'Simulated', 
          sourceType: 'rss', 
          status: 'new', 
          url: 'https://simulated.com/sovereign-ai',
          content: 'New frameworks allow for training models without leaking data to public cloud.', 
          missionId, 
          innovation_score: 85,
          timestamp: Date.now(),
          _id: "sim-2" as any,
          _creationTime: Date.now()
        }
      ];
    }

    onLog?.('FETCHER', `Pool stabilized: ${flatSignals.length} records. Commencing neural quality analysis...`, 'success');

    // Enrichment & Scoring (Parallel)
    const enriched = await Promise.all(
      flatSignals.map(async (s: any) => {
        try {
          const textToEmbed = `${s.title} ${s.content || ''}`;
          s.embedding = await generateEmbedding(textToEmbed, missionId);
          s.qualityScore = ScoringEngine.calculateQualityScore(s, flatSignals);
          
          // Primary Source Enrichment (Basic Detection)
          const primaryEntities = ['OpenAI', 'Anthropic', 'Google', 'DeepMind', 'Meta', 'Mistral', 'EU', 'FTC'];
          s.hasPrimarySource = primaryEntities.some(e => s.title.includes(e)) && s.sourceTrustTier === 'primary';
          
        } catch (e) {
          s.qualityScore = 50;
        }
        return s;
      })
    );

    // Final Sort: Quality score descends
    return (enriched as Signal[]).sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0));
  }
}
