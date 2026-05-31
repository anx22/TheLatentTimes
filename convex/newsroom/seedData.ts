export const INITIAL_SOURCES = [
  // frontier
  { name: "OpenAI News", url: "https://openai.com/news/rss.xml", type: "rss" as const, isActive: true, lastFetchedAt: 0, crawlFrequency: 60, pack: "AI_MODEL_FRONTIER", priority: 1, trustTier: "primary", rightsMode: "excerpt_allowed" },
  { name: "Hugging Face Blog", url: "https://huggingface.co/blog/feed.xml", type: "rss" as const, isActive: true, lastFetchedAt: 0, crawlFrequency: 60, pack: "AI_MODEL_FRONTIER", priority: 1, trustTier: "primary", rightsMode: "excerpt_allowed" },
  { name: "DeepMind Blog", url: "https://deepmind.google/blog/rss.xml", type: "rss" as const, isActive: true, lastFetchedAt: 0, crawlFrequency: 60, pack: "AI_MODEL_FRONTIER", priority: 1, trustTier: "primary", rightsMode: "excerpt_allowed" },
  { name: "Google Research", url: "https://research.google/blog/rss.xml", type: "rss" as const, isActive: true, lastFetchedAt: 0, crawlFrequency: 120, pack: "AI_MODEL_FRONTIER", priority: 1, trustTier: "primary", rightsMode: "excerpt_allowed" },
  { name: "Meta AI", url: "https://ai.meta.com/blog/rss/", type: "rss" as const, isActive: true, lastFetchedAt: 0, crawlFrequency: 120, pack: "AI_MODEL_FRONTIER", priority: 2, trustTier: "primary", rightsMode: "excerpt_allowed" },
  { name: "Mistral AI", url: "https://mistral.ai/news/rss.xml", type: "rss" as const, isActive: true, lastFetchedAt: 0, crawlFrequency: 120, pack: "AI_MODEL_FRONTIER", priority: 2, trustTier: "primary", rightsMode: "excerpt_allowed" },
  
  // research
  { name: "arXiv cs.AI", url: "http://export.arxiv.org/rss/cs.AI", type: "rss" as const, isActive: true, lastFetchedAt: 0, crawlFrequency: 240, pack: "AI_RESEARCH", priority: 1, trustTier: "expert", rightsMode: "metadata_only" },
  { name: "arXiv cs.LG", url: "http://export.arxiv.org/rss/cs.LG", type: "rss" as const, isActive: true, lastFetchedAt: 0, crawlFrequency: 240, pack: "AI_RESEARCH", priority: 1, trustTier: "expert", rightsMode: "metadata_only" },
  { name: "Hugging Face Papers", url: "https://huggingface.co/api/daily_papers", type: "api" as const, isActive: true, lastFetchedAt: 0, crawlFrequency: 180, pack: "AI_RESEARCH", priority: 1, trustTier: "expert", rightsMode: "internal_analysis" },
  { name: "Berkeley AI Research (BAIR)", url: "https://bair.berkeley.edu/blog/feed.xml", type: "rss" as const, isActive: true, lastFetchedAt: 0, crawlFrequency: 240, pack: "AI_RESEARCH", priority: 1, trustTier: "expert", rightsMode: "excerpt_allowed" },

  // dev signal
  { name: "NVIDIA Technical", url: "https://developer.nvidia.com/blog/feed/", type: "rss" as const, isActive: true, lastFetchedAt: 0, crawlFrequency: 120, pack: "AI_DEV_SIGNAL", priority: 1, trustTier: "expert", rightsMode: "excerpt_allowed" },
  { name: "Lilian Weng's Lil'Log", url: "https://lilianweng.github.io/posts/index.xml", type: "rss" as const, isActive: true, lastFetchedAt: 0, crawlFrequency: 360, pack: "AI_DEV_SIGNAL", priority: 1, trustTier: "expert", rightsMode: "excerpt_allowed" },
  { name: "vLLM Project Blog", url: "https://blog.vllm.ai/feed.xml", type: "rss" as const, isActive: true, lastFetchedAt: 0, crawlFrequency: 240, pack: "AI_DEV_SIGNAL", priority: 1, trustTier: "expert", rightsMode: "excerpt_allowed" },
  { name: "Simon Willison's Log", url: "https://simonwillison.net/atom/entries/", type: "rss" as const, isActive: true, lastFetchedAt: 0, crawlFrequency: 120, pack: "AI_DEV_SIGNAL", priority: 2, trustTier: "expert", rightsMode: "excerpt_allowed" },
  { name: "GitHub Trending AI", url: "https://api.github.com/search/repositories?q=topic:ai&sort=stars", type: "api" as const, isActive: true, lastFetchedAt: 0, crawlFrequency: 360, pack: "AI_DEV_SIGNAL", priority: 2, trustTier: "expert", rightsMode: "metadata_only" },
  { name: "Hacker News AI", url: "https://hn.algolia.com/api/v1/search?query=AI&tags=story", type: "api" as const, isActive: true, lastFetchedAt: 0, crawlFrequency: 30, pack: "AI_DEV_SIGNAL", priority: 3, trustTier: "social", rightsMode: "metadata_only" },

  // policy
  { name: "EU Digital Strategy", url: "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai", type: "html_watch" as const, isActive: true, lastFetchedAt: 0, crawlFrequency: 1440, pack: "AI_LAW_POLICY", priority: 2, trustTier: "primary", rightsMode: "internal_analysis" },
  { name: "FTC News (AI)", url: "https://www.ftc.gov/news-events/press-releases/rss.xml", type: "rss" as const, isActive: true, lastFetchedAt: 0, crawlFrequency: 720, pack: "AI_LAW_POLICY", priority: 2, trustTier: "primary", rightsMode: "excerpt_allowed" },

  // business
  { name: "TechCrunch AI", url: "https://techcrunch.com/category/artificial-intelligence/feed/", type: "rss" as const, isActive: true, lastFetchedAt: 0, crawlFrequency: 60, pack: "AI_BUSINESS", priority: 2, trustTier: "media", rightsMode: "excerpt_allowed" },
  { name: "VentureBeat AI", url: "https://venturebeat.com/category/ai/feed/", type: "rss" as const, isActive: true, lastFetchedAt: 0, crawlFrequency: 60, pack: "AI_BUSINESS", priority: 2, trustTier: "media", rightsMode: "excerpt_allowed" },

  // culture
  { name: "WIRED AI", url: "https://www.wired.com/feed/tag/ai/latest/rss", type: "rss" as const, isActive: true, lastFetchedAt: 0, crawlFrequency: 180, pack: "AI_CULTURE", priority: 3, trustTier: "media", rightsMode: "excerpt_allowed" },
  { name: "The Verge AI", url: "https://www.theverge.com/ai-artificial-intelligence/rss/index.xml", type: "rss" as const, isActive: true, lastFetchedAt: 0, crawlFrequency: 120, pack: "AI_CULTURE", priority: 3, trustTier: "media", rightsMode: "excerpt_allowed" },
];

export function getGenesisIssueContent(firstItem: any, layout?: any) {
  return {
    meta: {
      run_id: 'shell_v1',
      issue_id: 'shell_v1',
      vol: 'VOL. 1.0',
      theme: 'THE GENESIS ISSUE',
      date: 'OCT 2025',
      editor: 'SYSTEM',
      status: 'COLLECTING',
      template_key: 'T1_CoverRail',
      metrics: { signals_ingested: 0, avg_confidence: 0, error_rate: 0 }
    },
    items: [firstItem],
    ...(layout ? { layout } : {}),
    ticker: [],
    cover: {
      eyebrow: "ISSUE 01",
      title: "ZERO DAY", 
      deck: "Blank slate. Rigid grid. Pure signal.",
      coverlines: [],
      imgPrompt: "Void",
      img_base64: ""
    },
    edit: [],
    drops: [],
    debates: [],
    features: [],
    columns: [],
    atelier: [],
    index_keys: [],
    colophon: { contributors: [], sources: [], corrections: [] }
  };
}
