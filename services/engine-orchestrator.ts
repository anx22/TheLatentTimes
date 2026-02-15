
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
  agentDriftWatcher
} from "./engine-agents";
import type { RunConfig } from "../hooks/useNewsroom";
import { generateImage, safeGenerateContent, Type, cleanAndParseJSON } from "./gemini";

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
      timestamp: new Date().toLocaleTimeString(),
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
      this.callbacks.onAgentStart('SCOUT', `Retrieving grounding data for "${query}"...`);
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

      this.log('SCOUT', `Search complete (${t.stop()}ms). Found ${items.length} items.`, { items });
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

            this.callbacks.onAgentUpdate('SCOUT', `Sector scan: ${target}`, 50);
            const snapshot = await this.executeSearch(target, useDemo);
            
            let result: Lead[] = [];
            if (snapshot.items.length > 0) {
              result = await agentScanner(target, snapshot);
            }
            this.log('SCOUT', `Target "${target}" processed in ${t.stop()}ms. Found ${result.length} leads.`, { leads: result });
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
        
        let queries = [lead.headline];
        if (config.sourceMix) {
           queries = await agentQueryOrchestrator(lead.headline, config.sourceMix);
           this.log('SCOUT', `Orchestrated Queries: ${queries.join(', ')}`, { queries });
        }
        
        const searchQuery = overrides.focusQuery || queries[0];
        const snapshot = await this.executeSearch(searchQuery, useDemo);
        const dossier = await agentDossierCompiler(lead.headline, snapshot);
        
        context.signals.push(dossier);
        this.log('SCOUT', `Dossier compiled in ${researchTimer.stop()}ms`, { claims: dossier.claims.length, one_liner: dossier.one_liner });
        this.callbacks.onAgentFinish('SCOUT');

        // --- UPDATE 1: CREATE GHOST ARTIFACT ---
        const ghostId = `story_${dossier.id}`;
        const ghostStory: StoryArtifact = {
            id: ghostId,
            signal_id: dossier.id,
            placement: 'HOLD',
            status: 'DRAFT',
            headline: lead.headline,
            deck: "Commissioning in progress...",
            body: [],
            citations: [],
            footnotes: [],
            category: dossier.tags?.topic_cluster || "Development",
            topic: 'CULTURE',
            format: 'ESSAY',
            media_type: 'TEXT',
            img_prompt: '',
            img_caption: '',
            pull_quote: ''
        };
        context.stories.push(ghostStory);
        
        let currentIssue = await agentLayout(theme, context.signals, context.stories, context.recipes, [], context.drops, context.debates, context.meta);
        onUpdate(currentIssue);

        // 2. DEBATE
        this.callbacks.onAgentStart('CRITIC', 'Analyzing Voltage & Risk');
        const debateTimer = new Timer();
        
        const pitches = await agentPitching(dossier, theme);
        this.log('CRITIC', `Pitches Generated`, { count: pitches.length, pitches: pitches.map(p => p.angle) });
        
        this.callbacks.onAgentStart('EDITOR', 'Deliberating Verdict');
        const verdict = await agentVerdict(dossier, pitches, config);
        
        this.log('EDITOR', `Verdict reached in ${debateTimer.stop()}ms`, { placement: verdict.placement, directive: verdict.tone_directives, confidence: verdict.confidence_gate });
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

        // --- UPDATE 2: UPDATE GHOST WITH VERDICT ---
        ghostStory.placement = verdict.placement;
        ghostStory.topic = verdict.assigned_topic;
        ghostStory.format = verdict.assigned_format;
        ghostStory.deck = "Verdict reached. Drafting in progress...";
        
        currentIssue = await agentLayout(theme, context.signals, context.stories, context.recipes, [], context.drops, context.debates, context.meta);
        onUpdate(currentIssue);

        // 4. PRODUCTION
        if (['COVER', 'FEATURE', 'COLUMN'].includes(verdict.placement)) {
            const productionTimer = new Timer();
            this.callbacks.onAgentStart('WRITER', 'Forging Headlines & Outlines');
            
            const [headlines, outline] = await Promise.all([
                agentHeadlineForge(dossier, verdict),
                agentOutline(dossier, verdict)
            ]);

            const { selected, log: headlineLog } = await agentHeadlineSelector(headlines, verdict);
            this.log('WRITER', `Headline Selected: ${selected}`, { candidates: headlines, selected });
            
            // Update Ghost with headlines
            ghostStory.headline = selected;
            ghostStory.headline_candidates = headlines;
            ghostStory.headline_log = headlineLog;
            onUpdate(await agentLayout(theme, context.signals, context.stories, context.recipes, [], context.drops, context.debates, context.meta));

            this.callbacks.onAgentUpdate('WRITER', 'Drafting manuscript...', 30);
            
            let storyData: StoryArtifact;
            if (verdict.placement === 'COLUMN') {
                const personas: ColumnistPersona[] = ['THE_CRITIC', 'THE_OPTIMIST', 'THE_GHOST'];
                const assignedPersona = personas[Math.floor(Math.random() * personas.length)];
                storyData = await agentColumnist(dossier, verdict, selected, outline, assignedPersona);
            } else {
                storyData = await agentDraft(dossier, verdict, selected, outline, config);
            }
            
            this.log('WRITER', `Draft generated`, { length_paragraphs: storyData.body.length, preview: storyData.body[0].slice(0,50) });

            // MERGE DRAFT DATA INTO GHOST ARTIFACT (Keep reference intact)
            Object.assign(ghostStory, storyData);
            ghostStory.status = 'REVIEW'; 
            
            // Update immediately after draft
            onUpdate(await agentLayout(theme, context.signals, context.stories, context.recipes, [], context.drops, context.debates, context.meta));

            // --- OPTIMIZATION: PARALLEL TRACKS (TEXT vs VISUAL) ---
            const textTrack = async () => {
                const textTimer = new Timer();
                this.callbacks.onAgentUpdate('WRITER', 'Rewrite Pass (Tone Injection)...', 60);
                const toneInstruction = `${verdict.tone_directives}. Target Audience: ${overrides.audienceLevel || 'Expert'}.`;
                const rewriteResult = await agentRewrite(ghostStory.body, toneInstruction, config);
                
                ghostStory.rewrite_chain = {
                    id: `rw_${Date.now()}`,
                    draft: { version: 1, text: [...ghostStory.body] },
                    rewrite: { version: 2, text: rewriteResult.body, critique: rewriteResult.critique, diff_summary: rewriteResult.diff_summary }
                };
                ghostStory.body = rewriteResult.body;
                
                this.log('WRITER', `Rewrite Complete`, { critique: rewriteResult.critique, diff: rewriteResult.diff_summary });

                if (config.qualityPass) {
                    this.callbacks.onAgentUpdate('CRITIC', 'Fact Checking...', 80);
                    const report = await agentFactCheck(ghostStory, dossier);
                    ghostStory.fact_check_report = report;
                    this.log('CRITIC', `Fact Check Complete`, { approved: report.approved, issues: report.issues });
                }
                
                this.log('WRITER', `Text Track complete in ${textTimer.stop()}ms`);
                this.callbacks.onAgentFinish('WRITER');
                
                onUpdate(await agentLayout(theme, context.signals, context.stories, context.recipes, [], context.drops, context.debates, context.meta));
            };

            const visualTrack = async () => {
                 const visTimer = new Timer();
                 this.callbacks.onAgentStart('ARTIST', 'Dreaming up visuals...');
                 const imageBrief = await agentImageBrief(ghostStory);
                 ghostStory.img_brief = imageBrief;
                 ghostStory.img_prompt = imageBrief.technical_prompt;
                 ghostStory.layout = await agentLayoutDirectives(ghostStory);
                 this.log('ARTIST', `Visual Brief Created`, { brief: imageBrief });
                 
                 if (config.generateImages) {
                    try {
                        this.callbacks.onAgentUpdate('ARTIST', 'Rendering Image...', 50);
                        ghostStory.img_base64 = await generateImage(ghostStory.img_prompt, '16:9');
                        this.log('ARTIST', `Image Rendered`, { prompt: ghostStory.img_prompt });
                    } catch (e) { 
                        this.log('ARTIST', 'Image Gen Failed', {e});
                        this.callbacks.onAgentFail('ARTIST', 'Image Gen Limit/Error'); 
                    }
                 }
                 this.log('ARTIST', `Visual Track complete in ${visTimer.stop()}ms`);
                 this.callbacks.onAgentFinish('ARTIST');
                 
                 onUpdate(await agentLayout(theme, context.signals, context.stories, context.recipes, [], context.drops, context.debates, context.meta));
            };

            await Promise.all([textTrack(), visualTrack()]);
            this.log('SYS', `Production Phase complete in ${productionTimer.stop()}ms`);

        } else if (verdict.placement === 'DROP' || verdict.placement === 'NOTE') {
            context.stories = context.stories.filter(s => s.id !== ghostId);
            
            this.callbacks.onAgentStart('WRITER', 'Writing Drop...');
            const drop = await agentDropWriter(dossier, verdict);
            context.drops.push(drop);
            this.log('WRITER', `Drop Written`, { drop });
            this.callbacks.onAgentFinish('WRITER');
        }

        if (config.includeAtelier && dossier.scores.practical_craft > 3) {
            this.callbacks.onAgentStart('ENGINEER', 'Reverse-engineering recipe...');
            const recipe = await agentEngineer(dossier);
            context.recipes.push(recipe);
            this.callbacks.onAgentFinish('ENGINEER');
        }

        this.callbacks.onAgentStart('EDITOR', 'Final Layout Assembly');
        const issue = await agentLayout(theme, context.signals, context.stories, context.recipes, [], context.drops, context.debates, context.meta);
        this.callbacks.onAgentFinish('EDITOR');

        onUpdate(issue);
        this.log('SYS', `Total Commission Time: ${commissionTimer.stop()}ms`);
        return issue;

      } catch (e: any) {
        this.log('SYS', 'CRITICAL ERROR IN COMMISSION', { message: e.message });
        console.error(e);
        ['SCOUT', 'CRITIC', 'WRITER', 'EDITOR', 'ARTIST', 'ENGINEER'].forEach(r => this.callbacks.onAgentFail(r as AgentRole, "Process Aborted"));
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
                      scores: {} as any,
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
      this.log('SYS', 'AUTOPILOT ENGAGED');
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
      
      const candidates = leads.filter(l => {
          if (l.duplicate) return false;
          if (l.score < 8.0) return false;
          if (l.risk_classification !== 'NONE') return false;
          if (l.editorial_metrics && l.editorial_metrics.trust < 75) return false;
          return true;
      }).sort((a,b) => b.score - a.score).slice(0, 2);
      
      if (candidates.length === 0) {
          this.log('SYS', 'AUTOPILOT: No candidates passed Policy Gate A (Score/Risk/Trust/Unique).');
          return { issue: await agentLayout(context.theme, context.signals, context.stories, context.recipes, [], context.drops, context.debates, context.meta), publishedCount: 0 };
      }
      
      this.log('SYS', `AUTOPILOT: Processing ${candidates.length} candidates...`, { candidates });

      for (const lead of candidates) {
          await this.commission(lead, context.theme || "The Synthetic Real", useDemo, config, onUpdate, context);
          
          const story = context.stories[context.stories.length - 1]; 
          const debate = context.debates.find((d: any) => d.id === story?.signal_id);
          
          let publishable = false;
          let rejectReason = "Unknown";

          if (!story) {
             rejectReason = "Generation Failed";
          } else {
             const verdict = debate?.verdict;
             const factCheck = story.fact_check_report;
             
             const verdictPass = verdict?.confidence_gate === 'PUBLISH_READY';
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
             story.status = 'REVIEW';
             this.log('OPS', `AUTOPILOT: HELD "${story.headline}" (${rejectReason})`);
          }
          
          await new Promise(r => setTimeout(r, 2000));
      }

      const finalIssue = await agentLayout(context.theme, context.signals, context.stories, context.recipes, [], context.drops, context.debates, context.meta);
      return { issue: finalIssue, publishedCount };
  }
}
