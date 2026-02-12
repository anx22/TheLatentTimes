
export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";

export interface SearchResult {
  text: string;
  groundingUrls: Array<{ title: string; url: string }>;
}

export type ArtifactStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'REJECTED';
export type ColumnistPersona = 'THE_CRITIC' | 'THE_OPTIMIST' | 'THE_GHOST';

// --- AGENT SYSTEM TYPES ---
export type AgentRole = 'SCOUT' | 'CRITIC' | 'WRITER' | 'EDITOR' | 'ARTIST' | 'ENGINEER';
export type AgentStatus = 'IDLE' | 'THINKING' | 'WORKING' | 'WAITING' | 'DONE' | 'ERROR';

export interface AgentDef {
    id: string;
    name: string;
    role: AgentRole;
    description: string;
    color: string; // Tailwind class partial e.g. "emerald"
    icon: string;
}

export interface AgentJob {
    agentId: string;
    status: AgentStatus;
    currentTask: string; // "Scanning 45 URLs..."
    progress: number; // 0-100
    lastActive: number; // Timestamp
}

// --- DIVERSITY TAXONOMY (The Mix) ---
export type ContentTopic = 'CREATIVE' | 'ENGINEERING' | 'BUSINESS' | 'CULTURE';
export type ContentFormat = 'ESSAY' | 'TOOL' | 'CASE_STUDY' | 'TUTORIAL' | 'MANIFESTO';
export type MediaType = 'TEXT' | 'VIDEO' | 'AUDIO' | '3D_MODEL';

// --- PHASE 0: RETRIEVAL & SNAPSHOTS (PLAN v3.0 SEC 4) ---
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

// --- PHASE 0: TRIGGER & METADATA ---
export interface IssueMeta {
  run_id: string;
  issue_id: string;
  vol: string;
  theme: string;
  date: string;
  editor: string;
  status: 'COLLECTING' | 'DEBATING' | 'WRITING' | 'LAYOUT' | 'PUBLISHED';
  metrics?: {
    signals_ingested: number;
    diversity_score?: number; // New Metric
    avg_confidence: number;
    error_rate: number;
  };
  ticker?: string[];
}

// --- PHASE 0.5: SCANNING (NEW) ---
export interface Lead {
  id: string;
  target_topic: string; // The search term used
  headline: string;
  score: number; // 0-10 Relevance
  type: 'BREAKING' | 'ANALYSIS' | 'FEATURE' | 'NOISE';
  context: string; // Brief summary for the editor
  source_ref?: string; // Domain that triggered this
  
  // UI SPEC ADDITIONS (STEP 1)
  why_now?: string; // Short urgency context
  risk_classification?: 'LEGAL' | 'MEDICAL' | 'MARKET' | 'BRAND' | 'NONE';
  editorial_metrics?: {
      trust: number; // 0-100
      novelty: number; // 0-100
      impact: number; // 0-100
      editorial_fit: number; // 0-100
  };

  // Diversity Hints (Pre-Commission)
  detected_topic?: ContentTopic;
  detected_format?: ContentFormat;
}

// --- PHASE 1: SIGNAL COLLECTION ---
export interface ScoringMatrix {
  novelty: number;        // 0-5
  cultural_voltage: number; // 0-5
  practical_craft: number;  // 0-5
  proof_strength: number;   // 0-5
  heat: number;           // 0-5
  longevity: number;      // 0-5
}

// UPDATED FOR STEP 2: FORENSIC CLAIMS
export interface SignalClaim {
  id: string;
  text: string;
  status: 'VERIFIED' | 'DISPUTED' | 'SPECULATIVE';
  confidence: number; // 0-100
  supporting_sources: number[]; // Indices of RetrievalItems that support this
  evidence_snippet?: string; // Direct quote from source
  explanation?: string; // Why is it disputed/speculative?
}

// Strict Dossier Schema
export interface SignalDossier {
  id: string;
  topic: string;
  retrieval_snapshot: RetrievalSnapshot; // AUDIT TRAIL (Now Mandatory)
  
  // Optional/Progressive fields
  title_candidate?: string; // "Working Title"
  what_happened?: string; // 1 sentence
  why_now?: string; // 1 sentence
  
  // Fields used by agents/legacy code
  one_liner?: string;
  source_url?: string;
  source_urls?: string[];

  claims: SignalClaim[];
  
  // Categorized Sources
  primary_sources?: Array<{ title: string; url: string; type: 'doc' | 'paper' | 'release' | 'repo' }>;
  secondary_sources?: Array<{ title: string; url: string; type: 'news' | 'opinion' | 'social' }>;
  
  entities?: string[]; // Detected Tools/People/Orgs
  tags?: {
    topic_cluster: string;
    format: string;
    complexity: 'low' | 'mid' | 'high';
  };
  
  scores: ScoringMatrix;
  risk_flags?: string[]; // Marketing fluff, unclear demo, etc.
  
  timestamp?: string;
  verdict?: Placement; // Assigned in Phase 2/3
}

export type Signal = SignalDossier;

// --- PHASE 2 & 3: PITCH & VERDICT ---
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
  suggested_persona?: ColumnistPersona; // New for Iteration 2
  
  // Diversity Suggestions
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
  assigned_persona?: ColumnistPersona; // New for Iteration 2
  
  // Final Diversity Assignment
  assigned_topic: ContentTopic;
  assigned_format: ContentFormat;
  primary_media: MediaType;
}

// NEW FOR ITERATION 8 (The Big Plan): Debate Artifact
export interface DebateArtifact {
  id: string; // matches signal_id
  topic: string;
  dossier: SignalDossier; // NEW: Full Forensic Context
  scores: ScoringMatrix;
  pitches: Pitch[];
  verdict?: Verdict;
}

// --- PHASE 4: WRITING PIPELINE ARTIFACTS ---

export interface HeadlineSet {
  vogue_verdict: string[]; // Authoritative
  new_yorker_wit: string[]; // Dry/Clever
  paradox: string[]; // Backslash/Contrast
  neutral: string[]; // Index style
  deks: string[];
  // Plan v3 Section 9.3: Headline Types (By Function)
  functional_copy?: {
      cover_line: string; // Max statement
      index_line: string; // Signal utility
      social_teaser: string; // Engagement hook
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
    paragraph_indices: number[]; // Indices in the *rewritten* text
}

export interface RewriteIter {
    version: number;
    text: string[]; // body paragraphs
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
  beats: string[]; // The main points
  turn: string; // The contrarian or deepening angle
  close: string;
}

// --- PHASE 4 & 5: ASSETS (STORY & RECIPE) ---
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

// New for Iteration 3: Structured Visual Brief
export interface ImageBrief {
  concept: string;
  visual_metaphor: string;
  color_palette: string;
  composition: string;
  technical_prompt: string; // The actual midjourney/flux string
}

// NEW FOR ITERATION 2.0 (Layout Intelligence)
export interface LayoutDirectives {
  template: 'MINIMAL' | 'EDITORIAL' | 'IMMERSIVE';
  headline_scale: 'STANDARD' | 'MASSIVE' | 'DISPLAY';
  hero_position: 'TOP' | 'SPLIT_RIGHT' | 'BACKGROUND';
  alignment: 'LEFT' | 'CENTER';
  drop_cap: boolean;
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
  img_prompt: string; // Legacy simple prompt
  img_brief?: ImageBrief; // New detailed brief
  layout?: LayoutDirectives; // NEW: The Art Director's instructions
  img_caption: string;
  img_base64?: string; // NEW: The actual generated image
  fact_check_report?: FactCheckReport; // NEW: Verification result
  
  // Phase 4 Audit Trail
  rewrite_chain?: RewriteChain;
  headline_log?: HeadlineDecisionLog;
  headline_candidates?: HeadlineSet; // Store full set for UI

  // Diversity Tags
  topic: ContentTopic;
  format: ContentFormat;
  media_type: MediaType;
}

// ITERATION 1: DROP ARTIFACT (Strict Format)
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
  
  // Recipes are implicitly ENGINEERING / TOOL
}

export type Recipe = RecipeArtifact;

// --- PHASE 6 & 7: ASSEMBLY & ISSUE ---
export interface IssueContent {
  meta: IssueMeta;
  ticker: string[];
  
  cover: {
    eyebrow: string;
    title: string;
    deck: string;
    coverlines: Array<{ eyebrow: string; title: string; deck: string }>;
    imgPrompt: string;
    img_base64?: string; // NEW: The actual cover image
  };
  
  // Updated for Iteration 1: Now supports full Drops, falls back to legacy simple items if needed
  drops: DropArtifact[];
  edit: Array<{ category: string; title: string; desc: string }>; // Legacy/Fallback
  
  // NEW: Debate Transcripts (Visible in Newsroom)
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
