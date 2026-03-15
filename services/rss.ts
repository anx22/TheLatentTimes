export const fetchRSS = async (url: string, fetchRssAction?: (args: { url: string }) => Promise<string>): Promise<any[]> => {
  try {
    let xmlText = "";
    if (fetchRssAction) {
      xmlText = await fetchRssAction({ url });
    } else {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error('Network response was not ok.');
      const data = await response.json();
      xmlText = data.contents;
    }
    
    // Parse XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    
    const items = Array.from(xmlDoc.querySelectorAll("item")).map(item => ({
      title: item.querySelector("title")?.textContent || "",
      link: item.querySelector("link")?.textContent || "",
      pubDate: item.querySelector("pubDate")?.textContent || "",
      description: item.querySelector("description")?.textContent || "",
    }));
    
    // Atom feed support
    if (items.length === 0) {
      const entries = Array.from(xmlDoc.querySelectorAll("entry")).map(entry => ({
        title: entry.querySelector("title")?.textContent || "",
        link: entry.querySelector("link")?.getAttribute("href") || "",
        pubDate: entry.querySelector("updated")?.textContent || entry.querySelector("published")?.textContent || "",
        description: entry.querySelector("summary")?.textContent || entry.querySelector("content")?.textContent || "",
      }));
      return entries;
    }
    
    return items;
  } catch (error) {
    console.error(`Failed to fetch RSS from ${url}:`, error);
    return [];
  }
};
