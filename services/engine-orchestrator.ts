
import { IssueContent, SignalDossier, StoryArtifact, RecipeArtifact, AgentLog, DropArtifact, ColumnistPersona, DebateArtifact } from "../types";
import { 
  agentQueryOrchestrator, agentDossierCompiler, agentArchivist, 
  agentPitching, agentVerdict, 
  agentHeadlineForge, agentHeadlineSelector, agentOutline, agentDraft, agentRewrite, agentFactCheck,
  agentEngineer, agentRecipeValidator, agentVariationsGenerator,
  agentLayout,
  agentDropWriter,
  agentColumnist,
  agentImageBrief,
  agentLayoutDirectives // New import
} from "./engine-agents";
import { RunConfig } from "../hooks/useNewsroom";
import { generateImage, safeGenerateContent } from "./gemini";

type State = 'IDLE' | 'COLLECTING' | 'DEBATING' | 'WRITING' | 'ASSEMBLING' | 'PUBLISHED';

export class IssueOrchestrator {
  private state: State = 'IDLE';
  private logs: AgentLog[] = [];
  private onLog: (log: AgentLog) => void;
  
  // Internal state tracking for streaming
  private signals: SignalDossier[] = [];
  private debates: DebateArtifact[] = []; // NEW: Tracking debates
  private stories: StoryArtifact[] = [];
  private recipes: RecipeArtifact[] = [];
  private drops: DropArtifact[] = [];
  private dropItems: Array<{ category: string; title: string; desc: string }> = [];
  
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

  // MOCK SEARCH RESULTS (0 Token Cost)
  private getMockSearchResults(query: string): string {
    const q = query.toLowerCase();
    
    if (q.includes('kling') || q.includes('video')) {
      return `
        SOURCE: Kling AI Official Release Notes (kling.ai/blog)
        SNIPPET: Kling 3.0 introduces 'Physics-Aware Motion', a new transformer architecture that reduces morphing artifacts by 80%. Now supports 1080p generation at 60fps.
        
        SOURCE: TechCrunch - The Video Generation Wars
        SNIPPET: Competitors are scrambling as Kling releases its open beta. The model demonstrates superior temporal consistency compared to Sora.
        
        SOURCE: Reddit r/StableDiffusion
        SNIPPET: "Just tried Kling 3. The hands are actually perfect. This is the end of stock footage." (340 upvotes)
      `;
    }
    
    if (q.includes('nano') || q.includes('banana')) {
      return `
        SOURCE: Google DeepMind Blog - Nano Banana
        SNIPPET: Introducing 'Nano Banana', a 2B parameter model optimized for edge devices. Capable of running strictly on-device for Pixel 9.
        
        SOURCE: The Verge
        SNIPPET: Small models are the new big thing. Nano Banana proves you don't need a server farm to run competent agents.
      `;
    }

    if (q.includes('clawdbot')) {
      return `
        SOURCE: Github - Clawdbot/manifesto
        SNIPPET: Clawdbot is an autonomous crawler that refuses to index SEO-spam. It uses vision-language models to 'see' the page like a human.
        
        SOURCE: Hacker News
        SNIPPET: "Finally, a crawler that respects user intent over keyword stuffing."
      `;
    }

    // Generic Fallback
    return `
      SOURCE: Simulation Data for "${query}"
      SNIPPET: This is a simulated search result to save API quota. The system has detected a high-relevance signal regarding ${query}.
      Trends indicate a 40% increase in interest. Primary sources confirm the release is imminent.
      Experts argue this will disrupt the current workflow.
    `;
  }

  private async executeSearch(query: string, useDemo: boolean): Promise<string> {
    // TRUE SIMULATION: Bypass API entirely
    if (useDemo) {
        return this.getMockSearchResults(query);
    }

    try {
      // safeGenerateContent handles retries for 429s automatically
      const response = await safeGenerateContent({
        model: 'gemini-3-flash-preview',
        contents: `Search for: ${query}`,
        config: { tools: [{ googleSearch: {} }] }
      });
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (!chunks || chunks.length === 0) return `[No results for "${query}"]`;
      return chunks.map((c: any) => c.web?.title ? `SOURCE: ${c.web.title} (${c.web.uri})\nSNIPPET: ${response.text}` : '').join('\n');
    } catch (e) {
      return `[Search Error for "${query}": ${e}]`;
    }
  }

  // Helper to emit partial state
  private async emitUpdate(theme: string, onUpdate?: (partial: IssueContent) => void) {
      if (!onUpdate) return;
      
      const partialIssue = await agentLayout(
          theme,
          this.signals,
          this.stories,
          this.recipes,
          this.dropItems,
          this.drops,
          this.debates // Pass debates to layout
      );
      // Mark as DRAFT/REVIEW during streaming
      partialIssue.meta.status = 'WRITING'; 
      onUpdate(partialIssue);
  }

  async startIssueCycle(
      theme: string, 
      targets: string[], 
      useDemo: boolean, 
      config: RunConfig,
      onUpdate?: (partial: IssueContent) => void
  ): Promise<IssueContent | null> {
    try {
      // Reset State
      this.signals = [];
      this.debates = [];
      this.stories = [];
      this.recipes = [];
      this.drops = [];
      this.dropItems = [];

      // --- PHASE 0: TRIGGER ---
      this.state = 'COLLECTING';
      this.log('SYS', `Starting Issue Cycle: "${theme}"`);
      this.log('SYS', `Mode: ${useDemo ? 'SIMULATION (No Search Quota)' : 'LIVE (Uses Quota)'}`);

      // --- PHASE 1: SIGNAL COLLECTION ---
      this.log('SYS', 'PHASE 1: SIGNAL COLLECTION');
      
      for (const target of targets) {
        this.log('SCOUT', `Target Locked: "${target}"`);

        // 1.1 Query Orchestration
        let queries: string[];
        if (useDemo) {
          // In demo, we just need simple keys to trigger the mock dictionary
          queries = [target]; 
        } else {
           queries = await agentQueryOrchestrator(target);
        }
        this.log('QUERY_ORCH', `Search vectors active`, { queries });

        // 1.2 Search & Compile - SEQUENTIAL EXECUTION
        if (config.deepResearch && !useDemo) {
           this.log('SCOUT', `Deep Research active: verifying primary sources...`);
        }

        const searchResults: string[] = [];
        for (const q of queries) {
            // No delay needed in demo mode
            if (!useDemo) await new Promise(r => setTimeout(r, 1000));
            
            // Pass useDemo flag to executeSearch
            const result = await this.executeSearch(q, useDemo);
            searchResults.push(result);
        }

        const dossier = await agentDossierCompiler(target, searchResults);
        this.log('SCOUT', `Dossier compiled: "${dossier.title_candidate}"`);

        // 1.3 Archivist
        const archiveCheck = await agentArchivist(dossier);
        if (archiveCheck.approved) {
           this.signals.push(dossier);
        } else {
           this.log('ARCHIVIST', `Signal REJECTED: ${archiveCheck.reason}`, { type: 'warn' });
        }
      }

      if (this.signals.length === 0) throw new Error("No signals survived the Archivist gate.");
      
      // Emit initial signals
      await this.emitUpdate(theme, onUpdate);

      // --- PHASE 2 & 3: PITCH & DEBATE ---
      this.state = 'DEBATING';
      this.log('SYS', 'PHASE 2/3: DEBATE ROOM');
      
      const approvedStoryMeta: Array<{sig: SignalDossier, verdict: any}> = [];
      const approvedRecipeSigs: SignalDossier[] = [];

      for (const sig of this.signals) {
        // Throttling
        if (!useDemo) await new Promise(r => setTimeout(r, 500));

        // 2. Pitching
        this.log('SYS', `Opening floor for: ${sig.topic}`);
        const pitches = await agentPitching(sig, theme);
        this.log('BOARD', `Generated ${pitches.length} pitches`, { pitches: pitches.map(p => p.angle) });

        // 3. Verdict
        const verdict = await agentVerdict(sig, pitches);
        sig.verdict = verdict.placement as any;
        this.log('EDITOR', `Verdict: ${verdict.placement}`, { reason: verdict.reason });
        
        // 4. Capture Debate Artifact
        this.debates.push({
            id: sig.id,
            topic: sig.topic,
            scores: sig.scores,
            pitches: pitches,
            verdict: verdict
        });
        await this.emitUpdate(theme, onUpdate);

        // --- ROUTING ENGINE ---
        if (['COVER', 'FEATURE', 'COLUMN'].includes(verdict.placement)) {
          approvedStoryMeta.push({ sig, verdict });
        } 
        else if (verdict.placement === 'DROP' || verdict.placement === 'NOTE') {
           // PHASE 4.0: DROP WRITER
           this.log('WRITER', `Commissioning DROP for ${sig.topic}...`);
           const drop = await agentDropWriter(sig, verdict);
           
           // FACT GATE for Drop
           const check = await agentFactCheck(drop, sig);
           if(check.approved) {
             this.drops.push(drop);
             this.dropItems.push({
               category: drop.label,
               title: drop.headline,
               desc: drop.body.substring(0, 120) + '...'
             });
             // Streaming Update: New Drop
             await this.emitUpdate(theme, onUpdate);
           } else {
             this.log('FACT_CHECK', `DROP REJECTED: ${check.issues.join(', ')}`);
           }
        }
        else {
           this.log('ARCHIVIST', `Sent to ${verdict.placement}`);
        }

        if (config.includeAtelier && (verdict.placement === 'ATELIER' || sig.scores.practical_craft >= 4)) {
           approvedRecipeSigs.push(sig);
        }
      }

      // --- PHASE 4 & 5: PRODUCTION (Longform) ---
      this.state = 'WRITING';
      
      // Process Stories in parallel but manage them
      for (const {sig, verdict} of approvedStoryMeta) {
          // Throttling per story loop
          if (!useDemo) await new Promise(r => setTimeout(r, 1000));

          // 4.1 Headline Forge & Selector
          const headlines = await agentHeadlineForge(sig, verdict);
          const selectedHeadline = await agentHeadlineSelector(headlines, verdict);

          // 4.2 Outline
          const outline = await agentOutline(sig, verdict);
          
          // 4.3 Draft (Feature vs Column)
          let story: StoryArtifact;
          if (verdict.placement === 'COLUMN') {
              const personas: ColumnistPersona[] = ['THE_CRITIC', 'THE_OPTIMIST', 'THE_GHOST'];
              const assignedPersona = personas[Math.floor(Math.random() * personas.length)];
              this.log('EDITOR', `Assigning Column to ${assignedPersona}`);
              story = await agentColumnist(sig, verdict, selectedHeadline, outline, assignedPersona);
          } else {
              story = await agentDraft(sig, verdict, selectedHeadline, outline);
          }

          // PHASE 9: IMAGE BRANCH
          this.log('DESIGNER', `Drafting visual brief for ${story.headline}...`);
          const imageBrief = await agentImageBrief(story);
          story.img_brief = imageBrief;
          story.img_prompt = imageBrief.technical_prompt; 
          story.img_caption = `CONCEPT: ${imageBrief.visual_metaphor}`;

          // PHASE 10: LAYOUT INTELLIGENCE (New)
          this.log('DESIGNER', `Compiling layout strategy...`);
          const layout = await agentLayoutDirectives(story);
          story.layout = layout;
          this.log('DESIGNER', `Layout Assigned: ${layout.template} / ${layout.hero_position}`);

          // ACTUAL IMAGE GENERATION (New in Iteration 5)
          if (config.generateImages) {
              this.log('ATELIER', `Generating Visual Asset for ${story.headline} (Slow)...`);
              try {
                  const base64 = await generateImage(story.img_prompt, '16:9');
                  story.img_base64 = base64;
                  this.log('ATELIER', `Asset Generated Successfully`);
              } catch (err) {
                  this.log('ATELIER', `Generation Failed: ${err}`, { type: 'error' });
              }
          }
          
          // 4.4 Rewrite
          if (config.qualityPass) {
            story = await agentRewrite(story, 'AUTHORITY');
            const factCheck = await agentFactCheck(story, sig);
            if (!factCheck.approved) {
              story.deck = `[UNVERIFIED] ${story.deck}`;
              this.log('FACT_CHECK', `Issues found in ${story.headline}`, { issues: factCheck.issues });
            }
          }

          this.stories.push(story);
          await this.emitUpdate(theme, onUpdate);
      }

      // Recipes
      for (const sig of approvedRecipeSigs) {
        let recipe = await agentEngineer(sig);
        const check = await agentRecipeValidator(recipe);
        if (!check.valid && check.adjusted_params) {
            recipe = { ...recipe, params: check.adjusted_params };
        }
        recipe.status = 'REVIEW'; 
        this.recipes.push(recipe);
        await this.emitUpdate(theme, onUpdate);
      }

      // --- PHASE 6: ASSEMBLY ---
      this.state = 'ASSEMBLING';
      
      const issue = await agentLayout(
        theme,
        this.signals,
        this.stories,
        this.recipes,
        this.dropItems,
        this.drops,
        this.debates // Pass debates
      );
      
      // Cover Image Generation (if configured)
      if (config.generateImages && issue.cover.imgPrompt) {
          this.log('ATELIER', `Generating Cover Art...`);
          try {
              const coverBase64 = await generateImage(issue.cover.imgPrompt, '3:4');
              issue.cover.img_base64 = coverBase64;
              this.log('ATELIER', `Cover Art Generated`);
          } catch(err) {
              this.log('ATELIER', `Cover Generation Failed: ${err}`, { type: 'error' });
          }
      }

      // --- PHASE 7: PUBLISH ---
      this.state = 'PUBLISHED';
      return issue;

    } catch (e) {
      this.log('SYS', `CRITICAL FAILURE: ${e instanceof Error ? e.message : 'Unknown'}`);
      return null;
    }
  }
}
