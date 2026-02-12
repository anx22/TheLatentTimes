
/**
 * HEADLESS AUTOPILOT SCRIPT
 * 
 * Usage:
 * 1. Ensure process.env.VITE_GEMINI_API_KEY, SUPABASE_URL, etc. are set.
 * 2. Run with ts-node or deploy to Supabase Edge Function.
 */

import { IssueOrchestrator } from "../services/engine-orchestrator";
import { saveIssue, saveLogs, loadIssue } from "../services/storage";
import { AgentRole, AgentLog, IssueContent } from "../types";
import { RunConfig } from "../hooks/useNewsroom";

// Polyfill for storage if needed
if (!process.env.VITE_GEMINI_API_KEY && process.env.API_KEY) {
    // Map generic API_KEY to Vite expected format if running in pure node
    (process.env as any).VITE_GEMINI_API_KEY = process.env.API_KEY;
}

const HEADLESS_CONFIG: RunConfig = {
    deepResearch: true,
    timeWindow: '24h',
    voicePreset: 'Modus',
    riskTolerance: 'Mid',
    qualityPass: true,
    includeAtelier: true,
    generateImages: false // Usually disable images on headless to save tokens/time
};

async function runHeadlessLoop() {
    console.log(">>> INITIALIZING HEADLESS ORCHESTRATOR");
    
    const logs: AgentLog[] = [];
    
    // 1. Initialize State Container
    // In a real serverless function, we would load this from DB every run
    let currentIssue = await loadIssue() || {
        meta: { 
            run_id: 'init', issue_id: '', vol: '', theme: 'Headless Run', date: '', editor: 'SERVER', status: 'COLLECTING',
            metrics: { signals_ingested: 0, avg_confidence: 0, error_rate: 0 }
        },
        ticker: [], cover: { eyebrow: '', title: '', deck: '', coverlines: [], imgPrompt: '' },
        features: [], columns: [], drops: [], edit: [], atelier: [], debates: [], index_keys: [],
        colophon: { contributors: [], sources: [], corrections: [] }
    } as IssueContent;

    const context = {
        signals: [], // In real run, load recent signals from DB
        debates: currentIssue.debates || [],
        stories: [...currentIssue.features, ...currentIssue.columns],
        recipes: currentIssue.atelier,
        drops: currentIssue.drops,
        meta: currentIssue.meta,
        theme: "The Synthetic Real" // Or load from config
    };

    // 2. Setup Callbacks
    const orchestrator = new IssueOrchestrator({
        onLog: (log) => {
            console.log(`[${log.agent}] ${log.message}`);
            logs.push(log);
        },
        onAgentStart: (role, task) => console.log(`START: ${role} -> ${task}`),
        onAgentUpdate: (role, task, p) => {},
        onAgentFinish: (role) => console.log(`DONE: ${role}`),
        onAgentFail: (role, err) => console.error(`FAIL: ${role} -> ${err}`)
    });

    // 3. Run Cycle
    const TARGETS = ["Generative Video", "Agentic Patterns"];
    
    try {
        console.log(">>> STARTING AUTOPILOT CYCLE");
        const result = await orchestrator.autoPilot(
            TARGETS, 
            false, // Use Real Gemini
            HEADLESS_CONFIG,
            (partial) => {
                // On Partial Update (Optional: streaming save)
                console.log("...partial update generated");
            },
            context
        );

        if (result) {
            console.log(`>>> CYCLE COMPLETE. Published: ${result.publishedCount}`);
            // 4. Save to DB
            await saveIssue(result.issue);
            await saveLogs(logs);
            console.log(">>> DATABASE SYNCED");
        }
        
    } catch (e) {
        console.error("CRITICAL HEADLESS FAILURE:", e);
        await saveLogs(logs);
    }
}

// Check if running directly
if (require.main === module) {
    runHeadlessLoop();
}

export { runHeadlessLoop };
