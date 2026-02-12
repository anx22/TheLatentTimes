
import { IssueContent, SignalDossier, StoryArtifact, RecipeArtifact, DropArtifact, ColumnistPersona, DebateArtifact, Lead, RetrievalSnapshot, RetrievalItem, AgentLog, IssueMeta } from "../types";
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
import { RunConfig } from "../hooks/useNewsroom";
import { generateImage, safeGenerateContent, Type } from "./gemini";

type State = 'IDLE' | 'SCANNING' | 'COLLECTING' | 'DEBATING' | 'WRITING' | 'ASSEMBLING' | 'PUBLISHED';

// Plan v3 Section 12.1: WHITELIST (UPDATED FOR NORMPROMPT AESTHETIC)
const TRUSTED_DOMAINS = [
    'arxiv.org', 'github.com', 'huggingface.co', 'civitai.com',
    'techcrunch.com', 'theverge.com', 'vogue.com', 'dazeddigital.com',
    'nytimes.com', 'bloomberg.com', 'wired.com', 'ycombinator.com',
    'simonwillison.net', 'interconnected.org', 'stratechery.com'
];

export class IssueOrchestrator {
  private state: State = 'IDLE';
  private logs: AgentLog[] = [];
  private onLog: (log: AgentLog) => void;
  
  // State
  private leads: Lead[] = [];
  private signals: SignalDossier[] = [];
  private debates: DebateArtifact[] = [];
  private stories: StoryArtifact[] = [];
  private recipes: RecipeArtifact[] = [];
  private drops: DropArtifact[] = [];
  private dropItems: Array<{ category: string; title: string; desc: string }> = [];
  
  // Persistence State
  private currentMeta?: IssueMeta;
  private currentTheme: string = "The Synthetic Real";

  constructor(logCallback: (log: AgentLog) => void) {
    this.onLog = logCallback;
  }

  private log(agent: AgentLog['agent'], message: string, data?: any) {
    const entry: AgentLog = {
      id: Math.random().toString(36),
      timestamp: new Date().toLocaleTimeString(),
      phase: this.state,
      agent,
      message,
      data
    };
    this.logs.push(entry);
    this.onLog(entry);
  }

  // Helper to create a temporary issue snapshot for UI streaming
  private async assembleSnapshot(): Promise<IssueContent> {
      return agentLayout(
          this.currentTheme,
          this.signals,
          this.stories,
          this.recipes,
          this.dropItems,
          this.drops,
          this.debates,
          this.currentMeta // Pass existing meta to preserve ID
      );
  }

  // --- MOCK SEARCH (SYSTEM TEST DATA) ---
  private getMockSearchResults(query: string): RetrievalSnapshot {
    return {
        id: `snap_${Date.now()}`,
        query,
        timestamp: new Date().toISOString(),
        items: [
            { title: "System Test: Signal A", url: "https://test.local/a", snippet: "This is a test signal for system validation.", source_domain: "test.local" },
            { title: "System Test: Signal B", url: "https://test.local/b", snippet: "Another test signal to verify pipeline integrity.", source_domain: "test.local" }
        ]
    };
  }

  // --- EXECUTOR: SEARCH (RETRIEVAL LAYER) ---
  // Plan v3 Section 4.2 & 12.2: Extract & Snapshot
  // IMPLEMENTATION: Robust Search-to-JSON
  private async executeSearch(query: string, useDemo: boolean): Promise<RetrievalSnapshot> {
    if (useDemo) return this.getMockSearchResults(query);

    try {
      // Powerful single-step: Search using tool, then synthesize into JSON.
      const response = await safeGenerateContent({
        model: 'gemini-3-flash-preview',
        contents: `Search for: "${query}". 
        Then, based on the results, return a JSON object with a list of 'items'.
        Each item must have: 'title', 'url', 'source_domain', and a 'snippet' (approx 30 words).
        Only include real results found.`,
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
      
      const raw = JSON.parse(response.text || "{ \"items\": [] }");
      
      // SANITIZE ITEMS: Ensure fields exist to prevent crashes during sort/map
      let items: RetrievalItem[] = (raw.items || []).map((i: any) => ({
          title: i.title || "Untitled Signal",
          url: i.url || "",
          source_domain: i.source_domain || "unknown", 
          snippet: i.snippet || "No details available."
      }));

      // Sort by Trust (Plan Section 12.4)
      items.sort((a, b) => {
          const aTrust = TRUSTED_DOMAINS.some(d => a.source_domain.includes(d)) ? 1 : 0;
          const bTrust = TRUSTED_DOMAINS.some(d => b.source_domain.includes(d)) ? 1 : 0;
          return bTrust - aTrust;
      });

      return {
          id: `snap_${Date.now()}_${Math.random().toString(36).substr(2,5)}`,
          query,
          timestamp: new Date().toISOString(),
          items: items.slice(0, 8) // Limit to top 8
      };

    } catch (e: any) {
      this.log('SYS', `Search Error for "${query}"`, {error: e.message});
      return { id: 'error', query, timestamp: new Date().toISOString(), items: [] };
    }
  }

  // --- PHASE 1: SCANNING (The Wire) ---
  public async scan(targets: string[], useDemo: boolean): Promise<Lead[]> {
      this.state = 'SCANNING';
      this.leads = []; // Reset leads
      this.log('SYS', 'PHASE 1: SCANNING WIRE (Parallel Execution)');

      try {
        // Define a worker function that handles a single target
        const processTarget = async (target: string): Promise<Lead[]> => {
             // SPECIAL MODE: FEEDS
             if (target === 'FEEDS') {
                this.log('INGEST', `Polling Feed Whitelist...`);
                if (useDemo) {
                     // Simulate feeds in demo mode
                     return await agentScanner("SYSTEM_SEED", { id: 'mock', query: 'mock', timestamp: '', items: [] });
                } else {
                     const feedItems = await agentFeedReader();
                     if (feedItems.length > 0) {
                        const snapshot: RetrievalSnapshot = {
                            id: `feed_snap_${Date.now()}`,
                            query: 'RSS_INGEST',
                            timestamp: new Date().toISOString(),
                            items: feedItems
                        };
                        const feedLeads = await agentScanner("FEED_INGEST", snapshot);
                        this.log('INGEST', `Extracted ${feedLeads.length} leads from feeds.`);
                        return feedLeads;
                     } else {
                        this.log('INGEST', 'No active feed signals found.');
                        return [];
                     }
                }
            }

            // NORMAL MODE: TOPIC SEARCH
            this.log('SCOUT', `Scanning sector: "${target}"...`);
            
            // 1. Retrieve Snapshot
            const snapshot = await this.executeSearch(target, useDemo);
            
            // 2. Scan (Flash Lite)
            if (snapshot.items.length > 0) {
              const resultLeads = await agentScanner(target, snapshot);
              this.log('SCOUT', `Found ${resultLeads.length} leads for ${target}`);
              return resultLeads;
            } else {
              this.log('SCOUT', `No signals found for ${target}`);
              return [];
            }
        };

        // Execution: Run all targets concurrently using Promise.all
        // This is crucial for speed. We map each target to a promise.
        const promises = targets.map(async (target) => {
            try {
                return await processTarget(target);
            } catch (e: any) {
                this.log('SYS', `Error processing target "${target}"`, { message: e.message });
                return []; // Return empty array on failure so other targets proceed
            }
        });

        // Wait for all agents to report back
        const results = await Promise.all(promises);
        
        // Flatten the array of arrays into a single Lead list
        const allLeads = results.flat();
        
        this.leads = allLeads;
        this.log('SYS', `SCAN COMPLETE. ${allLeads.length} total leads found.`);

      } catch(e: any) {
          this.log('SYS', 'CRITICAL ERROR IN SCAN', { message: e.message });
      }
      
      return this.leads;
  }

  // --- PHASE 2: COMMISSION (Deep Dive) ---
  public async commission(
    lead: Lead, 
    theme: string, 
    useDemo: boolean, 
    config: RunConfig, 
    onUpdate: (partial: IssueContent) => void
  ): Promise<IssueContent | null> {
      try {
        this.state = 'COLLECTING';
        this.currentTheme = theme;
        const overrides = config.overrides || {};
        this.log('EDITOR', `COMMISSIONED: "${lead.headline}" (Risk: ${config.riskTolerance}, Voice: ${config.voicePreset})`);
        if (overrides.focusQuery) this.log('EDITOR', `OVERRIDE: Focus Query "${overrides.focusQuery}"`);

        // Initialize Issue Identity if not exists
        if (!this.currentMeta) {
             const tempIssue = await this.assembleSnapshot(); // Generate initial ID
             this.currentMeta = tempIssue.meta;
        }

        // 1. Dossier Compilation (Deep Dive on specific lead)
        this.log('SCOUT', `Deep Research active... (Window: ${config.timeWindow})`);
        
        // Use override query if present, otherwise default to headline
        const searchQuery = overrides.focusQuery || lead.headline;
        const snapshot = await this.executeSearch(searchQuery, useDemo);
        const dossier = await agentDossierCompiler(lead.headline, snapshot); // Pass structured snapshot
        this.signals.push(dossier);

        // 2. Pitch & Verdict
        this.state = 'DEBATING';
        const pitches = await agentPitching(dossier, theme);
        const verdict = await agentVerdict(dossier, pitches, config); // Updated signature
        
        this.debates.push({
          id: dossier.id,
          topic: dossier.topic,
          dossier: dossier, // FORENSIC LINK
          scores: dossier.scores,
          pitches: pitches,
          verdict: verdict
        });

        // STREAM UPDATE: Show Debate Result immediately
        const debateSnapshot = await this.assembleSnapshot();
        onUpdate(debateSnapshot);

        // 3. Routing
        this.state = 'WRITING';
        
        if (['COVER', 'FEATURE', 'COLUMN'].includes(verdict.placement)) {
            // Full Article Pipeline
            const headlines = await agentHeadlineForge(dossier, verdict);
            const { selected, log: headlineLog } = await agentHeadlineSelector(headlines, verdict);
            const outline = await agentOutline(dossier, verdict);
            
            let story: StoryArtifact;
            if (verdict.placement === 'COLUMN') {
                const personas: ColumnistPersona[] = ['THE_CRITIC', 'THE_OPTIMIST', 'THE_GHOST'];
                const assignedPersona = personas[Math.floor(Math.random() * personas.length)];
                story = await agentColumnist(dossier, verdict, selected, outline, assignedPersona);
            } else {
                story = await agentDraft(dossier, verdict, selected, outline, config);
            }

            // ATTACH AUDIT LOGS
            story.headline_log = headlineLog;
            story.headline_candidates = headlines;

            // 4. REWRITE CHAIN (Plan v3 Phase 4)
            this.log('EDITOR', `Initiating Rewrite Chain (Tone: ${verdict.tone_directives})...`);
            
            // Capture Draft
            const draftVersion = { version: 1, text: [...story.body] };

            // Rewrite pass 1: Enforce Specific Tone from Verdict
            // Inject Audience Level into the rewrite pass
            const toneInstruction = `${verdict.tone_directives}. Target Audience: ${overrides.audienceLevel || 'Expert'}.`;
            const rewriteResult = await agentRewrite(story.body, toneInstruction, config);
            
            // Store the chain
            story.rewrite_chain = {
                id: `rw_${Date.now()}`,
                draft: draftVersion,
                rewrite: { 
                    version: 2, 
                    text: rewriteResult.body, 
                    critique: rewriteResult.critique, 
                    diff_summary: rewriteResult.diff_summary 
                }
            };
            
            // Apply the rewrite to the main artifact
            story.body = rewriteResult.body;
            
            // 5. FACT CHECK GATE (Plan v3 Section 8)
            if (config.qualityPass) {
                this.log('SCOUT', 'Verifying facts against dossier snapshot...');
                const report = await agentFactCheck(story, dossier);
                story.fact_check_report = report;
                if (!report.approved) {
                    this.log('SCOUT', 'Fact Check Warning', { issues: report.issues });
                    story.status = 'REVIEW'; 
                }
            }

            // Visuals
            const imageBrief = await agentImageBrief(story);
            story.img_brief = imageBrief;
            story.img_prompt = imageBrief.technical_prompt;
            story.layout = await agentLayoutDirectives(story);

            if (config.generateImages) {
                this.log('ATELIER', `Generating Asset...`);
                try {
                    story.img_base64 = await generateImage(story.img_prompt, '16:9');
                } catch (e) { this.log('ATELIER', 'Image Gen Failed', {e}); }
            }
            
            this.stories.push(story);

        } else if (verdict.placement === 'DROP' || verdict.placement === 'NOTE') {
            // Drop Pipeline
            const drop = await agentDropWriter(dossier, verdict);
            this.drops.push(drop);
        }

        // 6. Recipes (Optional)
        if (config.includeAtelier && dossier.scores.practical_craft > 3) {
            const recipe = await agentEngineer(dossier);
            this.recipes.push(recipe);
        }

        // 7. Final Assembly
        this.state = 'ASSEMBLING';
        const issue = await this.assembleSnapshot();
        
        // Update Local Meta State
        this.currentMeta = issue.meta;

        onUpdate(issue);
        return issue;
      } catch (e: any) {
        this.log('SYS', 'CRITICAL ERROR IN COMMISSION', { message: e.message, stack: e.stack });
        console.error("Commission Error:", e);
        return null;
      }
  }

  // --- PHASE 3: AUTO-PILOT (The Agentic Loop) ---
  // Plan v3 Section 2.2: Autopublish Mode
  public async autoPilot(
    targets: string[], 
    useDemo: boolean, 
    config: RunConfig,
    onUpdate: (partial: IssueContent) => void
  ): Promise<{ issue: IssueContent, publishedCount: number } | null> {
      this.log('SYS', 'ENGAGING AUTOPILOT. Threshold: SCORE > 8.5');
      let publishedCount = 0;
      
      // 1. Scan
      const leads = await this.scan(targets, useDemo);
      
      // 2. Filter High-Value Candidates
      const candidates = leads.filter(l => l.score >= 8.5 && l.risk_classification === 'NONE');
      
      if (candidates.length === 0) {
          this.log('SYS', 'AUTOPILOT: No leads met threshold. Aborting commission.');
          return { issue: await this.assembleSnapshot(), publishedCount: 0 };
      }

      this.log('SYS', `AUTOPILOT: Locked ${candidates.length} candidates. Executing sequential commission.`);

      // 3. Sequential Commission (to avoid rate limits)
      for (const lead of candidates) {
          this.log('SYS', `AUTOPILOT: Processing ${lead.headline}...`);
          await this.commission(lead, this.currentTheme, useDemo, config, onUpdate);
          
          // 4. AUTO-PUBLISH LOGIC (Plan v3 Section 2.2)
          // Find the last debate generated for this lead
          const debate = this.debates[this.debates.length - 1];
          const story = this.stories[this.stories.length - 1]; // Heuristic: Last added story
          
          // Gate Check: If the editor said "PUBLISH_READY", we ship it.
          if (story && debate?.verdict?.confidence_gate === 'PUBLISH_READY') {
             this.log('OPS', `AUTOPILOT: Confidence Gate Passed (${debate.verdict.confidence_gate}). Publishing...`);
             await this.publishArtifact(story);
             publishedCount++;
          } else {
             this.log('OPS', `AUTOPILOT: Held for Review. Verdict: ${debate?.verdict?.confidence_gate || 'UNKNOWN'}`);
          }
          
          // Small cool-down between deep dives
          await new Promise(r => setTimeout(r, 2000));
      }

      this.log('SYS', 'AUTOPILOT: Sequence Complete.');
      return { issue: await this.assembleSnapshot(), publishedCount };
  }

  // --- PHASE 4: PUBLISHING (The Seal) ---
  
  // Publish a SINGLE artifact (Story/Drop) to the live state
  // This allows "Continuous Publishing" instead of batch shipping
  public async publishArtifact(artifact: StoryArtifact | DropArtifact): Promise<IssueContent> {
      this.log('OPS', `PUBLISHING ARTIFACT: ${artifact.headline}`);
      
      // Mark as Published
      artifact.status = 'PUBLISHED';
      
      // Update global issue status to 'PUBLISHED' implicitly if it wasn't already
      if (this.currentMeta) {
          this.currentMeta.status = 'PUBLISHED';
      }
      
      // We don't need to "move" it, because it is already in this.stories/this.drops.
      // We just ensure the status is updated and the snapshot reflects it.
      
      return this.assembleSnapshot();
  }

  public async shipIssue(): Promise<IssueContent> {
      this.log('OPS', 'FINALIZING VOLUME. Sealing artifacts...');
      
      // 1. Final Assembly with status 'PUBLISHED'
      this.state = 'PUBLISHED';
      const issue = await this.assembleSnapshot();
      issue.meta.status = 'PUBLISHED';
      
      // 2. Clear internal state for next run
      this.currentMeta = undefined;
      this.leads = [];
      this.signals = [];
      this.debates = [];
      this.stories = [];
      this.recipes = [];
      this.drops = [];
      this.state = 'IDLE';

      return issue;
  }
}
