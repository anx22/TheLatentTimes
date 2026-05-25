import { BlockTemplate } from '../types';
import { CoverStoryBlock } from './CoverStory';
import { GlamourBlock } from './Glamour';
import { HookFactoryBlock } from './HookFactory';
import { HouseViewBlock } from './HouseView';
import { NewCanonBlock } from './NewCanon';
import { IdentitySystemsBlock } from './IdentitySystems';
import { ImageBlock } from './Image';
import { IndexListBlock } from './IndexList';
import { QuoteBlock } from './Quote';
import { SectionHeaderBlock } from './SectionHeader';
import { SyntheticEraBlock } from './SyntheticEra';
import { SmallArticleBlock } from './SmallArticle';
import { MassiveHeadlineBlock } from './MassiveHeadline';
import { LatentSpaceBlock } from './LatentSpace';
import { SyntheticHallucinationBlock } from './SyntheticHallucination';
import { LargeQuoteBlock } from './LargeQuote';

export const TEMPLATES: Record<string, BlockTemplate> = {
  CoverStory: {
    id: 'CoverStory',
    title: 'Cover Story',
    description: 'High-impact square block for the main feature.',
    config: { w: 6, h: 6, minW: 2, minH: 1 },
    component: CoverStoryBlock
  },
  Glamour: {
    id: 'Glamour',
    title: 'Glamour Block',
    description: 'Vertical block with large serif typography.',
    config: { w: 6, h: 6, minW: 2, minH: 1 },
    component: GlamourBlock
  },
  HookFactory: {
    id: 'HookFactory',
    title: 'Hook Factory',
    description: 'Text-heavy block for analytical dispatches.',
    config: { w: 6, h: 3, minW: 4, minH: 1 },
    component: HookFactoryBlock
  },
  HouseView: {
    id: 'HouseView',
    title: 'House View',
    description: 'Dark quote block for editorial opinions.',
    config: { w: 6, h: 3, minW: 4, minH: 1 },
    component: HouseViewBlock
  },
  NewCanon: {
    id: 'NewCanon',
    title: 'The New Canon',
    description: 'Small informational block.',
    config: { w: 4, h: 4, minW: 2, minH: 1 },
    component: NewCanonBlock
  },
  IdentitySystems: {
    id: 'IdentitySystems',
    title: 'Identity Systems',
    description: 'Medium-sized block with a mix of serif and sans-serif typography.',
    config: { w: 6, h: 3, minW: 4, minH: 1 },
    component: IdentitySystemsBlock
  },
  Image: {
    id: 'Image',
    title: 'Image Block',
    description: 'Full-bleed image block with optional caption.',
    config: { w: 4, h: 4, minW: 2, minH: 1 },
    component: ImageBlock
  },
  IndexList: {
    id: 'IndexList',
    title: 'Index List',
    description: 'Vertical list block for table of contents or features.',
    config: { w: 4, h: 4, minW: 2, minH: 1 },
    component: IndexListBlock
  },
  Quote: {
    id: 'Quote',
    title: 'Quote Block',
    description: 'Elegant serif quote block.',
    config: { w: 4, h: 2, minW: 2, minH: 1 },
    component: QuoteBlock
  },
  SectionHeader: {
    id: 'SectionHeader',
    title: 'Section Header',
    description: 'Full-width header for separating sections.',
    config: { w: 12, h: 2, minW: 12, maxW: 12, minH: 1 },
    component: SectionHeaderBlock
  },
  SyntheticEra: {
    id: 'SyntheticEra',
    title: 'Synthetic Era',
    description: 'Graphic block with bold typography.',
    config: { w: 6, h: 3, minW: 4, minH: 1 },
    component: SyntheticEraBlock
  },
  SmallArticle: {
    id: 'SmallArticle',
    title: 'Column Article',
    description: 'Standard column-style article with an image and text.',
    config: { w: 4, h: 4, minW: 2, minH: 1 },
    component: SmallArticleBlock
  },
  MassiveHeadline: {
    id: 'MassiveHeadline',
    title: 'Massive Headline',
    description: 'Full-width split block with enormous typography.',
    config: { w: 12, h: 4, minW: 12, maxW: 12, minH: 1 },
    component: MassiveHeadlineBlock
  },
  LatentSpace: {
    id: 'LatentSpace',
    title: 'Latent Space',
    description: 'Graphic block with large serif typography.',
    config: { w: 6, h: 3, minW: 4, minH: 1 },
    component: LatentSpaceBlock
  },
  SyntheticHallucination: {
    id: 'SyntheticHallucination',
    title: 'Synthetic Hallucination',
    description: 'Graphic block with an image and large typography.',
    config: { w: 6, h: 3, minW: 4, minH: 1 },
    component: SyntheticHallucinationBlock
  },
  LargeQuote: {
    id: 'LargeQuote',
    title: 'Large Quote',
    description: 'Full-width quote block with a circular image.',
    config: { w: 12, h: 4, minW: 8, minH: 1 },
    component: LargeQuoteBlock
  }
};
