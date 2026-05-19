import { BlockTemplate } from '../types';
import { CoverStoryTemplate } from './CoverStory';
import { GlamourTemplate } from './Glamour';
import { ImageTemplate } from './Image';
import { QuoteTemplate } from './Quote';
import { SectionHeaderTemplate } from './SectionHeader';
import { NewCanonTemplate } from './NewCanon';
import { IdentitySystemsTemplate } from './IdentitySystems';
import { SyntheticEraTemplate } from './SyntheticEra';
import { HouseViewTemplate } from './HouseView';
import { CuratorsDilemmaTemplate } from './CuratorsDilemma';
import { SmallArticleTemplate } from './SmallArticle';
import { MassiveHeadlineTemplate } from './MassiveHeadline';
import { HookFactoryTemplate } from './HookFactory';
import { LatentSpaceTemplate } from './LatentSpace';
import { SyntheticHallucinationTemplate } from './SyntheticHallucination';
import { IndexListTemplate } from './IndexList';

import { LargeQuoteTemplate } from './LargeQuote';

export const BLOCK_TEMPLATES: BlockTemplate[] = [
  CoverStoryTemplate,
  GlamourTemplate,
  ImageTemplate,
  QuoteTemplate,
  SectionHeaderTemplate,
  NewCanonTemplate,
  IdentitySystemsTemplate,
  SyntheticEraTemplate,
  HouseViewTemplate,
  CuratorsDilemmaTemplate,
  SmallArticleTemplate,
  MassiveHeadlineTemplate,
  HookFactoryTemplate,
  LatentSpaceTemplate,
  SyntheticHallucinationTemplate,
  IndexListTemplate,
  LargeQuoteTemplate,
];

export const BLOCK_REGISTRY = BLOCK_TEMPLATES.reduce((acc, template) => {
  acc[template.id] = template;
  return acc;
}, {} as Record<string, BlockTemplate>);

export const DEFAULT_BLOCK_SIZES = BLOCK_TEMPLATES.reduce((acc, template) => {
  acc[template.id] = template.config;
  return acc;
}, {} as Record<string, any>);
