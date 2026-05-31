
export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";

export type EditorialMethodology = 'three-zone' | 'autonomous' | 'chronological';

export type EditorialDepartment = 'Fashion' | 'Cyber' | 'Academic';

export interface SourcingStrategy {
  id: string;
  label: string;
  category: 'Classical' | 'Advanced' | 'Modern/Experimental';
  description: string;
  isActive: boolean;
  isFuture?: boolean;
  configOptions?: { name: string; type: 'boolean' | 'string' | 'number'; defaultValue: any }[];
}

// --- NEWSROOM TYPES ---
export type NewsroomStep = 'IDLE' | 'NEWS_TERMINAL' | 'OBSERVABILITY' | 'EDITORIAL_BOARD' | 'DARKROOM' | 'PRINTING_PRESS' | 'PUBLISHED';

export interface ScoutedSignal {
  id: string;
  headline: string;
  context: string;
  url?: string;
  source?: string;
  date?: string;
  score: number;
}

export interface EditorialAngle {
  id: string;
  persona: string;
  headline: string;
  headlineOptions: string[];
  angle: string;
}

export interface DebateMessage {
  persona: string;
  message: string;
}

export interface SystemLog {
  _id: string;
  timestamp: number;
  agentName: string;
  message: string;
  step: string;
  level?: string;
  type?: 'info' | 'warning' | 'error' | 'action' | 'success';
  source?: string;
  missionId?: string;
}

export interface Source {
  _id: string;
  _creationTime: number;
  name: string;
  url: string;
  type: 'rss' | 'api' | 'github' | 'html_watch';
  pack?: string;
  priority?: number;
  trustTier?: string;
  rightsMode?: string;
  lastFetchedAt: number;
  crawlFrequency: number;
  isActive: boolean;
  notes?: string;
}

export interface CulturalVector {
  trend: string;
  resonance: number; // 0-100
  connection: string;
}

export interface NewsCluster {
  _id: string;
  _creationTime: number;
  title: string;
  summary: string;
  keyEntities: string[];
  lastUpdatedAt: number;
  status: 'emerging' | 'trending' | 'archived';
  cultural_context?: string;
  missionId?: string;
  articleCount?: number;
}

export interface Signal {
  _id: string;
  _creationTime: number;
  title: string;
  source: string;
  sourceId?: string;
  sourcePack?: string;
  sourceTrustTier?: string;
  qualityScore?: number;
  hash?: string;
  url: string;
  content?: string;
  timestamp: number;
  status: 'new' | 'processing' | 'archived';
  storyId?: string;
  embedding?: number[];
  innovation_score?: number;
  sourceType?: string;
  cultural_vectors?: CulturalVector[];
  missionId?: string;
}

export interface WorkbenchSession {
  _id: string;
  _creationTime: number;
  signals: string[]; // references Signal _ids
  context?: string;
  status: 'active' | 'processing' | 'completed';
  updated_at: number;
  created_at: number;
}

export interface StoryAngle {
  _id: string;
  _creationTime: number;
  workbenchId: string;
  title: string;
  summary: string;
  selected: boolean;
  created_at: number;
}

export interface DraftSentence {
  id: string;
  text: string;
}

export interface DraftBlock {
  id: string;
  type: 'p' | 'h2' | 'h3' | 'quote';
  sentences: DraftSentence[];
  status?: 'clean' | 'flagged';
}

export interface BlockAnnotation {
  id: string;
  blockId: string;
  sentenceId?: string; // Optional: if omitted, applies to the whole block
  persona?: string; // e.g., "The Critic", "The Fashion-Forward"
  type: 'TONE_MISMATCH' | 'CLARITY' | 'FACT_CHECK' | 'STYLE';
  comment: string;
  suggestion?: string;
}

export interface GeneratedArticle {
  _id?: string;
  _creationTime?: number;
  storyId?: string;
  headline: string;
  deck: string;
  body: string; // Legacy support
  blocks: DraftBlock[]; // New structured format
  tags: string[];
  suggested_visual_prompt: string;
}

// --- v3.0 LAYOUT ENGINE TYPES ---
export type MagazineItemStatus = 'ingested' | 'approved' | 'rejected' | 'published' | 'review';
export type FeaturedLevel = 'none' | 'featured' | 'hero';

export interface MagazineItemScore {
    recency: number;
    trust: number;
    novelty: number;
    visual_fit: number;
    final: number;
}

export interface MagazineItem {
    id: string;
    source_id?: string;
    title: string;
    dek?: string;
    url?: string;
    domain?: string;
    published_at: string;
    author?: string;
    
    // Content
    raw_excerpt?: string;
    body?: string; // Full text content
    blocks?: any[]; // Structured content (DraftBlock[])
    media_type: 'text' | 'image' | 'video' | 'audio';
    hero_image_url?: string;
    tags: string[];
    
    // State
    status: MagazineItemStatus;
    featured_level: FeaturedLevel;
    score?: MagazineItemScore;
    
    // Editorial Enrichment
    editorial_summary?: string;
    public_comments?: Array<{ persona: string; avatar_vibe: string; comment: string; replies?: Array<{ user: string; ai: string }> }>;
}

export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  headline: string;
  blockType: string;
  data?: MagazineItem;
}

export interface IssueMeta {
  run_id: string;
  issue_id: string;
  vol: string;
  theme: string;
  date: string;
  editor: string;
  status: string;
  template_key: string;
  metrics: {
    signals_ingested: number;
    avg_confidence: number;
    error_rate: number;
  };
}

export interface DropArtifact { id: string; name: string; url: string }
export interface DebateArtifact { id: string; transcript: DebateMessage[] }
export interface StoryArtifact { id: string; content: string }
export interface RecipeArtifact { id: string; instructions: string }

export interface SearchResult {
  text: string;
  groundingUrls: { title: string; url: string }[];
}

export interface IssueContent {
  meta: IssueMeta;
  ticker: string[];
  cover: {
    eyebrow: string;
    title: string;
    deck: string;
    coverlines: Array<{ eyebrow: string; title: string; deck: string }>;
    imgPrompt: string;
    img_base64?: string;
  };
  
  // Content Pools
  items?: MagazineItem[];
  layout?: LayoutItem[];
  drops: DropArtifact[];
  edit: Array<{ category: string; title: string; desc: string }>;
  debates: DebateArtifact[];
  features: StoryArtifact[];
  columns: StoryArtifact[];
  atelier: RecipeArtifact[];
  index_keys: Array<{ term: string; category: string }>;
  colophon: {
    contributors: string[];
    sources: string[];
    corrections: string[];
  };
}

// --- ATELIER TYPES (Visual Engine v2) ---

export type AtelierLayoutMode = 'COVER' | 'FEATURE' | 'COLUMN' | 'SOCIAL';

export interface ColorPalette {
  id: string;
  name: string;
  colors: string[]; // Hex codes
  vibe: string;
}

export interface VisualConcept {
  id: string;
  name: string; // e.g., "The Literal", "The Metaphor", "The Vibe"
  description: string;
  prompt: string;
  rationale: string;
}

export interface AtelierState {
  concepts: VisualConcept[];
  activeConceptId: string | null;
  layout: AtelierLayoutMode;
  activePalette: ColorPalette | null;
  suggestedPalettes: ColorPalette[];
  customPrompt: string;
  modifiers: string[];
  currentImageId: string | null;
  currentImageBase64?: string;
  isGenerating: boolean;
  history: ImageHistoryItem[];
}

export interface ImageHistoryItem {
  id: string;
  url: string;
  base64?: string;
  imageId?: string; // Convex ID for persistence
  prompt: string;
  timestamp: number;
  layout: AtelierLayoutMode;
  palette?: string;
}

// --- SEED EXPLORATION & LEGAL COMPLIANCE TYPES ---
export interface Claim {
  claimText: string;
  sourceUrl: string;
  sourceName: string;
  entities: string[];
  confidence: number;
  claimType: "funding" | "launch" | "lawsuit" | "research" | "policy" | "market" | "unspecified";
}

export interface SimilarityReport {
  score: number; // Safety distance score (0-100)
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

