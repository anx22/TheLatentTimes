import { BlockTemplate } from '../types';
import { TEMPLATES } from './registry';

export const BLOCK_TEMPLATES: BlockTemplate[] = Object.values(TEMPLATES);

export const BLOCK_REGISTRY = BLOCK_TEMPLATES.reduce((acc, template) => {
  acc[template.id] = template;
  return acc;
}, {} as Record<string, BlockTemplate>);

export const DEFAULT_BLOCK_SIZES = BLOCK_TEMPLATES.reduce((acc, template) => {
  acc[template.id] = template.config;
  return acc;
}, {} as Record<string, any>);
