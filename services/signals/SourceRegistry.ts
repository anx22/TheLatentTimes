
import { Id } from "../../convex/_generated/dataModel";

export type SourceType = 'rss' | 'api' | 'html_watch' | 'search';
export type TrustTier = 'primary' | 'expert' | 'media' | 'social' | 'pr';
export type RightsMode = 'metadata_only' | 'excerpt_allowed' | 'internal_analysis';
export type CostTier = 'free' | 'cheap' | 'paid';

export interface NewsSource {
  id: string;
  name: string;
  type: SourceType;
  url: string;
  pack: SourcePack;
  priority: 1 | 2 | 3 | 4 | 5;
  trustTier: TrustTier;
  costTier: CostTier;
  fetchIntervalMinutes: number;
  rightsMode: RightsMode;
  enabled: boolean;
  notes?: string;
}

export type SourcePack = 
  | 'AI_MODEL_FRONTIER'
  | 'AI_RESEARCH'
  | 'AI_DEV_SIGNAL'
  | 'AI_LAW_POLICY'
  | 'AI_BUSINESS'
  | 'AI_CULTURE';

export const SOURCE_PACKS: SourcePack[] = [
  'AI_MODEL_FRONTIER',
  'AI_RESEARCH',
  'AI_DEV_SIGNAL',
  'AI_LAW_POLICY',
  'AI_BUSINESS',
  'AI_CULTURE'
];

export const INITIAL_SOURCES: NewsSource[] = [
  // AI_MODEL_FRONTIER
  { id: 'openai-blog', name: 'OpenAI News', type: 'rss', url: 'https://openai.com/news/rss.xml', pack: 'AI_MODEL_FRONTIER', priority: 1, trustTier: 'primary', costTier: 'free', fetchIntervalMinutes: 60, rightsMode: 'excerpt_allowed', enabled: true },
  { id: 'hf-blog', name: 'Hugging Face Blog', type: 'rss', url: 'https://huggingface.co/blog/feed.xml', pack: 'AI_MODEL_FRONTIER', priority: 1, trustTier: 'primary', costTier: 'free', fetchIntervalMinutes: 60, rightsMode: 'excerpt_allowed', enabled: true },
  { id: 'deepmind-blog', name: 'Google DeepMind', type: 'rss', url: 'https://deepmind.google/blog/rss.xml', pack: 'AI_MODEL_FRONTIER', priority: 1, trustTier: 'primary', costTier: 'free', fetchIntervalMinutes: 60, rightsMode: 'excerpt_allowed', enabled: true },
  { id: 'google-research', name: 'Google Research', type: 'rss', url: 'https://research.google/blog/rss.xml', pack: 'AI_MODEL_FRONTIER', priority: 1, trustTier: 'primary', costTier: 'free', fetchIntervalMinutes: 120, rightsMode: 'excerpt_allowed', enabled: true },
  { id: 'meta-ai-blog', name: 'Meta AI', type: 'rss', url: 'https://ai.meta.com/blog/rss/', pack: 'AI_MODEL_FRONTIER', priority: 2, trustTier: 'primary', costTier: 'free', fetchIntervalMinutes: 120, rightsMode: 'excerpt_allowed', enabled: true },
  { id: 'mistral-blog', name: 'Mistral AI', type: 'rss', url: 'https://mistral.ai/news/rss.xml', pack: 'AI_MODEL_FRONTIER', priority: 2, trustTier: 'primary', costTier: 'free', fetchIntervalMinutes: 120, rightsMode: 'excerpt_allowed', enabled: true },
  
  // AI_RESEARCH
  { id: 'arxiv-ai', name: 'arXiv cs.AI', type: 'rss', url: 'http://export.arxiv.org/rss/cs.AI', pack: 'AI_RESEARCH', priority: 1, trustTier: 'expert', costTier: 'free', fetchIntervalMinutes: 240, rightsMode: 'metadata_only', enabled: true },
  { id: 'arxiv-lg', name: 'arXiv cs.LG', type: 'rss', url: 'http://export.arxiv.org/rss/cs.LG', pack: 'AI_RESEARCH', priority: 1, trustTier: 'expert', costTier: 'free', fetchIntervalMinutes: 240, rightsMode: 'metadata_only', enabled: true },
  { id: 'hf-papers', name: 'Hugging Face Papers', type: 'api', url: 'https://huggingface.co/api/daily_papers', pack: 'AI_RESEARCH', priority: 1, trustTier: 'expert', costTier: 'free', fetchIntervalMinutes: 180, rightsMode: 'internal_analysis', enabled: true },
  { id: 'bair-blog', name: 'Berkeley AI Research (BAIR)', type: 'rss', url: 'https://bair.berkeley.edu/blog/feed.xml', pack: 'AI_RESEARCH', priority: 1, trustTier: 'expert', costTier: 'free', fetchIntervalMinutes: 240, rightsMode: 'excerpt_allowed', enabled: true },
  
  // AI_DEV_SIGNAL
  { id: 'nvidia-blog', name: 'NVIDIA Technical', type: 'rss', url: 'https://developer.nvidia.com/blog/feed/', pack: 'AI_DEV_SIGNAL', priority: 1, trustTier: 'expert', costTier: 'free', fetchIntervalMinutes: 120, rightsMode: 'excerpt_allowed', enabled: true },
  { id: 'lillog', name: "Lilian Weng's Lil'Log", type: 'rss', url: 'https://lilianweng.github.io/posts/index.xml', pack: 'AI_DEV_SIGNAL', priority: 1, trustTier: 'expert', costTier: 'free', fetchIntervalMinutes: 360, rightsMode: 'excerpt_allowed', enabled: true },
  { id: 'vllm-blog', name: 'vLLM Project Blog', type: 'rss', url: 'https://blog.vllm.ai/feed.xml', pack: 'AI_DEV_SIGNAL', priority: 1, trustTier: 'expert', costTier: 'free', fetchIntervalMinutes: 240, rightsMode: 'excerpt_allowed', enabled: true },
  { id: 'simon-willison', name: "Simon Willison's Log", type: 'rss', url: 'https://simonwillison.net/atom/entries/', pack: 'AI_DEV_SIGNAL', priority: 2, trustTier: 'expert', costTier: 'free', fetchIntervalMinutes: 120, rightsMode: 'excerpt_allowed', enabled: true },
  { id: 'github-trending', name: 'GitHub Trending AI', type: 'api', url: 'https://api.github.com/search/repositories?q=topic:ai&sort=stars', pack: 'AI_DEV_SIGNAL', priority: 2, trustTier: 'expert', costTier: 'free', fetchIntervalMinutes: 360, rightsMode: 'metadata_only', enabled: true },
  { id: 'hn-ai', name: 'Hacker News AI', type: 'api', url: 'https://hn.algolia.com/api/v1/search?query=AI&tags=story', pack: 'AI_DEV_SIGNAL', priority: 3, trustTier: 'social', costTier: 'free', fetchIntervalMinutes: 30, rightsMode: 'metadata_only', enabled: true },
  
  // AI_LAW_POLICY
  { id: 'eu-ai-act', name: 'EU AI Act / Commission', type: 'html_watch', url: 'https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai', pack: 'AI_LAW_POLICY', priority: 1, trustTier: 'primary', costTier: 'free', fetchIntervalMinutes: 1440, rightsMode: 'internal_analysis', enabled: true },
  { id: 'ftc-news-ai', name: 'FTC News (AI)', type: 'rss', url: 'https://www.ftc.gov/news-events/press-releases/rss.xml', pack: 'AI_LAW_POLICY', priority: 2, trustTier: 'primary', costTier: 'free', fetchIntervalMinutes: 720, rightsMode: 'excerpt_allowed', enabled: true },
  
  // AI_BUSINESS
  { id: 'tc-ai', name: 'TechCrunch AI', type: 'rss', url: 'https://techcrunch.com/category/artificial-intelligence/feed/', pack: 'AI_BUSINESS', priority: 2, trustTier: 'media', costTier: 'free', fetchIntervalMinutes: 60, rightsMode: 'excerpt_allowed', enabled: true },
  { id: 'vb-ai', name: 'VentureBeat AI', type: 'rss', url: 'https://venturebeat.com/category/ai/feed/', pack: 'AI_BUSINESS', priority: 2, trustTier: 'media', costTier: 'free', fetchIntervalMinutes: 60, rightsMode: 'excerpt_allowed', enabled: true },
  
  // AI_CULTURE
  { id: 'wired-ai', name: 'WIRED AI', type: 'rss', url: 'https://www.wired.com/feed/tag/ai/latest/rss', pack: 'AI_CULTURE', priority: 3, trustTier: 'media', costTier: 'free', fetchIntervalMinutes: 180, rightsMode: 'excerpt_allowed', enabled: true },
  { id: 'verge-ai', name: 'The Verge AI', type: 'rss', url: 'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml', pack: 'AI_CULTURE', priority: 3, trustTier: 'media', costTier: 'free', fetchIntervalMinutes: 120, rightsMode: 'excerpt_allowed', enabled: true },
];
