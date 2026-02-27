
export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";

// --- NEWSROOM TYPES ---
export type NewsroomStep = 'IDLE' | 'SCOUTING' | 'DEBATING' | 'WRITING' | 'VISUALIZING' | 'REVIEW' | 'PUBLISHED';

export interface EditorialAngle {
  id: string;
  persona: string;
  headline: string;
  angle: string;
}

export interface DebateMessage {
  persona: string;
  message: string;
}

export interface SystemLog {
  id: string;
  timestamp: Date;
  agent: string;
  message: string;
  level: 'info' | 'action' | 'success' | 'error' | 'warning';
}

export interface TickerItem {
  id: string;
  text: string;
  source: string;
  timestamp: string;
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
  headline: string;
  deck: string;
  body: string; // Legacy support
  blocks: DraftBlock[]; // New structured format
  tags: string[];
  suggested_visual_prompt: string;
}

// --- v3.0 LAYOUT ENGINE TYPES ---

// 1. CONTENT ENTITIES
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
    media_type: 'text' | 'image' | 'video' | 'audio';
    hero_image_url?: string;
    tags: string[];
    
    // State
    status: MagazineItemStatus;
    featured_level: FeaturedLevel;
    score?: MagazineItemScore;
    
    // Editorial Enrichment
    editorial_summary?: string;
    generated_layout_config?: any;
}

export type StatementType = 'hero_phrase' | 'quote' | 'manifesto' | 'micro_lane';

export interface Statement {
    id: string;
    type: StatementType;
    text: string;
    tags: string[];
    status: 'draft' | 'approved';
}

// 2. LAYOUT & BLOCKS
export type BlockType = 
    // Chrome
    | 'MastheadLane' 
    | 'TopicTicker' 
    | 'StatsStrip'
    // Content
    | 'HeroTypePlate' 
    | 'FeatureCard' 
    | 'FeatureTriptych'
    | 'QuotePlate' 
    | 'BlackManifestoPanel' 
    | 'CategoryColumn'
    | 'TeaserIndexRail'
    | 'KitFeatureCTA'
    | 'MicroIndex';

export type BlockVariant = 'S' | 'M' | 'L' | 'XL';
export type ChaosType = 'none' | 'breakout_left' | 'breakout_right' | 'overlap_badge' | 'tilt_hover';

export interface BlockInstance {
    id: string;
    block_type: BlockType;
    col_span: number; // 1-12
    row_span?: number;
    variant: BlockVariant;
    chaos_type?: ChaosType; // NEW: Controls grid breaking
    locked?: boolean; // NEW: Protects slot from Metamorphosis/Rotation
    
    // Data Binding
    data_binding: {
        source: 'static' | 'query' | 'pinned';
        query_tags?: string[];
        query_limit?: number;
        pinned_item_id?: string;
        static_content?: any;
    };
}

export interface Section {
    id: string;
    order: number;
    layout_mode: 'grid_12' | 'grid_12_dense' | 'flex_row' | 'fixed_height';
    blocks: BlockInstance[];
    className?: string; // For chaos moves or specific spacing
}

export interface PageTemplate {
    key: string; // e.g., 'T1_CoverRail'
    name: string;
    description: string;
    sections: Section[];
}

export interface Issue {
    id: string;
    issue_no: number;
    title: string;
    template_key: string;
    items: MagazineItem[];
    statements: Statement[];
    published_at?: string;
}


// --- LEGACY / MIGRATION TYPES (To be deprecated) ---
export interface SearchResult {
  text: string;
  groundingUrls: Array<{ title: string; url: string }>;
}

export type ArtifactStatus = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED' | 'REJECTED';
export type ColumnistPersona = 'THE_CRITIC' | 'THE_OPTIMIST' | 'THE_GHOST';
export type AgentRole = 'SCOUT' | 'CRITIC' | 'WRITER' | 'EDITOR' | 'ARTIST' | 'ENGINEER';
export type AgentStatus = 'IDLE' | 'THINKING' | 'WORKING' | 'WAITING' | 'DONE' | 'ERROR';

export interface AgentDef {
    id: string;
    name: string;
    role: AgentRole;
    description: string;
    color: string;
    icon: string;
}

export interface AgentJob {
    agentId: string;
    status: AgentStatus;
    currentTask: string;
    progress: number;
    lastActive: number;
}

export type ContentTopic = 'CREATIVE' | 'ENGINEERING' | 'BUSINESS' | 'CULTURE';
export type ContentFormat = 'ESSAY' | 'TOOL' | 'CASE_STUDY' | 'TUTORIAL' | 'MANIFESTO';
export type MediaType = 'TEXT' | 'VIDEO' | 'AUDIO' | '3D_MODEL';

export interface RetrievalItem {
  title: string;
  url: string;
  snippet: string;
  source_domain: string;
}

export interface RetrievalSnapshot {
  id: string;
  query: string;
  timestamp: string;
  items: RetrievalItem[];
}

export interface IssueMeta {
  run_id: string;
  issue_id: string;
  vol: string;
  theme: string;
  date: string;
  editor: string;
  template_key?: string; // NEW: Controls the active layout
  chaos_budget?: number; // 0-2 (0=Clean, 1=Editorial, 2=Experimental)
  status: 'COLLECTING' | 'DEBATING' | 'WRITING' | 'LAYOUT' | 'PUBLISHED';
  metrics?: {
    signals_ingested: number;
    diversity_score?: number;
    avg_confidence: number;
    error_rate: number;
  };
  ticker?: string[];
}

export interface Lead {
  id: string;
  target_topic: string;
  headline: string;
  score: number;
  type: 'BREAKING' | 'ANALYSIS' | 'FEATURE' | 'NOISE';
  context: string;
  source_ref?: string;
  why_now?: string;
  risk_classification?: 'LEGAL' | 'MEDICAL' | 'MARKET' | 'BRAND' | 'NONE';
  editorial_metrics?: {
      trust: number;
      novelty: number;
      impact: number;
      editorial_fit: number;
  };
  detected_topic?: ContentTopic;
  detected_format?: ContentFormat;
  duplicate?: boolean;
}

export interface SignalClaim {
  id: string;
  text: string;
  status: 'VERIFIED' | 'DISPUTED' | 'SPECULATIVE';
  confidence: number;
  supporting_sources: number[];
  evidence_snippet?: string;
  explanation?: string;
}

export interface ScoringMatrix {
  novelty: number;
  cultural_voltage: number;
  practical_craft: number;
  proof_strength: number;
  heat: number;
  longevity: number;
}

export interface SignalDossier {
  id: string;
  topic: string;
  retrieval_snapshot: RetrievalSnapshot;
  title_candidate?: string;
  what_happened?: string;
  why_now?: string;
  one_liner?: string;
  source_url?: string;
  source_urls?: string[];
  claims: SignalClaim[];
  primary_sources?: Array<{ title: string; url: string; type: 'doc' | 'paper' | 'release' | 'repo' }>;
  secondary_sources?: Array<{ title: string; url: string; type: 'news' | 'opinion' | 'social' }>;
  entities?: string[];
  tags?: {
    topic_cluster: string;
    format: string;
    complexity: 'low' | 'mid' | 'high';
  };
  scores: ScoringMatrix;
  risk_flags?: string[];
  timestamp?: string;
  verdict?: Placement;
}

export type Signal = SignalDossier;
export type Placement = 'COVER' | 'FEATURE' | 'COLUMN' | 'ATELIER' | 'NOTE' | 'INDEX' | 'DROP' | 'HOLD';

export interface Pitch {
  id: string;
  agent_role: 'CRITIC' | 'RUNWAY' | 'ATELIER';
  angle: string;
  thesis_fit: string;
  cultural_voltage: number;
  craft_potential: number;
  suggested_placement: Placement;
  risk_summary: string;
  suggested_persona?: ColumnistPersona;
  suggested_topic?: ContentTopic;
  suggested_format?: ContentFormat;
}

export interface Verdict {
  signal_id: string;
  selected_pitch_id?: string;
  placement: Placement;
  confidence_gate: 'PUBLISH_READY' | 'NEEDS_PROOF' | 'OPINION_LABEL';
  tone_directives: string;
  reason: string;
  required_assets: string[];
  assigned_persona?: ColumnistPersona;
  assigned_topic: ContentTopic;
  assigned_format: ContentFormat;
  primary_media: MediaType;
}

export interface DebateArtifact {
  id: string;
  topic: string;
  dossier: SignalDossier;
  scores: ScoringMatrix;
  pitches: Pitch[];
  verdict?: Verdict;
}

export interface HeadlineSet {
  vogue_verdict: string[];
  new_yorker_wit: string[];
  paradox: string[];
  neutral: string[];
  deks: string[];
  functional_copy?: {
      cover_line: string;
      index_line: string;
      social_teaser: string;
  };
}

export interface HeadlineDecisionLog {
  candidate_id: string;
  selected_text: string;
  rejected_candidates: string[];
  reasoning: string;
  cultural_voltage_score: number;
  risk_score: number;
}

export interface CritiquePoint {
    point: string;
    paragraph_indices: number[];
}

export interface RewriteIter {
    version: number;
    text: string[];
    critique?: string;
    structured_critique?: CritiquePoint[];
    diff_summary?: string;
}

export interface RewriteChain {
    id: string;
    draft: RewriteIter;
    rewrite: RewriteIter;
}

export interface StoryOutline {
  lead: string;
  beats: string[];
  turn: string;
  close: string;
}

export interface Citation {
  source: string;
  confidence: number;
}

export interface Footnote {
  id: string;
  ref: string;
  text: string;
  type: 'provenance' | 'hallucination_check' | 'nerd_humor';
}

export interface FactCheckReport {
  approved: boolean;
  issues: string[];
  corrections: string[];
}

export interface ImageBrief {
  concept: string;
  visual_metaphor: string;
  color_palette: string;
  composition: string;
  technical_prompt: string;
}

export interface LayoutDirectives {
  template: 'MINIMAL' | 'EDITORIAL' | 'IMMERSIVE';
  headline_scale: 'STANDARD' | 'MASSIVE' | 'DISPLAY';
  hero_position: 'TOP' | 'SPLIT_RIGHT' | 'BACKGROUND';
  alignment: 'LEFT' | 'CENTER';
  drop_cap: boolean;
}

export interface Proposal {
    id: string;
    type: 'REWRITE' | 'FACT_CHECK' | 'HEADLINE_GEN' | 'IMAGE_GEN' | 'DROP_CLAIM';
    label: string;
    impact: string;
    agent: AgentRole;
    scope: 'FULL' | 'HEADLINE' | 'BODY';
    params?: any;
    cost_estimate?: string;
    confidence_delta?: number;
    risk_delta?: number;
}

export interface StoryVariant {
    id: string;
    timestamp: number;
    headline: string;
    body: string[];
    diff_summary?: string;
}

export interface SourceMix {
    mainstream: boolean;
    indie: boolean;
    academic: boolean;
    social: boolean;
}

export interface ToneProfile {
    drama: number;
    precision: number;
    metaphor_density: number;
    adjective_budget: number;
    sentence_mode: 'TIGHT' | 'MIXED' | 'LONG';
}

export interface SignatureBlock {
    id: string;
    type: 'THE_CANON' | 'COUNTERPOINT' | 'VERDICT' | 'DELTA' | 'QUOTE';
    heading: string;
    content: string;
}

export interface StoryArtifact {
  id: string;
  signal_id: string;
  placement: Placement;
  status: ArtifactStatus; 
  author_persona?: ColumnistPersona;
  category: string;
  headline: string;
  deck: string;
  body: string[];
  footnotes: Footnote[];
  pull_quote: string;
  citations: Citation[];
  img_prompt: string;
  img_brief?: ImageBrief;
  layout?: LayoutDirectives;
  img_caption: string;
  img_base64?: string;
  fact_check_report?: FactCheckReport;
  rewrite_chain?: RewriteChain;
  headline_log?: HeadlineDecisionLog;
  headline_candidates?: HeadlineSet;
  topic: ContentTopic;
  format: ContentFormat;
  media_type: MediaType;
  variants?: StoryVariant[];
  pending_proposals?: Proposal[];
  drift_metric?: {
      score: number;
      last_check: string;
      contradictions: string[];
  };
  tone_profile?: ToneProfile;
  signature_blocks?: SignatureBlock[];
}

export interface DropArtifact {
  id: string;
  signal_id: string;
  placement: 'DROP' | 'NOTE';
  status: ArtifactStatus;
  category: string; 
  headline: string; 
  body: string; 
  footer_context: string; 
  label: 'Reported' | 'Opinion' | 'Experimental';
  citations: Citation[];
  topic: ContentTopic;
  format: ContentFormat;
}

export type Story = StoryArtifact;

export interface RecipeArtifact {
  id: string;
  status: ArtifactStatus; 
  title: string;
  intent: string;
  ingredients: string[];
  params: Record<string, string>;
  steps: string[];
  failure_modes: string[];
  warning?: string;
}

export type Recipe = RecipeArtifact;

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
  
  // v3.0 Layout Data
  sections?: Section[]; // NEW: Layout Persistence
  
  // Content Pools
  items?: MagazineItem[];
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

export interface AgentLog {
  id: string;
  timestamp: string;
  phase: string;
  agent: string; 
  message: string;
  data?: any;
}
