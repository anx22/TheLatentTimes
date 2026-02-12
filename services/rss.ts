
import { RetrievalItem } from "../types";

// PROXY: Use rss2json to bypass CORS restrictions in client-side app
const RSS_PROXY_ENDPOINT = "https://api.rss2json.com/v1/api.json?rss_url=";

interface FeedDefinition {
    id: string;
    name: string;
    url: string;
    category: 'TECH' | 'CULTURE' | 'BIZ' | 'SCIENCE';
}

// 1. THE WHITELIST (High Signal / Low Noise)
const FEED_REGISTRY: FeedDefinition[] = [
    { id: 'wired', name: 'Wired', url: 'https://www.wired.com/feed/rss', category: 'CULTURE' },
    { id: 'verge', name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'TECH' },
    { id: 'mit', name: 'MIT Tech Review', url: 'https://www.technologyreview.com/feed/', category: 'SCIENCE' },
    { id: 'techcrunch', name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'BIZ' },
    { id: 'hn', name: 'HackerNews', url: 'https://hnrss.org/best', category: 'TECH' }, // High density
    { id: 'dazed', name: 'Dazed', url: 'https://www.dazeddigital.com/rss', category: 'CULTURE' }
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
export const fetchAllFeeds = async (): Promise<RetrievalItem[]> => {
    // Parallel Fetch with Settlement
    const promises = FEED_REGISTRY.map(feed => fetchFeed(feed));
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
