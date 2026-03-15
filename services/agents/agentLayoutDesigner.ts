import { MagazineItem, LayoutItem } from '../../types';
import { callJsonAgent, Type } from '../gemini';

export const agentLayoutDesigner = async (
  newItem: MagazineItem,
  currentLayout: LayoutItem[]
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
    2. You can replace an existing mockup block (e.g., one with a generic headline) or create a new block.
    3. If replacing, keep the x, y, w, h but update the 'i' (id) to "${newItem.id}", 'headline' to the new article's headline, and 'blockType' to an appropriate block type (MUST BE ONE OF: 'CoverStory', 'Glamour', 'SmallArticle', 'Image', 'Quote').
    4. If creating a new block, ensure it fits the 12-column grid.
    5. DO NOT change the 'i' (id) of any other blocks.
    6. Return the FULL updated layout array.
    
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

  const rawLayout = await callJsonAgent<any[]>(prompt, schema, fallback);
  
  // Re-inject the full data objects
  return rawLayout.map(item => {
    if (item.i === newItem.id) {
      return { ...item, data: newItem };
    }
    const originalItem = currentLayout.find(l => l.i === item.i);
    return { ...item, data: originalItem?.data };
  });
};
