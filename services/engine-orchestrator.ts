
import { IssueContent, SignalDossier, StoryArtifact, RecipeArtifact, DropArtifact, DebateArtifact, Lead, RetrievalSnapshot, RetrievalItem, AgentLog, IssueMeta, AgentRole, Proposal, StoryVariant, Verdict, ColumnistPersona } from "../types";
import { 
  agentQueryOrchestrator, agentDossierCompiler, 
  agentDraft, agentRewrite, 
  agentEngineer,
  agentLayout,
  agentDropWriter,
  agentImageBrief,
  agentScanner,
  agentFeedReader,
  agentDriftWatcher,
  agentHeadlineForge,
  agentFactCheck,
  // REACTIVATED AGENTS
  agentPitching,
  agentVerdict
} from "./engine-agents";
import type { RunConfig } from "../hooks/useNewsroom";
import { generateImage, safeGenerateContent } from "./gemini";

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
    onAgentFail: (role: AgentRole, error: string) => void;
};

class Timer {
    start = performance.now();
    constructor() {}
    stop() { return Math.round(performance.now() - this.start); }
}

export class IssueOrchestrator {
  private callbacks: OrchestratorCallbacks;
  
  constructor(callbacks: OrchestratorCallbacks) {
    this.callbacks = callbacks;
  }

  private log(agent: string, message: string, data?: any) {
    this.callbacks.onLog({
      id: Math.random().toString(36),
      timestamp: new Date().toISOString(),
      phase: 'EXEC',
      agent,
      message,
      data
    });
  }

  private normalizeString(str: string): string {
      return str.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  }

  private isDuplicate(text: string, existing: Set<string>): boolean {
      const normalized = this.normalizeString(text);
      for (const item of existing) {
          const normItem = this.normalizeString(item);
          if (normItem === normalized) return true;
          if (normalized.length > 20 && normItem.includes(normalized)) return true;
          if (normItem.length > 20 && normalized.includes(normItem)) return true;
      }
      return false;
  }

  // --- HELPER: SEARCH (RETRIEVAL LAYER) ---
  private async executeSearch(query: string, useDemo: boolean): Promise<RetrievalSnapshot> {
    if (useDemo) return this.getMockSearchResults(query);

    try {
      this.callbacks.onAgentStart('SCOUT', `Searching for: "${query}"...`);
      this.log('SCOUT', `Executing search query: "${query}"`);
      const t = new Timer();
      
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

      items.sort((a, b) => {
          const aTrust = TRUSTED_DOMAINS.some(d => a.source_domain.includes(d)) ? 1 : 0;
          const bTrust = TRUSTED_DOMAINS.some(d => b.source_domain.includes(d)) ? 1 : 0;
          return bTrust - aTrust;
      });

      this.log('SCOUT', `Search complete (${t.stop()}ms). Parsed ${items.length} results.`, { items: items.map(i => i.title) });
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

  public async scan(
      targets: string[], 
      useDemo: boolean, 
      history?: { headlines: Set<string> }
  ): Promise<Lead[]> {
      const cycleTimer = new Timer();
      this.callbacks.onAgentStart('SCOUT', `Scanning ${targets.length} targets...`);
      this.log('SCOUT', `Initiating Wide Scan on targets: ${targets.join(', ')}`);
      
      try {
        const promises = targets.map(async (target) => {
             const t = new Timer();
             if (target === 'FEEDS') {
                this.callbacks.onAgentUpdate('SCOUT', 'Polling RSS Feed Whitelist...', 20);
                this.log('SCOUT', 'Polling RSS Registry...');
                if (useDemo) return await agentScanner("SYSTEM_SEED", { id: 'mock', query: 'mock', timestamp: '', items: [] });
                const feedItems = await agentFeedReader();
                if (feedItems.length === 0) {
                    this.log('SCOUT', 'RSS Poll Empty');
                    return [];
                }
                this.log('SCOUT', `RSS Poll: Retrieved ${feedItems.length} raw items.`);
                const feedLeads = await agentScanner("FEED_INGEST", { id: `feed_${Date.now()}`, query: 'RSS', timestamp: '', items: feedItems });
                return feedLeads;
            }

            this.callbacks.onAgentUpdate('SCOUT', `Sector scan: ${target}`, 50);
            const snapshot = await this.executeSearch(target, useDemo);
            
            let result: Lead[] = [];
            if (snapshot.items.length > 0) {
              this.log('SCOUT', `Scanning snapshot results for Leads...`);
              result = await agentScanner(target, snapshot);
            } else {
                this.log('SCOUT', `No results for ${target}, skipping analysis.`);
            }
            this.log('SCOUT', `Target "${target}" processed in ${t.stop()}ms. Found ${result.length} leads.`);
            return result;
        });

        const results = await Promise.all(promises);
        const flatLeads = results.flat();

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

  // --- REFACTORED: FULL PIPELINE COMMISSION ---
  public async commission(
    lead: Lead, 
    theme: string, 
    useDemo: boolean, 
    config: RunConfig, 
    onUpdate: (partial: IssueContent) => void,
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
        this.log('SYS', `>>> COMMISSIONING: "${lead.headline}"`);
        this.log('SYS', `Config: Depth=${config.deepResearch ? 'Deep' : 'Standard'}, Tone=${config.voicePreset}`);

        // 1. SEARCH (SCOUT)
        this.callbacks.onAgentStart('SCOUT', 'Deep Research Phase...');
        const snapshot = await this.executeSearch(lead.headline, useDemo);
        
        this.log('SCOUT', 'Compiling Signal Dossier...');
        const dossier = await agentDossierCompiler(lead.headline, snapshot);
        context.signals.push(dossier);
        this.log('SCOUT', `Dossier Compiled. ID: ${dossier.id}`);
        this.callbacks.onAgentFinish('SCOUT');

        // 2. PITCHING (CRITIC & RUNWAY) - PIPELINE RESTORED
        this.callbacks.onAgentStart('CRITIC', 'Generating strategic angles...');
        const pitches = await agentPitching(dossier, theme);
        this.log('CRITIC', `Generated ${pitches.length} strategic angles.`);
        this.callbacks.onAgentFinish('CRITIC');

        // 3. DEBATE & VERDICT (EDITOR) - PIPELINE RESTORED
        this.callbacks.onAgentStart('EDITOR', 'Convening Editorial Board...');
        this.log('EDITOR', 'Debating placement and tone...');
        const verdict = await agentVerdict(dossier, pitches, config);
        
        const debate: DebateArtifact = {
            id: dossier.id,
            topic: dossier.topic,
            dossier: dossier,
            scores: dossier.scores,
            pitches: pitches,
            verdict: verdict
        };
        context.debates.push(debate);
        this.log('EDITOR', `Verdict: ${verdict.placement} // ${verdict.assigned_topic}`);
        this.callbacks.onAgentFinish('EDITOR');

        // 4. DRAFT (WRITER)
        this.callbacks.onAgentStart('WRITER', 'Drafting Story...');
        this.log('WRITER', 'Generating Narrative Outline...');
        
        const outline = {
            lead: dossier.one_liner || lead.context,
            beats: dossier.claims.map(c => c.text).slice(0, 3),
            turn: "However, the implications are complex.",
            close: "We are watching closely."
        };
        this.log('WRITER', `Outline Locked. Lead: "${outline.lead.substring(0, 40)}..."`);

        this.log('WRITER', 'Generating Full Draft (Gemini 3 Pro)...');
        const draft = await agentDraft(dossier, verdict, lead.headline, outline, config);
        
        // SAFETY CHECK
        if (!draft.body || !Array.isArray(draft.body)) {
             draft.body = [];
             this.log('WRITER', 'WARN: Draft body was empty or malformed. Proceeding with empty body.');
        }

        this.log('WRITER', `Draft generated. Length: ${draft.body.join(' ').length} chars.`);
        
        // 5. REWRITE (WRITER) - TONE PASS
        this.callbacks.onAgentUpdate('WRITER', 'Rewriting for Tone...', 50);
        this.log('WRITER', `Applying Tone Pass: "${verdict.tone_directives}"`);
        const rewrite = await agentRewrite(draft.body, verdict.tone_directives, config);
        
        // Apply Rewrite
        draft.body = rewrite.body;
        draft.rewrite_chain = {
            id: `rw_${Date.now()}`,
            draft: { version: 1, text: draft.body },
            rewrite: { version: 2, text: rewrite.body, critique: rewrite.critique, diff_summary: rewrite.diff_summary }
        };
        this.log('WRITER', `Rewrite Complete. Diff: ${rewrite.diff_summary}`);
        this.callbacks.onAgentFinish('WRITER');

        // 6. VISUALS (ARTIST) - OPTIONAL
        if (config.generateImages) {
             this.callbacks.onAgentStart('ARTIST', 'Rendering Visuals...');
             try {
                this.log('ARTIST', 'Generating Image Brief...');
                const imageBrief = await agentImageBrief(draft);
                draft.img_brief = imageBrief;
                draft.img_prompt = imageBrief.technical_prompt;
                
                this.log('ARTIST', `Rendering Image: "${draft.img_prompt.substring(0,30)}..."`);
                draft.img_base64 = await generateImage(draft.img_prompt, '16:9');
                this.log('ARTIST', `Image Rendered Successfully.`);
             } catch (e) {
                this.log('ARTIST', `Image Gen Skipped/Failed: ${e}`);
             }
             this.callbacks.onAgentFinish('ARTIST');
        } else {
            this.log('ARTIST', 'Image Generation Skipped (Config Off).');
        }

        // 7. FINALIZE & UPDATE
        draft.status = 'REVIEW';
        context.stories.push(draft);

        this.callbacks.onAgentStart('EDITOR', 'Final Layout Assembly');
        this.log('EDITOR', 'Re-calculating Layout Grid...');
        const issue = await agentLayout(theme, context.signals, context.stories, context.recipes, [], context.drops, context.debates, context.meta);
        this.callbacks.onAgentFinish('EDITOR');

        // SINGLE UI UPDATE AT THE END
        this.log('SYS', `Commission Phase Complete. Updating UI.`);
        onUpdate(issue);
        this.log('SYS', `<<< Total Commission Time: ${commissionTimer.stop()}ms`);
        return issue;

      } catch (e: any) {
        this.log('SYS', 'CRITICAL ERROR IN COMMISSION', { message: e.message });
        console.error(e);
        ['SCOUT', 'WRITER', 'ARTIST', 'EDITOR'].forEach(r => this.callbacks.onAgentFail(r as AgentRole, "Process Aborted"));
        return null;
      }
  }

  // --- WORKFLOW 3: PROPOSAL EXECUTION ---
  public async executeProposal(
      artifact: StoryArtifact, 
      proposal: Proposal, 
      config: RunConfig
  ): Promise<StoryArtifact> {
      this.log('SYS', `Executing Proposal: ${proposal.type} [${proposal.label}]`);
      
      const updatedArtifact = { ...artifact };
      
      const variant: StoryVariant = {
          id: `v_${Date.now()}`,
          timestamp: Date.now(),
          headline: artifact.headline,
          body: artifact.body,
          diff_summary: "Pre-Proposal State"
      };
      
      if (!updatedArtifact.variants) updatedArtifact.variants = [];
      updatedArtifact.variants.push(variant);
      
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
                  this.log('WRITER', 'Proposal Applied', { diff: result.diff_summary });
                  this.callbacks.onAgentFinish('WRITER');
                  break;
              }
              
              case 'HEADLINE_GEN': {
                  this.callbacks.onAgentStart('EDITOR', 'Generating Fresh Headlines');
                  const mockDossier: any = { topic: artifact.category || "General", id: artifact.signal_id };
                  const mockVerdict: any = { placement: artifact.placement, tone_directives: "High Voltage" };
                  
                  const headlines = await agentHeadlineForge(mockDossier, mockVerdict);
                  updatedArtifact.headline_candidates = headlines;
                  this.log('EDITOR', 'Headlines Refreshed', { headlines });
                  this.callbacks.onAgentFinish('EDITOR');
                  break;
              }

              case 'FACT_CHECK': {
                  this.callbacks.onAgentStart('CRITIC', 'Deep Audit');
                  const report = await agentFactCheck(updatedArtifact, { 
                      id: 'audit', 
                      claims: updatedArtifact.citations.map((c,i) => ({ id: `c${i}`, text: c.source, status: 'VERIFIED', confidence: c.confidence, supporting_sources: [] })),
                      scores: { novelty: 5, cultural_voltage: 5, practical_craft: 0, proof_strength: 5, heat: 5, longevity: 5 },
                      topic: artifact.category,
                      retrieval_snapshot: { id: 'audit', query: '', timestamp: '', items: [] }
                  } as SignalDossier);
                  
                  updatedArtifact.fact_check_report = report;
                  this.log('CRITIC', 'Audit Complete', { report });
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
          return artifact;
      }
  }
  
  public async runDriftCheck(story: StoryArtifact, dossier: SignalDossier, verdict: Verdict): Promise<StoryArtifact> {
      this.callbacks.onAgentStart('CRITIC', 'Auditing Drift...');
      const result = await agentDriftWatcher(story, dossier, verdict);
      
      const updatedStory = { ...story };
      updatedStory.drift_metric = {
          score: result.drift_score,
          contradictions: result.contradictions,
          last_check: new Date().toISOString()
      };
      
      if (!updatedStory.pending_proposals) updatedStory.pending_proposals = [];
      updatedStory.pending_proposals = [...updatedStory.pending_proposals, ...result.proposals];
      
      this.log('CRITIC', 'Drift Check Complete', { score: result.drift_score, issues: result.contradictions });
      this.callbacks.onAgentFinish('CRITIC');
      return updatedStory;
  }

  public async autoPilot(
    targets: string[], 
    useDemo: boolean, 
    config: RunConfig,
    onUpdate: (partial: IssueContent) => void,
    context: any
  ): Promise<{ issue: IssueContent, publishedCount: number } | null> {
      this.log('SYS', 'AUTOPILOT ENGAGED. Initializing Loop...');
      let publishedCount = 0;
      
      const history = {
          headlines: new Set([
              ...context.stories.map((s: any) => s.headline),
              ...context.stories.map((s: any) => s.deck),
              ...context.drops.map((d: any) => d.headline)
          ]),
          urls: new Set<string>()
      };
      
      const leads = await this.scan(targets, useDemo, history);
      
      // Strict filtering logic
      const candidates = leads.filter(l => {
          if (l.duplicate) return false;
          if (l.score < 8.0) return false;
          if (l.risk_classification !== 'NONE') return false;
          if (l.editorial_metrics && l.editorial_metrics.trust < 75) return false;
          return true;
      }).sort((a,b) => b.score - a.score).slice(0, 2);
      
      if (candidates.length === 0) {
          this.log('SYS', 'AUTOPILOT: No valid candidates passed Policy Gate. (Score/Risk/Trust). Sleeping.');
          return { issue: await agentLayout(context.theme, context.signals, context.stories, context.recipes, [], context.drops, context.debates, context.meta), publishedCount: 0 };
      }
      
      this.log('SYS', `AUTOPILOT: Processing ${candidates.length} approved candidates...`, { candidates: candidates.map(c => c.headline) });

      for (const lead of candidates) {
          await this.commission(lead, context.theme || "The Synthetic Real", useDemo, config, onUpdate, context);
          const story = context.stories[context.stories.length - 1]; 
          
          if (story) {
             story.status = 'PUBLISHED';
             publishedCount++;
             this.log('OPS', `AUTOPILOT: PUBLISHED "${story.headline}" to live site.`);
          }
          this.log('SYS', 'Cooling down engines (2s safety pause)...');
          await new Promise(r => setTimeout(r, 2000));
      }

      this.log('SYS', 'AUTOPILOT: Cycle Complete. Regenerating Final Layout.');
      const finalIssue = await agentLayout(context.theme, context.signals, context.stories, context.recipes, [], context.drops, context.debates, context.meta);
      return { issue: finalIssue, publishedCount };
  }
}
