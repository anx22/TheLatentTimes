
import { NewsSource, TrustTier } from "./SourceRegistry";

export interface SignalMetadata {
  title: string;
  sourceId: string;
  sourceTrustTier: TrustTier;
  sourcePriority: number;
  publishedAt: string;
  innovation_score?: number;
  summary?: string;
  url: string;
}

export class ScoringEngine {
  /**
   * score =
   * primarySourceBonus
   * + freshnessScore
   * + sourcePriority
   * + trustScore
   * + sectorRelevanceScore
   * + narrativePotentialScore
   * - duplicateRiskPenalty
   */
  static calculateQualityScore(signal: SignalMetadata, allSignals: SignalMetadata[]): number {
    let score = 50; // Starting baseline

    // 1. Freshness Score (up to +25)
    const now = new Date().getTime();
    const pubDate = new Date(signal.publishedAt).getTime();
    const hoursOld = (now - pubDate) / (1000 * 60 * 60);
    
    if (hoursOld < 1) score += 25;
    else if (hoursOld < 4) score += 20;
    else if (hoursOld < 12) score += 15;
    else if (hoursOld < 24) score += 10;
    else if (hoursOld < 48) score += 5;
    else score -= 10; // Stale

    // 2. Trust Tier Bonus (up to +20)
    const trustWeights: Record<TrustTier, number> = {
      'primary': 20,
      'expert': 15,
      'media': 10,
      'social': 0,
      'pr': 5
    };
    score += trustWeights[signal.sourceTrustTier] || 0;

    // 3. Priority Bonus (up to +10)
    // sourcePriority 1 is highest, 5 is lowest
    score += (6 - signal.sourcePriority) * 2;

    // 4. Narrative Potential Score (Keyword density etc) (+/- 10)
    const keyTerms = [
      'foundation model', 'large language model', 'llm', 'autonomous agent', 
      'reasoning', 'policy', 'acquisition', 'breakthrough', 'lawsuit', 'mcp'
    ];
    const text = (signal.title + ' ' + (signal.summary || '')).toLowerCase();
    const matches = keyTerms.filter(term => text.includes(term));
    score += matches.length * 2;

    // 5. Innovation Alignment
    if (signal.innovation_score && signal.innovation_score > 80) {
      score += 15;
    }

    // 6. Duplicate Risk Penalty
    const isDuplicate = allSignals.some(s => 
      s.url !== signal.url && 
      this.isSemanticDuplicate(s.title, signal.title)
    );
    if (isDuplicate) score -= 40;

    return Math.min(100, Math.max(0, score));
  }

  private static isSemanticDuplicate(t1: string, t2: string): boolean {
    const s1 = t1.toLowerCase().trim();
    const s2 = t2.toLowerCase().trim();
    if (s1 === s2) return true;
    
    // Very basic overlap check
    const words1 = new Set(s1.split(/\s+/));
    const words2 = s2.split(/\s+/);
    const overlap = words2.filter(w => words1.has(w)).length;
    
    return (overlap / words2.length) > 0.85;
  }
}
