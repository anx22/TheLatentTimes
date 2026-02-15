
import { IssueContent, SignalDossier, StoryArtifact, RecipeArtifact, DropArtifact, DebateArtifact, Lead, RetrievalSnapshot, RetrievalItem, AgentLog, IssueMeta, AgentRole, Proposal, StoryVariant, Verdict, ColumnistPersona } from "../types";
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
  agentFeedReader,
  agentDriftWatcher // Imported
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

// UTILITY: Performance Timer
class Timer {
    start = performance.now();
    constructor() {}
    stop() { return Math.round(performance.now() - this.start); }
}

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
      this.callbacks.onAgentStart('SCOUT', `Retrieving grounding data for "${query}"...`);
      const t = new Timer();
      
      // OPTIMIZATION: Removed JSON Schema enforcement for Search. 
      // We rely on structured text output which is 10x faster and less prone to looping with Tools.
      const response = await safeGenerateContent({
        model: 'gemini-3-flash-preview',
        contents: `Search for: "${query}". 
        
        List the top 6 most relevant results.
        For each result, output it in this EXACT format:

        [[ITEM]]
        TITLE: <title>
        URL: <url>
        SOURCE: <domain>
        SNIPPET: <summary of the content>
        [[END]]

        Do not add other text.
        `,
        config: { 
            tools: [{ googleSearch: {} }]
        }
      });
      
      const text = response.text || "";
      const items: RetrievalItem[] = [];
      
      // Robust Regex Parsing for the [[ITEM]] block format
      const blocks = text.split('[[ITEM]]').slice(1);
      
      blocks.forEach(block => {
          const titleMatch = block.match(/TITLE:\s*(.*)/i);
          const urlMatch = block.match(/URL:\s*(.*)/i);
          const sourceMatch = block.match(/SOURCE:\s*(.*)/i);
          const snippetMatch = block.match(/SNIPPET:\s*([\s\S]*?)\[\[END\]\]/i);

          if (titleMatch && urlMatch) {
              const item: RetrievalItem = {
                  title: titleMatch[1].trim(),
                  url: urlMatch[1].trim(),
                  source_domain: sourceMatch ? sourceMatch[1].trim() : "unknown",
                  snippet: snippetMatch ? snippetMatch[1].trim() : "No details."
              };
              items.push(item);
          }
      });

      // Sort by trust
      items.sort((a, b) => {
          const aTrust = TRUSTED_DOMAINS.some(d => a.source_domain.includes(d)) ? 1 : 0;
          const bTrust = TRUSTED_DOMAINS.some(d => b.source_domain.includes(d)) ? 1 : 0;
          return bTrust - aTrust;
      });

      // Fallback: If text parsing failed but we have grounding metadata, use that.
      if (items.length === 0 && response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
          const chunks = response.candidates[0].groundingMetadata.groundingChunks;
          chunks.forEach((c: any) => {
              if (c.web) {
                  items.push({
                      title: c.web.title || "Web Result",
                      url: c.web.uri || "",
                      source_domain: new URL(c.web.uri).hostname || "web",
                      snippet: "Metadata extraction."
                  });
              }
          });
      }

      this.log('SCOUT', `Search complete (${t.stop()}ms). Found ${items.length} items.`);
      this.callbacks.onAgentFinish('SCOUT');
      
      return { id: `snap_${Date.now()}`, query, timestamp: new Date().toISOString(), items: items.slice(0, 8) };

    } catch (e: any) {
      this.log('SYS', `Search Error`, {error: e.message});
      this.callbacks.onAgentFail('SCOUT', e.message);
      // Return empty snapshot on error to allow pipeline to continue (graceful degradation)
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
      const cycleTimer = new Timer();
      this.callbacks.onAgentStart('SCOUT', `Scanning ${targets.length} targets...`);
      
      try {
        const promises = targets.map(async (target) => {
             const t = new Timer();
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
            
            let result: Lead[] = [];
            if (snapshot.items.length > 0) {
              result = await agentScanner(target, snapshot);
            }
            this.log('SCOUT', `Target "${target}" processed in ${t.stop()}ms. Found ${result.length} leads.`);
            return result;
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

        this.log('SYS', `Scan Cycle Complete (${cycleTimer.stop()}ms). Total Leads: ${flatLeads.length}`);
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
        const commissionTimer = new Timer();

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
        const researchTimer = new Timer();
        
        // NEW: QUERY ORCHESTRATION WITH SOURCE MIX
        let queries = [lead.headline];
        if (config.sourceMix) {
           queries = await agentQueryOrchestrator(lead.headline, config.sourceMix);
           this.log('SCOUT', `Orchestrated Queries: ${queries.join(', ')}`);
        }
        
        // Use first query for main search (simplification for now, can be parallelized)
        const searchQuery = overrides.focusQuery || queries[0];
        const snapshot = await this.executeSearch(searchQuery, useDemo);
        const dossier = await agentDossierCompiler(lead.headline, snapshot);
        context.signals.push(dossier);
        this.log('SCOUT', `Dossier compiled in ${researchTimer.stop()}ms`);
        this.callbacks.onAgentFinish('SCOUT');

        // 2. DEBATE
        this.callbacks.onAgentStart('CRITIC', 'Analyzing Voltage & Risk');
        const debateTimer = new Timer();
        
        const pitches = await agentPitching(dossier, theme);
        
        this.callbacks.onAgentStart('EDITOR', 'Deliberating Verdict');
        const verdict = await agentVerdict(dossier, pitches, config);
        
        this.log('EDITOR', `Verdict reached in ${debateTimer.stop()}ms: ${verdict.confidence_gate}`);
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
        // We do this fast so UI updates before the heavy writing starts
        let currentIssue = await agentLayout(theme, context.signals, context.stories, context.recipes, [], context.drops, context.debates, context.meta);
        onUpdate(currentIssue);

        // 4. PRODUCTION
        if (['COVER', 'FEATURE', 'COLUMN'].includes(verdict.placement)) {
            const productionTimer = new Timer();
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
                const textTimer = new Timer();
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
                this.log('WRITER', `Text Track complete in ${textTimer.stop()}ms`);
                this.callbacks.onAgentFinish('WRITER');
            };

            // Track B: Visuals (Brief -> Layout -> Gen)
            const visualTrack = async () => {
                 const visTimer = new Timer();
                 this.callbacks.onAgentStart('ARTIST', 'Dreaming up visuals...');
                 const imageBrief = await agentImageBrief(story);
                 story.img_brief = imageBrief;
                 story.img_prompt = imageBrief.technical_prompt;
                 story.layout = await agentLayoutDirectives(story);
                 
                 if (config.generateImages) {
                    try {
                        this.log('ARTIST', 'Generating Image (High-Res)...');
                        story.img_base64 = await generateImage(story.img_prompt, '16:9');
                    } catch (e) { 
                        this.log('ARTIST', 'Image Gen Failed', {e});
                        this.callbacks.onAgentFail('ARTIST', 'Image Gen Limit/Error'); 
                    }
                 }
                 this.log('ARTIST', `Visual Track complete in ${visTimer.stop()}ms`);
                 this.callbacks.onAgentFinish('ARTIST');
            };

            // Run both tracks
            await Promise.all([textTrack(), visualTrack()]);
            this.log('SYS', `Production Phase complete in ${productionTimer.stop()}ms`);
            
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
        this.log('SYS', `Total Commission Time: ${commissionTimer.stop()}ms`);
        return issue;

      } catch (e: any) {
        this.log('SYS', 'CRITICAL ERROR IN COMMISSION', { message: e.message });
        console.error(e);
        // Reset Agents to Error State
        ['SCOUT', 'CRITIC', 'WRITER', 'EDITOR', 'ARTIST', 'ENGINEER'].forEach(r => this.callbacks.onAgentFail(r as AgentRole, "Process Aborted"));
        return null;
      }
  }

  // --- WORKFLOW 3: PROPOSAL EXECUTION (Layer 3) ---
  public async executeProposal(
      artifact: StoryArtifact, 
      proposal: Proposal, 
      config: RunConfig
  ): Promise<StoryArtifact> {
      this.log('SYS', `Executing Proposal: ${proposal.type} [${proposal.label}]`);
      
      const updatedArtifact = { ...artifact };
      
      // Store current state as a Variant before modifying
      const variant: StoryVariant = {
          id: `v_${Date.now()}`,
          timestamp: Date.now(),
          headline: artifact.headline,
          body: artifact.body,
          diff_summary: "Pre-Proposal State"
      };
      
      if (!updatedArtifact.variants) updatedArtifact.variants = [];
      updatedArtifact.variants.push(variant);
      
      // Clear proposal
      updatedArtifact.pending_proposals = (updatedArtifact.pending_proposals || []).filter(p => p.id !== proposal.id);

      try {
          switch (proposal.type) {
              case 'REWRITE': {
                  this.callbacks.onAgentStart('WRITER', `Rewriting: ${proposal.label}`);
                  const tone = `Target: ${proposal.label}. Impact: ${proposal.impact}.`;
                  const result = await agentRewrite(artifact.body, tone, config);
                  
                  updatedArtifact.body = result.body;
                  updatedArtifact.rewrite_chain = {
                      id: `rw_${Date.now()}`,
                      draft: { version: 1, text: variant.body },
                      rewrite: { version: 2, text: result.body, critique: result.critique, diff_summary: result.diff_summary }
                  };
                  this.callbacks.onAgentFinish('WRITER');
                  break;
              }
              
              case 'HEADLINE_GEN': {
                  this.callbacks.onAgentStart('EDITOR', 'Generating Fresh Headlines');
                  // We need a dossier to generate headlines. Reconstruct a mock one if needed or pass context.
                  // For now, assume sufficient context in artifact.
                  const mockDossier: any = { topic: artifact.category || "General", id: artifact.signal_id };
                  const mockVerdict: any = { placement: artifact.placement, tone_directives: "High Voltage" };
                  
                  const headlines = await agentHeadlineForge(mockDossier, mockVerdict);
                  updatedArtifact.headline_candidates = headlines;
                  this.callbacks.onAgentFinish('EDITOR');
                  break;
              }

              case 'FACT_CHECK': {
                  this.callbacks.onAgentStart('CRITIC', 'Deep Audit');
                  // In a real implementation, we would need the dossier. 
                  // Here we simulate a re-check against the artifact's own citations.
                  const report = await agentFactCheck(updatedArtifact, { 
                      id: 'audit', 
                      claims: updatedArtifact.citations.map((c,i) => ({ id: `c${i}`, text: c.source, status: 'VERIFIED', confidence: c.confidence, supporting_sources: [] })),
                      scores: {} as any,
                      topic: artifact.category,
                      retrieval_snapshot: { id: 'audit', query: '', timestamp: '', items: [] }
                  } as SignalDossier);
                  
                  updatedArtifact.fact_check_report = report;
                  this.callbacks.onAgentFinish('CRITIC');
                  break;
              }
              
              case 'IMAGE_GEN': {
                  this.callbacks.onAgentStart('ARTIST', 'Visual Fabrication');
                  const prompt = artifact.img_prompt || `Editorial photography of ${artifact.headline}`;
                  updatedArtifact.img_base64 = await generateImage(prompt, '16:9');
                  this.callbacks.onAgentFinish('ARTIST');
                  break;
              }
          }
          
          this.log('SYS', `Proposal Applied. Artifact updated.`);
          return updatedArtifact;

      } catch (e: any) {
          this.log('SYS', `Proposal Execution Failed: ${e.message}`);
          this.callbacks.onAgentFail(proposal.agent, e.message);
          return artifact; // Return original on fail
      }
  }
  
  // --- WORKFLOW 3.5: DRIFT WATCHER ---
  public async runDriftCheck(story: StoryArtifact, dossier: SignalDossier, verdict: Verdict): Promise<StoryArtifact> {
      this.callbacks.onAgentStart('CRITIC', 'Auditing Drift...');
      const result = await agentDriftWatcher(story, dossier, verdict);
      
      const updatedStory = { ...story };
      updatedStory.drift_metric = {
          score: result.drift_score,
          contradictions: result.contradictions,
          last_check: new Date().toISOString()
      };
      
      // Append proposals
      if (!updatedStory.pending_proposals) updatedStory.pending_proposals = [];
      updatedStory.pending_proposals = [...updatedStory.pending_proposals, ...result.proposals];
      
      this.callbacks.onAgentFinish('CRITIC');
      return updatedStory;
  }

  // --- WORKFLOW 4: AUTOPILOT ---
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
