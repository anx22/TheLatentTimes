

import { IssueContent, SignalDossier, StoryArtifact, RecipeArtifact, DropArtifact, ColumnistPersona, DebateArtifact, Lead, RetrievalSnapshot, RetrievalItem, AgentLog, IssueMeta, AgentRole } from "../types";
import { 
  agentQueryOrchestrator, agentDossierCompiler, agentArchivist, 
  agentPitching, agentVerdict, 
  agentHeadlineForge, agentHeadlineSelector, agentOutline, agentDraft, agentRewrite, agentFactCheck,
  agentEngineer, agentRecipeValidator, agentVariationsGenerator,
  agentLayout,
  agentDropWriter,
  agentColumnist,
  agentImageBrief,
  agentLayoutDirectives,
  agentScanner,
  agentFeedReader
} from "./engine-agents";
import type { RunConfig } from "../hooks/useNewsroom";
import { generateImage, safeGenerateContent, Type, cleanAndParseJSON } from "./gemini";

// Plan v3 Section 12.1: WHITELIST
const TRUSTED_DOMAINS = [
    'arxiv.org', 'github.com', 'huggingface.co', 'civitai.com',
    'techcrunch.com', 'theverge.com', 'vogue.com', 'dazeddigital.com',
    'nytimes.com', 'bloomberg.com', 'wired.com', 'ycombinator.com',
    'simonwillison.net', 'interconnected.org', 'stratechery.com'
];

type OrchestratorCallbacks = {
    onLog: (log: AgentLog) => void;
    onAgentStart: (role: AgentRole, task: string) => void;
    onAgentUpdate: (role: AgentRole, task: string, progress: number) => void;
    onAgentFinish: (role: AgentRole) => void;
    onAgentFail: (role: AgentRole, error: string) => void; // New callback
};

// REFACTORED: Stateless Execution Engine
export class IssueOrchestrator {
  private callbacks: OrchestratorCallbacks;
  
  constructor(callbacks: OrchestratorCallbacks) {
    this.callbacks = callbacks;
  }

  private log(agent: string, message: string, data?: any) {
    this.callbacks.onLog({
      id: Math.random().toString(36),
      timestamp: new Date().toLocaleTimeString(),
      phase: 'EXEC',
      agent,
      message,
      data
    });
  }

  // --- HELPER: DEDUPLICATION ---
  private normalizeString(str: string): string {
      return str.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  }

  private isDuplicate(text: string, existing: Set<string>): boolean {
      const normalized = this.normalizeString(text);
      for (const item of existing) {
          const normItem = this.normalizeString(item);
          if (normItem === normalized) return true;
          // Simple fuzzy check: substring match if length is significant
          if (normalized.length > 20 && normItem.includes(normalized)) return true;
          if (normItem.length > 20 && normalized.includes(normItem)) return true;
      }
      return false;
  }

  // --- HELPER: SEARCH (RETRIEVAL LAYER) ---
  private async executeSearch(query: string, useDemo: boolean): Promise<RetrievalSnapshot> {
    if (useDemo) return this.getMockSearchResults(query);

    try {
      this.callbacks.onAgentStart('SCOUT', `Searching ground truth for "${query}"...`);
      const response = await safeGenerateContent({
        model: 'gemini-3-flash-preview',
        contents: `Search for: "${query}". Return JSON object with 'items' [{title, url, source_domain, snippet}].`,
        config: { 
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    items: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                url: { type: Type.STRING },
                                source_domain: { type: Type.STRING },
                                snippet: { type: Type.STRING }
                            }
                        }
                    }
                }
            }
        }
      });
      
      const raw = cleanAndParseJSON(response.text);
      const items: RetrievalItem[] = (raw.items || []).map((i: any) => ({
          title: i.title || "Untitled", url: i.url || "", source_domain: i.source_domain || "unknown", snippet: i.snippet || "No details."
      })).sort((a: any, b: any) => {
          const aTrust = TRUSTED_DOMAINS.some(d => a.source_domain.includes(d)) ? 1 : 0;
          const bTrust = TRUSTED_DOMAINS.some(d => b.source_domain.includes(d)) ? 1 : 0;
          return bTrust - aTrust;
      });

      this.callbacks.onAgentFinish('SCOUT');
      return { id: `snap_${Date.now()}`, query, timestamp: new Date().toISOString(), items: items.slice(0, 8) };

    } catch (e: any) {
      this.log('SYS', `Search Error`, {error: e.message});
      this.callbacks.onAgentFail('SCOUT', e.message);
      return { id: 'error', query, timestamp: new Date().toISOString(), items: [] };
    }
  }

  private getMockSearchResults(query: string): RetrievalSnapshot {
    return {
        id: `snap_${Date.now()}`, query, timestamp: new Date().toISOString(),
        items: [{ title: "Mock Signal A", url: "https://test.local/a", snippet: "Test signal A.", source_domain: "test.local" }]
    };
  }

  // --- WORKFLOW 1: SCAN ---
  public async scan(
      targets: string[], 
      useDemo: boolean, 
      history?: { headlines: Set<string> }
  ): Promise<Lead[]> {
      this.callbacks.onAgentStart('SCOUT', 'Scanning wire targets...');
      
      try {
        const promises = targets.map(async (target) => {
             if (target === 'FEEDS') {
                this.callbacks.onAgentUpdate('SCOUT', 'Polling RSS Feed Whitelist...', 20);
                if (useDemo) return await agentScanner("SYSTEM_SEED", { id: 'mock', query: 'mock', timestamp: '', items: [] });
                const feedItems = await agentFeedReader();
                if (feedItems.length === 0) return [];
                const feedLeads = await agentScanner("FEED_INGEST", { id: `feed_${Date.now()}`, query: 'RSS', timestamp: '', items: feedItems });
                return feedLeads;
            }

            // Normal Search
            this.callbacks.onAgentUpdate('SCOUT', `Sector scan: ${target}`, 50);
            const snapshot = await this.executeSearch(target, useDemo);
            if (snapshot.items.length > 0) {
              return await agentScanner(target, snapshot);
            }
            return [];
        });

        const results = await Promise.all(promises);
        const flatLeads = results.flat();

        // DEDUPLICATION LOGIC
        if (history) {
            flatLeads.forEach(lead => {
                if (this.isDuplicate(lead.headline, history.headlines)) {
                    lead.duplicate = true;
                }
            });
        }

        this.callbacks.onAgentFinish('SCOUT');
        return flatLeads;

      } catch(e: any) {
          this.log('SYS', 'Scan Error', { message: e.message });
          this.callbacks.onAgentFail('SCOUT', e.message);
          return [];
      }
  }

  // --- WORKFLOW 2: COMMISSION ---
  public async commission(
    lead: Lead, 
    theme: string, 
    useDemo: boolean, 
    config: RunConfig, 
    onUpdate: (partial: IssueContent) => void,
    // Context needed for state rebuilding
    context: {
        signals: SignalDossier[],
        debates: DebateArtifact[],
        stories: StoryArtifact[],
        recipes: RecipeArtifact[],
        drops: DropArtifact[],
        meta?: IssueMeta
    }
  ): Promise<IssueContent | null> {
      try {
        // DEDUPLICATION GATE
        if (lead.duplicate) {
             this.log('SYS', `Commission Aborted: Duplicate Detected for "${lead.headline}"`);
             return null;
        }
        
        const existingHeadlines = new Set([
            ...context.stories.map(s => s.headline),
            ...context.stories.map(s => s.deck),
            ...context.drops.map(d => d.headline)
        ]);
        
        if (this.isDuplicate(lead.headline, existingHeadlines)) {
             this.log('SYS', `Commission Aborted: Story already exists similar to "${lead.headline}"`);
             return null;
        }

        this.log('SYS', `Commissioning: ${lead.headline}`);
        
        // 1. RESEARCH
        const overrides = config.overrides || {};
        this.callbacks.onAgentStart('SCOUT', 'Deep Research & Dossier Compilation');
        
        const searchQuery = overrides.focusQuery || lead.headline;
        const snapshot = await this.executeSearch(searchQuery, useDemo);
        const dossier = await agentDossierCompiler(lead.headline, snapshot);
        context.signals.push(dossier);
        this.callbacks.onAgentFinish('SCOUT');

        // 2. DEBATE
        this.callbacks.onAgentStart('CRITIC', 'Analyzing Voltage & Risk');
        const pitches = await agentPitching(dossier, theme);
        
        this.callbacks.onAgentStart('EDITOR', 'Deliberating Verdict');
        const verdict = await agentVerdict(dossier, pitches, config);
        this.callbacks.onAgentFinish('CRITIC');
        this.callbacks.onAgentFinish('EDITOR');
        
        context.debates.push({
          id: dossier.id,
          topic: dossier.topic,
          dossier: dossier,
          scores: dossier.scores,
          pitches: pitches,
          verdict: verdict
        });

        // 3. UPDATE STREAM
        // OPTIMIZATION: Passing context.meta ensures we don't regen tickers
        let currentIssue = await agentLayout(theme, context.signals, context.stories, context.recipes, [], context.drops, context.debates, context.meta);
        onUpdate(currentIssue);

        // 4. PRODUCTION
        if (['COVER', 'FEATURE', 'COLUMN'].includes(verdict.placement)) {
            this.callbacks.onAgentStart('WRITER', 'Forging Headlines & Outlines');
            
            // OPTIMIZATION: Parallel Forge/Outline
            const [headlines, outline] = await Promise.all([
                agentHeadlineForge(dossier, verdict),
                agentOutline(dossier, verdict)
            ]);

            const { selected, log: headlineLog } = await agentHeadlineSelector(headlines, verdict);
            
            this.callbacks.onAgentUpdate('WRITER', 'Drafting manuscript...', 30);
            
            let story: StoryArtifact;
            if (verdict.placement === 'COLUMN') {
                const personas: ColumnistPersona[] = ['THE_CRITIC', 'THE_OPTIMIST', 'THE_GHOST'];
                const assignedPersona = personas[Math.floor(Math.random() * personas.length)];
                story = await agentColumnist(dossier, verdict, selected, outline, assignedPersona);
            } else {
                story = await agentDraft(dossier, verdict, selected, outline, config);
            }

            story.headline_log = headlineLog;
            story.headline_candidates = headlines;

            // --- OPTIMIZATION: PARALLEL TRACKS (TEXT vs VISUAL) ---
            // Track A: Text Polish (Rewrite -> Fact Check)
            const textTrack = async () => {
                this.callbacks.onAgentUpdate('WRITER', 'Rewrite Pass (Tone Injection)...', 60);
                const toneInstruction = `${verdict.tone_directives}. Target Audience: ${overrides.audienceLevel || 'Expert'}.`;
                const rewriteResult = await agentRewrite(story.body, toneInstruction, config);
                
                story.rewrite_chain = {
                    id: `rw_${Date.now()}`,
                    draft: { version: 1, text: [...story.body] },
                    rewrite: { version: 2, text: rewriteResult.body, critique: rewriteResult.critique, diff_summary: rewriteResult.diff_summary }
                };
                story.body = rewriteResult.body;
                
                if (config.qualityPass) {
                    this.callbacks.onAgentStart('CRITIC', 'Fact Checking vs Snapshot');
                    const report = await agentFactCheck(story, dossier);
                    story.fact_check_report = report;
                    this.callbacks.onAgentFinish('CRITIC');
                }
                this.callbacks.onAgentFinish('WRITER');
            };

            // Track B: Visuals (Brief -> Layout -> Gen)
            const visualTrack = async () => {
                 this.callbacks.onAgentStart('ARTIST', 'Dreaming up visuals...');
                 const imageBrief = await agentImageBrief(story);
                 story.img_brief = imageBrief;
                 story.img_prompt = imageBrief.technical_prompt;
                 story.layout = await agentLayoutDirectives(story);
                 
                 if (config.generateImages) {
                    try {
                        story.img_base64 = await generateImage(story.img_prompt, '16:9');
                    } catch (e) { 
                        this.log('ARTIST', 'Image Gen Failed', {e});
                        this.callbacks.onAgentFail('ARTIST', 'Image Gen Limit/Error'); 
                    }
                 }
                 this.callbacks.onAgentFinish('ARTIST');
            };

            // Run both tracks
            await Promise.all([textTrack(), visualTrack()]);
            
            context.stories.push(story);

        } else if (verdict.placement === 'DROP' || verdict.placement === 'NOTE') {
            this.callbacks.onAgentStart('WRITER', 'Writing Drop...');
            const drop = await agentDropWriter(dossier, verdict);
            context.drops.push(drop);
            this.callbacks.onAgentFinish('WRITER');
        }

        // Recipes
        if (config.includeAtelier && dossier.scores.practical_craft > 3) {
            this.callbacks.onAgentStart('ENGINEER', 'Reverse-engineering recipe...');
            const recipe = await agentEngineer(dossier);
            context.recipes.push(recipe);
            this.callbacks.onAgentFinish('ENGINEER');
        }

        // Final Layout
        this.callbacks.onAgentStart('EDITOR', 'Final Layout Assembly');
        const issue = await agentLayout(theme, context.signals, context.stories, context.recipes, [], context.drops, context.debates, context.meta);
        this.callbacks.onAgentFinish('EDITOR');

        onUpdate(issue);
        return issue;

      } catch (e: any) {
        this.log('SYS', 'CRITICAL ERROR IN COMMISSION', { message: e.message });
        console.error(e);
        // Reset Agents to Error State
        ['SCOUT', 'CRITIC', 'WRITER', 'EDITOR', 'ARTIST', 'ENGINEER'].forEach(r => this.callbacks.onAgentFail(r as AgentRole, "Process Aborted"));
        return null;
      }
  }

  // --- WORKFLOW 3: AUTOPILOT ---
  public async autoPilot(
    targets: string[], 
    useDemo: boolean, 
    config: RunConfig,
    onUpdate: (partial: IssueContent) => void,
    context: any // State object from hook
  ): Promise<{ issue: IssueContent, publishedCount: number } | null> {
      this.log('SYS', 'AUTOPILOT ENGAGED');
      let publishedCount = 0;
      
      // 1. SCAN
      // Build History for Dedupe
      const history = {
          headlines: new Set([
              ...context.stories.map((s: any) => s.headline),
              ...context.stories.map((s: any) => s.deck),
              ...context.drops.map((d: any) => d.headline)
          ]),
          urls: new Set<string>()
      };
      
      const leads = await this.scan(targets, useDemo, history);
      
      // 2. STRICT CANDIDATE SELECTION (POLICY GATE A)
      const candidates = leads.filter(l => {
          if (l.duplicate) return false; // Filter duplicates immediately
          // Rule 1: High Relevance Score
          if (l.score < 8.0) return false;
          // Rule 2: Zero Risk Classification for auto-mode
          if (l.risk_classification !== 'NONE') return false;
          // Rule 3: Trust Metrics (if available from scanner)
          if (l.editorial_metrics && l.editorial_metrics.trust < 75) return false;
          
          return true;
      }).sort((a,b) => b.score - a.score).slice(0, 2); // Cap at 2 to preserve quota/focus
      
      if (candidates.length === 0) {
          this.log('SYS', 'AUTOPILOT: No candidates passed Policy Gate A (Score/Risk/Trust/Unique).');
          return { issue: await agentLayout(context.theme, context.signals, context.stories, context.recipes, [], context.drops, context.debates, context.meta), publishedCount: 0 };
      }
      
      this.log('SYS', `AUTOPILOT: Processing ${candidates.length} candidates...`);

      for (const lead of candidates) {
          await this.commission(lead, context.theme || "The Synthetic Real", useDemo, config, onUpdate, context);
          
          const story = context.stories[context.stories.length - 1]; 
          const debate = context.debates.find((d: any) => d.id === story?.signal_id);
          
          // 3. PUBLISHING GATES (POLICY GATE B)
          let publishable = false;
          let rejectReason = "Unknown";

          if (!story) {
             rejectReason = "Generation Failed";
          } else {
             const verdict = debate?.verdict;
             const factCheck = story.fact_check_report;
             
             // Gate 1: Editor Verdict
             const verdictPass = verdict?.confidence_gate === 'PUBLISH_READY';
             
             // Gate 2: Fact Check (Critical)
             // If checking was enabled (config.qualityPass), we must respect the result.
             // If checked, it must be approved.
             const factCheckPass = config.qualityPass ? (factCheck?.approved === true) : true;
             
             if (verdictPass && factCheckPass) {
                 publishable = true;
             } else {
                 rejectReason = !verdictPass ? `Verdict: ${verdict?.confidence_gate}` : `Fact Check Failed`;
             }
          }
          
          if (story && publishable) {
             story.status = 'PUBLISHED';
             publishedCount++;
             this.log('OPS', `AUTOPILOT: PUBLISHED "${story.headline}"`);
          } else if (story) {
             story.status = 'REVIEW'; // Keep for human review
             this.log('OPS', `AUTOPILOT: HELD "${story.headline}" (${rejectReason})`);
          }
          
          // Cool-down
          await new Promise(r => setTimeout(r, 2000));
      }

      const finalIssue = await agentLayout(context.theme, context.signals, context.stories, context.recipes, [], context.drops, context.debates, context.meta);
      return { issue: finalIssue, publishedCount };
  }
}