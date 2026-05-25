export const fetchRSS = async (url: string, fetchRssAction?: (args: { url: string }) => Promise<string>): Promise<any[]> => {
  try {
    let xmlText = "";
    if (fetchRssAction) {
      xmlText = await fetchRssAction({ url });
    } else {
      const proxies = [
        `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
        `https://corsproxy.io/?${encodeURIComponent(url)}`,
        `https://thingproxy.freeboard.io/fetch/${url}`
      ];
      
      let lastError: any = null;
      for (const pUrl of proxies) {
        try {
          const response = await fetch(pUrl);
          if (!response.ok) continue;
          const data = await response.json();
          xmlText = data.contents || data; // handle different proxy formats
          if (xmlText) break;
        } catch (e) {
          lastError = e;
        }
      }
      
      if (!xmlText) throw lastError || new Error("All proxies failed to fetch source.");
    }
    
    if (!xmlText) throw new Error("Empty response received from source.");

    // Parse XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    
    // Check for parsing errors
    const parserError = xmlDoc.getElementsByTagName("parsererror");
    if (parserError.length > 0) {
      // Try again with text/html as some feeds are malformed but recoverable
      const fallbackDoc = parser.parseFromString(xmlText, "text/html");
      const items = Array.from(fallbackDoc.querySelectorAll("item, entry"));
      if (items.length === 0) {
         throw new Error(`XML Parsing Error: ${parserError[0].textContent?.slice(0, 100)}`);
      }
    }

    const items = Array.from(xmlDoc.querySelectorAll("item")).map(item => ({
      title: item.querySelector("title")?.textContent || "Untitled Signal",
      link: item.querySelector("link")?.textContent || item.querySelector("link")?.innerHTML || "",
      pubDate: item.querySelector("pubDate")?.textContent || item.querySelector("date")?.textContent || "",
      description: item.querySelector("description")?.textContent || "",
    }));
    
    // Atom feed support (if RSS query failed)
    if (items.length === 0) {
      const entries = Array.from(xmlDoc.querySelectorAll("entry")).map(entry => ({
        title: entry.querySelector("title")?.textContent || "Untitled Signal",
        link: entry.querySelector("link")?.getAttribute("href") || entry.querySelector("link")?.textContent || "",
        pubDate: entry.querySelector("updated")?.textContent || entry.querySelector("published")?.textContent || "",
        description: entry.querySelector("summary")?.textContent || entry.querySelector("content")?.textContent || "",
      }));
      return entries;
    }
    
    return items;
  } catch (error: any) {
    console.error(`Failed to fetch RSS from ${url}:`, error);
    throw error; // Let the adapter handle the error log to DB
  }
};
