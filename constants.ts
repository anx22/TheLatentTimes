import { EditorialDepartment } from './types';

export interface BlockConfig {
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
}

export const EDITORIAL_LENSES: Record<EditorialDepartment, string> = {
  Fashion: "High-Fashion Editorial: Focus on aesthetics, trends, and cultural impact, using sophisticated and evocative language.",
  Cyber: "Accelerationist Tech: Focus on technical depth, future consequences, and radical innovation, using precise and bold language.",
  Academic: "Critical Analysis: Focus on historical context, rigorous argumentation, and theoretical frameworks, using scholarly and precise language."
};

export const DEFAULT_BLOCK_SIZES: Record<string, BlockConfig> = {};
export const INITIAL_LAYOUT: any[] = [];
