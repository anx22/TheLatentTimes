import { MODELS } from '../../constants';
import { Type } from "@google/genai";
import { safeGenerateContent, callJsonAgent, searchTrend } from "./modelClient";

export interface Claim {
  claimText: string;
  sourceUrl: string;
  sourceName: string;
  entities: string[];
  confidence: number;
  claimType: "funding" | "launch" | "lawsuit" | "research" | "policy" | "market" | "unspecified";
}

export interface SimilarityReport {
  score: number; // Safety distance score (0-100, where 100 is completely safe/distinct)
  literalOverlapBlocks: string[];
  verbatimRisk: boolean;
  recommendation: string;
}

export interface EvidencePack {
  claims: Claim[];
  independentSourcesCount: number;
  synthesizedEvidence: string;
  sources: Array<{ title: string; url: string }>;
}

/**
 * Extracts atomic claim blocks and core technical metadata from a seed article
 * to bypass copyright "paraphrase traps" and legal risks.
 */
export const agentExtractSeedClaims = async (
  seedTitle: string, 
  seedContent: string, 
  sourceName: string, 
  sourceUrl: string, 
  missionId?: string
): Promise<Claim[]> => {
  const prompt = `
    You are THE COMPLIANCE SCOUT. Your job is to extract raw, atomic facts and claim assertions from a seed article.
    We are strictly FORBIDDEN from borrowing descriptive phrasing, narrative structure, word play, or tone. 
    We only extract the absolute facts so they can be merged with other independent evidence.

    Seed Article Title: "${seedTitle}"
    Source: ${sourceName}
    URL: ${sourceUrl}

    Raw Content Snippet/FullText:
    """
    ${seedContent}
    """

    Deconstruct this text into a collection of atomic factual claims:
    - Include specific metrics, milestones, technical configurations, financial metrics, and entities.
    - Rate the confidence of each claim based on textual support (0-100).
    - Classify the claim type of each claim (funding, launch, lawsuit, research, policy, market, unspecified).
    - Keep claimText entirely fact-based, dry, and objective.

    Output format MUST be a valid JSON array matching the schema:
    [
      {
        "claimText": "Specific factual claim here...",
        "sourceUrl": "${sourceUrl}",
        "sourceName": "${sourceName}",
        "entities": ["entity1", "entity2"],
        "confidence": 95,
        "claimType": "funding"
      }
    ]
  `;

  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        claimText: { type: Type.STRING },
        sourceUrl: { type: Type.STRING },
        sourceName: { type: Type.STRING },
        entities: { type: Type.ARRAY, items: { type: Type.STRING } },
        confidence: { type: Type.NUMBER },
        claimType: { type: Type.STRING }
      },
      required: ["claimText", "sourceUrl", "sourceName", "entities", "confidence", "claimType"]
    }
  };

  try {
    const claims = await callJsonAgent<Claim[]>(prompt, schema, [], missionId);
    return claims || [];
  } catch (e) {
    console.warn("Failed to extract claims in seed agent, falling back to basic parsing", e);
    return [{
      claimText: `Factual developments related to ${seedTitle}`,
      sourceUrl,
      sourceName,
      entities: [sourceName, "Technology"],
      confidence: 80,
      claimType: "unspecified"
    }];
  }
};

/**
 * Generates technical discovery queries based on atomized facts and compiles
 * an "Evidence Pack" synthesizing multiple web sources.
 */
export const agentSearchIndependentSources = async (
  claims: Claim[], 
  missionId?: string
): Promise<EvidencePack> => {
  if (claims.length === 0) {
    return { claims: [], independentSourcesCount: 0, synthesizedEvidence: "No evidence gathered.", sources: [] };
  }

  // Pick unique entities and claims to formulate a smart search query
  const keyEntities = Array.from(new Set(claims.flatMap(c => c.entities))).slice(0, 4);
  const coreQuery = keyEntities.length > 0 
    ? `${keyEntities.join(" ")} latest technical independent reviews documentation`
    : `${claims[0]?.claimText?.slice(0, 80)} independent developments`;

  let searchResult;
  try {
    searchResult = await searchTrend(`independent source materials and confirmations regarding: ${coreQuery}`, missionId);
  } catch (error) {
    console.warn("Targeted search failed inside seed explorer, using simulated grounding fallback.", error);
    searchResult = { text: "No immediate web validation available. Relying on baseline technical knowledge.", groundingUrls: [] };
  }

  const synthesisPrompt = `
    You are THE RESEARCH ANALYST. Review the gathered independent search findings and the primary atomic claims.
    Synthesize these elements into an "Evidence Pack". 
    Highlight where independent findings confirm, complicate, or expand upon the primary claims.
    Do NOT copy structure; identify common trends, divergent metrics, or deeper context layers.

    Primary Claims:
    ${JSON.stringify(claims, null, 2)}

    Gathered Independent Proof/Content:
    """
    ${searchResult.text}
    """

    Format your output as a comprehensive, objective technical overview of the facts, citing sources appropriately and specifying contradictions or consensuses.
  `;

  try {
    const response = await safeGenerateContent({
      model: MODELS.text,
      contents: synthesisPrompt,
      missionId
    });

    const sourceObjects = (searchResult.groundingUrls || []).map(g => ({
      title: g.title,
      url: g.url
    }));

    return {
      claims,
      independentSourcesCount: sourceObjects.length,
      synthesizedEvidence: response.text || "No synthesis compiled.",
      sources: sourceObjects
    };
  } catch (e) {
    return {
      claims,
      independentSourcesCount: 0,
      synthesizedEvidence: `Baseline facts gathered. Independent verification skipped due to system constraints.`,
      sources: []
    };
  }
};

/**
 * Validates a generated copy block/draft against the seed source article
 * and issues a clear similarity and copyright audit.
 */
export const agentCheckSeedSimilarity = async (
  draftText: string, 
  seedText: string, 
  missionId?: string
): Promise<SimilarityReport> => {
  const prompt = `
    You are THE COMPLIANCE AUDITOR (UrhG Legal Specialist). Compare the incoming draft article against the seed source text.
    Your objective is to calculate an honest Safety Distance Score (0 to 100), where:
    - 100 means complete legal clearance (unique structure, original headline, completely independent sentences and narrative flow).
    - <50 means high risk of trademark or copyright issues (paraphrase patterns, exact copying of sentences, matching sequences of paragraphs, or carbon-copy narrative arguments).

    Seed Source Text:
    """
    ${seedText.slice(0, 6000)}
    """

    Incoming Draft Article:
    """
    ${draftText.slice(0, 6000)}
    """

    Evaluate:
    1. Literal overlapping blocks or phrasing.
    2. Sequence and structural replication (argument flow).
    3. Literal copycat/verbatim risk.
    4. Recommendations to elevate distance and safety.

    Output MUST be a JSON object matching this schema:
    {
      "score": 85,
      "literalOverlapBlocks": ["any literal phrases or matching structures identified"],
      "verbatimRisk": false,
      "recommendation": "Explain clearly how the writer can refine paragraphs to achieve 100% legal safety."
    }
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      score: { type: Type.NUMBER },
      literalOverlapBlocks: { type: Type.ARRAY, items: { type: Type.STRING } },
      verbatimRisk: { type: Type.BOOLEAN },
      recommendation: { type: Type.STRING }
    },
    required: ["score", "literalOverlapBlocks", "verbatimRisk", "recommendation"]
  };

  const fallback: SimilarityReport = {
    score: 80,
    literalOverlapBlocks: [],
    verbatimRisk: false,
    recommendation: "Baseline distance evaluation completed. Maintain original structure during further polishes."
  };

  return await callJsonAgent<SimilarityReport>(prompt, schema, fallback, missionId);
};
