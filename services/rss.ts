
import { RetrievalItem } from "../types";

// PROXY: Use rss2json to bypass CORS restrictions in client-side app
const RSS_PROXY_ENDPOINT = "https://api.rss2json.com/v1/api.json?rss_url=";

export interface FeedDefinition {
    id: string;
    name: string;
    url: string;
    category: 'TECH' | 'CULTURE' | 'BIZ' | 'SCIENCE';
}

// 1. THE WHITELIST (High Signal / Low Noise)
// This is a curated registry of real-world signals.
export const FEED_REGISTRY: FeedDefinition[] = [
    { id: 'wired', name: 'Wired', url: 'https://www.wired.com/feed/rss', category: 'CULTURE' },
    { id: 'verge', name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'TECH' },
    { id: 'mit', name: 'MIT Tech Review', url: 'https://www.technologyreview.com/feed/', category: 'SCIENCE' },
    { id: 'techcrunch', name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'BIZ' },
    { id: 'hn', name: 'HackerNews', url: 'https://hnrss.org/best', category: 'TECH' }, // High density
    { id: 'dazed', name: 'Dazed', url: 'https://www.dazeddigital.com/rss', category: 'CULTURE' },
    
    // EXPANSION PACK: SYNTHETIC ERA SIGNALS
    { id: '404', name: '404 Media', url: 'https://www.404media.co/rss/', category: 'TECH' }, // The "Glitch" Beat
    { id: 'dezeen', name: 'Dezeen', url: 'https://www.dezeen.com/feed/', category: 'CULTURE' }, // Architectural Aesthetic
    { id: 'simon', name: 'Simon Willison', url: 'https://simonwillison.net/atom/entries/', category: 'TECH' }, // LLM Engineering/Atelier
    { id: 'ars', name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', category: 'SCIENCE' }, // Deep Tech/Hard Science
    { id: 'venturebeat', name: 'VentureBeat', url: 'https://feeds.feedburner.com/venturebeat/SZYF', category: 'BIZ' }, // AI Enterprise
    { id: 'hypebeast', name: 'Hypebeast', url: 'https://hypebeast.com/feed', category: 'CULTURE' } // Street/Fashion
];

// 2. FETCH WORKER
const fetchFeed = async (feed: FeedDefinition): Promise<RetrievalItem[]> => {
    try {
        const response = await fetch(`${RSS_PROXY_ENDPOINT}${encodeURIComponent(feed.url)}`);
        const data = await response.json();

        if (data.status !== 'ok') {
            console.warn(`[RSS] Failed to fetch ${feed.name}`);
            return [];
        }

        // Transform to Standard Retrieval Item
        return (data.items || []).slice(0, 5).map((item: any) => {
            // Cleanup HTML from description
            const rawSnippet = item.description || item.content || "";
            const cleanSnippet = rawSnippet.replace(/<[^>]*>?/gm, '').slice(0, 300);

            return {
                title: item.title,
                url: item.link,
                source_domain: feed.name,
                snippet: cleanSnippet || "No description available.",
                published_at: item.pubDate
            };
        });

    } catch (e) {
        console.error(`[RSS] Error fetching ${feed.name}`, e);
        return [];
    }
};

// 3. AGGREGATOR
export const fetchAllFeeds = async (filters?: string[]): Promise<RetrievalItem[]> => {
    // 1. Filter Registry if constraints are provided
    // Matches against ID, Name, or Category (case-insensitive partials)
    const targetFeeds = filters && filters.length > 0 
        ? FEED_REGISTRY.filter(f => 
            filters.includes(f.id) || 
            filters.includes(f.category) || 
            filters.some(tag => f.name.toLowerCase().includes(tag.toLowerCase()))
          )
        : FEED_REGISTRY;

    console.log(`[RSS] Fetching ${targetFeeds.length} feeds from live wire...`);

    // 2. Parallel Fetch with Settlement
    const promises = targetFeeds.map(feed => fetchFeed(feed));
    const results = await Promise.allSettled(promises);

    const flatItems: RetrievalItem[] = [];

    results.forEach(res => {
        if (res.status === 'fulfilled') {
            flatItems.push(...res.value);
        }
    });

    // Shuffle results slightly to avoid "chunks" of same source
    return flatItems.sort(() => Math.random() - 0.5);
};
