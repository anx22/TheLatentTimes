
import { RetrievalItem } from "../../types";
import { fetchAllFeeds } from "../rss";

// PHASE 1: REAL RSS INGESTOR
// Connects to live RSS feeds via CORS proxy.
export const agentFeedReader = async (customDomains?: string[]): Promise<RetrievalItem[]> => {
    const filterLog = customDomains && customDomains.length > 0 ? `(Filter: ${customDomains.join(', ')})` : '(All Sources)';
    console.log(`[AGENT] Ingestor: Connecting to real-time feeds... ${filterLog}`);
    
    try {
        // Fetch live data from the wire, applying any requested domain filters
        const items = await fetchAllFeeds(customDomains);
        
        console.log(`[AGENT] Ingestor: Retrieved ${items.length} items from wire.`);
        return items;
    } catch (e) {
        console.error("[AGENT] Ingestor Failed:", e);
        return [];
    }
};
