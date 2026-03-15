import { LayoutItem } from './types';

export const INITIAL_LAYOUT: LayoutItem[] = [
  // Row 1
  { i: 'item_1', x: 0, y: 0, w: 3, h: 4, headline: "The Synthetic Sublime", type: "COVER STORY", blockType: 'CoverStory' },
  { i: 'item_2', x: 3, y: 0, w: 3, h: 4, headline: "Glamour in the Machine", type: "COVER STORY", blockType: 'Glamour' },
  { i: 'item_3', x: 6, y: 0, w: 6, h: 6, headline: "Metallic Woman", type: "IMAGE", blockType: 'Image', data: { hero_image_url: 'https://picsum.photos/800/1200?random=1' } as any },
  
  // Row 2
  { i: 'item_4', x: 0, y: 4, w: 6, h: 2, headline: "Quote", type: "QUOTE", blockType: 'Quote' },
  
  // Row 3
  { i: 'item_5', x: 0, y: 6, w: 9, h: 2, headline: "Section Header", type: "HEADER", blockType: 'SectionHeader' },
  { i: 'item_6', x: 9, y: 6, w: 3, h: 2, headline: "New Canon", type: "COLUMN", blockType: 'NewCanon' },
  
  // Row 4
  { i: 'item_7', x: 0, y: 8, w: 7, h: 8, headline: "Woman with Black Hair", type: "IMAGE", blockType: 'Image', data: { hero_image_url: 'https://picsum.photos/800/1200?random=2' } as any },
  { i: 'item_8', x: 7, y: 8, w: 5, h: 4, headline: "Identity Systems", type: "FEATURE", blockType: 'IdentitySystems' },
  
  // Row 5
  { i: 'item_9', x: 7, y: 12, w: 5, h: 4, headline: "Silver Mask", type: "IMAGE", blockType: 'Image', data: { hero_image_url: 'https://picsum.photos/800/800?random=3' } as any },
  
  // Row 6
  { i: 'item_10', x: 7, y: 16, w: 5, h: 2, headline: "Synthetic Era", type: "TITLE", blockType: 'SyntheticEra' },
  
  // Row 7
  { i: 'item_11', x: 0, y: 18, w: 4, h: 4, headline: "House View", type: "OPINION", blockType: 'HouseView' },
  { i: 'item_12', x: 4, y: 18, w: 8, h: 4, headline: "Curator's Dilemma", type: "FEATURE", blockType: 'CuratorsDilemma' },
  
  // Row 8
  { i: 'item_13', x: 0, y: 22, w: 4, h: 3, headline: "Self-Healing Workflows", type: "ARTICLE", blockType: 'SmallArticle', data: { hero_image_url: 'https://picsum.photos/400/300?random=4' } as any },
  { i: 'item_14', x: 4, y: 22, w: 4, h: 3, headline: "The Hook Factory", type: "ARTICLE", blockType: 'SmallArticle', data: { hero_image_url: 'https://picsum.photos/400/300?random=5' } as any },
  { i: 'item_15', x: 8, y: 22, w: 4, h: 3, headline: "Nano Banana", type: "ARTICLE", blockType: 'SmallArticle', data: { hero_image_url: 'https://picsum.photos/400/300?random=6' } as any },
  
  // Row 9
  { i: 'item_16', x: 0, y: 25, w: 3, h: 3, headline: "Brain", type: "IMAGE", blockType: 'Image', data: { hero_image_url: 'https://picsum.photos/400/400?random=7' } as any },
  { i: 'item_17', x: 3, y: 25, w: 9, h: 3, headline: "Large Quote", type: "QUOTE", blockType: 'LargeQuote' },
  
  // Row 10
  { i: 'item_18', x: 0, y: 28, w: 12, h: 3, headline: "Massive Headline", type: "TITLE", blockType: 'MassiveHeadline' },
  
  // Row 11
  { i: 'item_19', x: 0, y: 31, w: 3, h: 2, headline: "Editor's Note", type: "NOTE", blockType: 'Default', data: { dek: "When the machine begins to hallucinate, is it an error or an epiphany? In this issue, we explore the latent space between code and consciousness." } as any },
  { i: 'item_20', x: 3, y: 31, w: 6, h: 2, headline: "Weaving light from noise.", type: "TITLE", blockType: 'Default', data: { dek: "In an era of instant generation, we return to the node, the seed, and the hand-crafted pipeline. A study of digital patience and the rituals of the latent space." } as any },
  { i: 'item_21', x: 9, y: 31, w: 3, h: 6, headline: "Index", type: "INDEX", blockType: 'IndexList' },
  
  // Row 12
  { i: 'item_22', x: 0, y: 33, w: 9, h: 2, headline: "The Ghost in the Machine", type: "ARTICLE", blockType: 'Default', data: { dek: "It started with a simple anomaly. A model trained on architectural blueprints began outputting structures that defied physics, yet stood perfectly in simulation. We call it 'hallucination,' but perhaps it is simply imagination unburdened by gravity." } as any },
  
  // Row 13
  { i: 'item_23', x: 0, y: 35, w: 6, h: 6, headline: "The Hook Factory", type: "FEATURE", blockType: 'HookFactory' },
  { i: 'item_24', x: 6, y: 35, w: 6, h: 8, headline: "Woman Profile", type: "IMAGE", blockType: 'Image', data: { hero_image_url: 'https://picsum.photos/800/1200?random=8' } as any },
  
  // Row 14
  { i: 'item_25', x: 0, y: 41, w: 3, h: 4, headline: "Synthetic Hallucination", type: "FEATURE", blockType: 'SyntheticHallucination' },
  { i: 'item_26', x: 3, y: 41, w: 3, h: 4, headline: "Latent Space", type: "FEATURE", blockType: 'LatentSpace' },
];
