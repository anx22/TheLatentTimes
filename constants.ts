export interface BlockConfig {
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
}

export const DEFAULT_BLOCK_SIZES: Record<string, BlockConfig> = {};
export const INITIAL_LAYOUT: any[] = [];
