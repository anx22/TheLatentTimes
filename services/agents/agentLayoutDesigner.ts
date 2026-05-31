import { MagazineItem, LayoutItem } from '../../types';
import { callJsonAgent, Type } from '../gemini';

export const agentLayoutDesigner = async (
  newItem: MagazineItem,
  currentLayout: LayoutItem[],
  missionId?: string
): Promise<LayoutItem[]> => {
  const prompt = `
    You are the ART DIRECTOR and LAYOUT DESIGNER for a high-end avant-garde tech/culture magazine.
    We have a new article that needs to be placed into the current grid layout.
    
    NEW ARTICLE:
    ID: "${newItem.id}"
    Headline: "${newItem.title}"
    Deck: "${newItem.dek}"
    Tags: ${newItem.tags?.join(', ')}
    Media Type: ${newItem.media_type}
    
    CURRENT LAYOUT (JSON):
    ${JSON.stringify(currentLayout.map(l => ({ i: l.i, x: l.x, y: l.y, w: l.w, h: l.h, headline: l.headline, blockType: l.blockType })), null, 2)}
    
    TASK:
    1. Decide where to place the new article in the layout.
    2. You are FORBIDDEN from making the magazine look like a list. Use VARYING widths and heights.
    3. You MUST pick a diverse 'blockType' from the list below. Do NOT default to 'SmallArticle' unless the article is low-signal.
    4. TEMPLATE REGISTRY: 
       - 'CoverStory': Large, hero image focus. Use for high-impact stories. (w: 8-12, h: 6-8)
       - 'Glamour': High-fashion, elegant typography, curated feel. (w: 6-8, h: 4-6)
       - 'MassiveHeadline': Experimental, huge typography. (w: 8-12, h: 3-5)
       - 'SyntheticEra': Clinical presentation, focusing on technical reality. (w: 4-6, h: 4-6)
       - 'NewCanon': Philosophical, academic vibe, striking negative space. (w: 4-8, h: 6-8)
       - 'HouseView': Strong editorial opinion, structurally rigid, brutalist. (w: 4-6, h: 3-5)
       - 'LargeQuote': Pull-quote focus, dramatic scale. (w: 12, h: 2-3)
       - 'HookFactory': Sharp, aggressive, tightly packed. (w: 4, h: 3)
       - 'LatentSpace': Dreamy, high-concept, fashion-tech aesthetics. (w: 6, h: 6)
       - 'IdentitySystems': Corporate/Systemic critique, architectural layout. (w: 6, h: 4)
       - 'Image': Visual asset only focus (w: 4-12, h: 4-8)
       - 'SmallArticle': Standard small slot (w: 3-4, h: 2-3)
    5. Return the FULL updated layout array. Ensure NO overlaps on the 12-column grid.
    
    The layout must be a valid JSON array of LayoutItem objects.
  `;

  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        i: { type: Type.STRING },
        x: { type: Type.INTEGER },
        y: { type: Type.INTEGER },
        w: { type: Type.INTEGER },
        h: { type: Type.INTEGER },
        headline: { type: Type.STRING },
        blockType: { type: Type.STRING }
      },
      required: ["i", "x", "y", "w", "h", "headline", "blockType"]
    }
  };

  const fallback = currentLayout;

  const rawLayout = await callJsonAgent<any[]>(prompt, schema, fallback, missionId);
  
  // Re-inject the full data objects
  return rawLayout.map(item => {
    if (item.i === newItem.id) {
      return { ...item, data: newItem };
    }
    const originalItem = currentLayout.find(l => l.i === item.i);
    return { ...item, data: originalItem?.data };
  });
};
