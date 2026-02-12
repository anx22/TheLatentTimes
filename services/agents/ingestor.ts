
import { RetrievalItem } from "../../types";
import { fetchAllFeeds } from "../rss";

// PHASE 1: REAL RSS INGESTOR
// Replaces the hallucinating LLM with a deterministic fetcher.
export const agentFeedReader = async (customDomains?: string[]): Promise<RetrievalItem[]> => {
    console.log("[AGENT] Ingestor: Connecting to real-time feeds...");
    
    // In a real backend, we would use customDomains to filter the registry.
    // For this client-side demo, we use the hardcoded registry in rss.ts to ensure CORS compliance.
    
    try {
        const items = await fetchAllFeeds();
        console.log(`[AGENT] Ingestor: Retrieved ${items.length} items from wire.`);
        return items;
    } catch (e) {
        console.error("[AGENT] Ingestor Failed:", e);
        return [];
    }
};
