import React from 'react';

export interface BlockConfig {
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
}

export interface BlockTemplate {
  id: string;
  title: string;
  description: string;
  config: BlockConfig;
  component: React.FC<any>;
}
