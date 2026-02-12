
import { Type } from "@google/genai";
import { RetrievalItem } from "../../types";
import { safeGenerateContent, cleanAndParseJSON } from "../gemini";

const DEFAULT_WHITELIST = [
    'wired.com', 
    'theverge.com', 
    'arxiv.org', 
    'techcrunch.com', 
    'bloomberg.com',
    'vogue.com',
    'hypebeast.com'
];

export const agentFeedReader = async (customDomains?: string[]): Promise<RetrievalItem[]> => {
    const domains = customDomains && customDomains.length > 0 ? customDomains : DEFAULT_WHITELIST;
    
    // We batch the request to optimize API calls
    const targetString = domains.join(', ');
    
    try {
        const response = await safeGenerateContent({
            model: "gemini-3-flash-preview",
            contents: `Act as the FEED INGESTOR. 
            Scan the latest headlines from these high-signal domains: ${targetString}.
            Find 1 major story from EACH domain published in the last 24 hours.
            
            Return a JSON array of items.`,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
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
        });

        const raw = cleanAndParseJSON(response.text);
        
        // Sanitize
        return (raw || []).map((item: any) => ({
            title: item.title || "Untitled Feed Item",
            url: item.url || "",
            source_domain: item.source_domain || "unknown",
            snippet: item.snippet || "No snippet available."
        }));
    } catch (e) {
        console.warn("Feed Ingestor failed:", e);
        return [];
    }
};
