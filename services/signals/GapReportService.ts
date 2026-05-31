
import { Signal } from "../../types";

export interface GapReport {
  hasPrimarySource: boolean;
  hasTechnicalSource: boolean;
  hasLegalPolicySource: boolean;
  hasBusinessSource: boolean;
  hasCultureSocietySource: boolean;
  sourceDiversityScore: number;
  warningLabels: string[];
}

export class GapReportService {
  static generateReport(signals: Signal[]): GapReport {
    const packs = new Set(signals.map(s => (s as any).sourcePack));
    const tiers = new Set(signals.map(s => (s as any).sourceTrustTier));

    const report: GapReport = {
      hasPrimarySource: tiers.has('primary'),
      hasTechnicalSource: packs.has('AI_RESEARCH') || packs.has('AI_DEV_SIGNAL'),
      hasLegalPolicySource: packs.has('AI_LAW_POLICY'),
      hasBusinessSource: packs.has('AI_BUSINESS'),
      hasCultureSocietySource: packs.has('AI_CULTURE'),
      sourceDiversityScore: 0,
      warningLabels: []
    };

    // Calculate Diversity
    const categoriesFound = [
      report.hasTechnicalSource,
      report.hasLegalPolicySource,
      report.hasBusinessSource,
      report.hasCultureSocietySource
    ].filter(Boolean).length;
    
    report.sourceDiversityScore = (categoriesFound / 4) * 100;

    // Warning Labels
    if (!report.hasPrimarySource) report.warningLabels.push('NO_PRIMARY_SOURCE');
    if (categoriesFound <= 1) report.warningLabels.push('LOW_SOURCE_DIVERSITY');
    if (tiers.size === 1 && tiers.has('social')) report.warningLabels.push('SOCIAL_ONLY');
    if (tiers.size === 1 && tiers.has('pr')) report.warningLabels.push('ONLY_PR_SOURCES');

    return report;
  }
}
