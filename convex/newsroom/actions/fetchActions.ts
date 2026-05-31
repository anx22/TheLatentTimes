import { action } from "../../_generated/server";
import { v } from "convex/values";

export const fetchRss = action({
  args: { url: v.string() },
  handler: async (ctx, args) => {
    try {
      const response = await fetch(args.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (LNT Newsroom v2.5; AI Editorial Bot)',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*'
        }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const xml = await response.text();

      // Simple regex-based extraction to avoid heavy dependencies in Phase 1
      const signals: any[] = [];
      const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
      
      for (const match of itemMatches) {
        const itemContent = match[1];
        const title = itemContent.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)?.[1] || 
                      itemContent.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "";
        const link = itemContent.match(/<link>([\s\S]*?)<\/link>/)?.[1] || "";
        const description = itemContent.match(/<description>([\s\S]*?)<\/description>/)?.[1] || 
                           itemContent.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)?.[1] || "";
        const pubDate = itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || new Date().toISOString();

        if (title) {
          signals.push({
            title: title.replace(/<!\[CDATA\[|\]\]>/g, '').trim(),
            url: link.trim(),
            content: description.replace(/<[^>]*>?/gm, '').replace(/<!\[CDATA\[|\]\]>/g, '').trim(),
            timestamp: new Date(pubDate).getTime() || Date.now()
          });
        }
      }

      return signals.slice(0, 20);
    } catch (e: any) {
      console.error(`fetchRss failed for ${args.url}:`, e);
      return [];
    }
  },
});

export const fetchGitHub = action({
  args: { limit: v.number() },
  handler: async (ctx, args) => {
    try {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const res = await fetch(`https://api.github.com/search/repositories?q=created:>${sevenDaysAgo}+stars:>10+sort:stars-desc&per_page=${args.limit}`);
        if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
        const data = await res.json();
        const repos = data.items || [];
        
        return repos.map((repo: any) => ({
            title: `${repo.full_name}: ${repo.description || 'No description'}`,
            url: repo.html_url,
            content: repo.description || "",
            timestamp: new Date(repo.created_at).getTime() || Date.now()
        }));
    } catch(e) {
        console.error("fetchGitHub failed", e);
        return [];
    }
  }
});

export const discoverFeeds = action({
  args: { url: v.string() },
  handler: async (ctx, args) => {
    const paths = ['/feed', '/rss', '/rss.xml', '/atom.xml'];
    let baseUrl = args.url;
    if (!baseUrl.startsWith('http')) baseUrl = `https://${baseUrl}`;
    
    try {
      const target = new URL(baseUrl);
      const origin = target.origin;
      const found: string[] = [];

      // Phase 1: Simple probe for common paths
      for (const path of paths) {
        try {
          const testUrl = `${origin}${path}`;
          const res = await fetch(testUrl, { method: 'HEAD' });
          if (res.ok && res.headers.get('content-type')?.includes('xml')) {
            found.push(testUrl);
          }
        } catch (e) {
          // Silent probe failure
        }
      }

      return {
        foundFeeds: found.map(f => ({ url: f, type: 'rss', confidence: 0.8 })),
        confidence: found.length > 0 ? 0.9 : 0.1,
        notes: found.length > 0 ? "Potential feeds discovered via common paths." : "No explicit feeds found on common paths."
      };
    } catch (e: any) {
      return { foundFeeds: [], confidence: 0, notes: e.message };
    }
  }
});
