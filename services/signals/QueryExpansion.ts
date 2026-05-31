
export class QueryExpansionService {
  private static expansionMap: Record<string, string[]> = {
    'ai': [
      'foundation model', 'large language model', 'llm', 'multimodal model', 
      'ai agent', 'autonomous agent', 'reasoning model', 'inference cost',
      'synthetic data', 'model collapse', 'ai safety', 'hallucination',
      'copyright ai', 'training data', 'ai lawsuit', 'ai act', 'ftc ai',
      'ai jobs', 'automation', 'education ai', 'synthetic media', 'deepfake',
      'creator rights', 'gpu shortage', 'ai infrastructure'
    ],
    'artificial intelligence': ['foundation model', 'reasoning model', 'llm', 'autonomous agents'],
    'policy': ['ai act', 'ftc', 'nist', 'regulation', 'eu commission'],
    'coding': ['cursor', 'claude code', 'mcp', 'copilot', 'devin', 'agentic workflows'],
  };

  static expand(query: string): string[] {
    const normalized = query.toLowerCase().trim();
    const results = new Set<string>([normalized]);

    Object.entries(this.expansionMap).forEach(([key, terms]) => {
      if (normalized.includes(key)) {
        terms.forEach(t => results.add(t));
      }
    });

    return Array.from(results);
  }
}
