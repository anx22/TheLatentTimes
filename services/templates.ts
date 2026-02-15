
import { PageTemplate } from '../types';

// TEMPLATE T1: COVER RAIL (The Default)
// - Balanced Hero
// - Good for general news mix
export const T1_CoverRail: PageTemplate = {
  key: 'T1_CoverRail',
  name: 'Cover Rail',
  description: 'Standard editorial balance. Large Hero with side rail for density.',
  sections: [
    {
      id: 'sec_chrome',
      order: 0,
      layout_mode: 'flex_row',
      className: 'mb-0 pb-0 gap-y-0',
      blocks: [
        { id: 'b_masthead', block_type: 'MastheadLane', col_span: 12, variant: 'M', data_binding: { source: 'static' } },
        { id: 'b_ticker', block_type: 'TopicTicker', col_span: 12, variant: 'S', data_binding: { source: 'query', query_tags: ['system'] } }
      ]
    },
    {
      id: 'sec_hero_split',
      order: 1,
      layout_mode: 'grid_12',
      className: '', // REMOVED PADDING AND MIN-HEIGHT
      blocks: [
        { id: 'b_hero', block_type: 'HeroTypePlate', col_span: 8, variant: 'L', data_binding: { source: 'pinned' } },
        { id: 'b_rail', block_type: 'TeaserIndexRail', col_span: 4, variant: 'M', data_binding: { source: 'query', query_limit: 5, query_tags: ['Culture', 'Engineering'] } }
      ]
    },
    {
      id: 'sec_stats',
      order: 2,
      layout_mode: 'grid_12',
      className: 'py-0',
      blocks: [
        { id: 'b_stats', block_type: 'StatsStrip', col_span: 12, variant: 'S', data_binding: { source: 'static' } }
      ]
    },
    {
      id: 'sec_body',
      order: 3,
      layout_mode: 'grid_12',
      blocks: [
        { id: 'b_manifesto', block_type: 'BlackManifestoPanel', col_span: 4, variant: 'M', data_binding: { source: 'static', static_content: { label: "MISSION", text: "We build the machine that builds the magazine." } } },
        { id: 'b_feature_1', block_type: 'FeatureCard', col_span: 4, variant: 'M', chaos_type: 'tilt_hover', data_binding: { source: 'query', query_tags: ['Theory', 'Engineering'], query_limit: 1 } },
        { id: 'b_feature_2', block_type: 'FeatureCard', col_span: 4, variant: 'M', chaos_type: 'overlap_badge', data_binding: { source: 'query', query_tags: ['Culture', 'Art'], query_limit: 1 } },
      ]
    },
    {
      id: 'sec_triptych',
      order: 4,
      layout_mode: 'grid_12',
      blocks: [
        { id: 'b_triptych', block_type: 'FeatureTriptych', col_span: 12, variant: 'L', data_binding: { source: 'query', query_tags: ['Engineering', 'Future', 'Science'], query_limit: 3 } }
      ]
    },
    {
        id: 'sec_footer',
        order: 5,
        layout_mode: 'grid_12',
        blocks: [
            { id: 'b_micro', block_type: 'MicroIndex', col_span: 12, variant: 'S', data_binding: { source: 'query', query_limit: 8 } }
        ]
    }
  ]
};

// TEMPLATE T2: INDEX AS HERO
// - Information Dense
// - No large hero image, just massive typography and lists
export const T2_IndexAsHero: PageTemplate = {
    key: 'T2_IndexAsHero',
    name: 'Index Hero',
    description: 'Information dense. Typography heavy. No large cover image.',
    sections: [
        {
            id: 'sec_chrome',
            order: 0,
            layout_mode: 'flex_row',
            className: 'mb-0 pb-0 gap-y-0',
            blocks: [
                { id: 'b_masthead', block_type: 'MastheadLane', col_span: 12, variant: 'M', data_binding: { source: 'static' } },
            ]
        },
        {
            id: 'sec_index_hero',
            order: 1,
            layout_mode: 'grid_12',
            className: '', // REMOVED PADDING
            blocks: [
                { id: 'b_hero_txt', block_type: 'QuotePlate', col_span: 8, variant: 'L', data_binding: { source: 'pinned' } }, // Using QuotePlate as text hero
                { id: 'b_rail_wide', block_type: 'TeaserIndexRail', col_span: 4, variant: 'L', data_binding: { source: 'query', query_limit: 8 } }
            ]
        },
        {
            id: 'sec_cols',
            order: 2,
            layout_mode: 'grid_12',
            blocks: [
                { id: 'b_col_1', block_type: 'CategoryColumn', col_span: 4, variant: 'M', data_binding: { source: 'query', query_tags: ['Engineering'], query_limit: 5 } },
                { id: 'b_col_2', block_type: 'CategoryColumn', col_span: 4, variant: 'M', data_binding: { source: 'query', query_tags: ['Culture'], query_limit: 5 } },
                { id: 'b_col_3', block_type: 'CategoryColumn', col_span: 4, variant: 'M', data_binding: { source: 'query', query_tags: ['Science'], query_limit: 5 } }
            ]
        },
        {
            id: 'sec_bottom',
            order: 3,
            layout_mode: 'grid_12',
            blocks: [
                { id: 'b_manifesto', block_type: 'BlackManifestoPanel', col_span: 8, variant: 'M', data_binding: { source: 'static', static_content: { label: "INDEX", text: "Full Archive Retrieval." } } },
                { id: 'b_cta', block_type: 'KitFeatureCTA', col_span: 4, variant: 'S', data_binding: { source: 'static' } }
            ]
        },
        {
            id: 'sec_footer',
            order: 4,
            layout_mode: 'grid_12',
            blocks: [
                { id: 'b_stats', block_type: 'StatsStrip', col_span: 12, variant: 'S', data_binding: { source: 'static' } }
            ]
        }
    ]
};

// TEMPLATE T3: MANIFESTO HEAVY
// - Aggressive, Brutalist
// - Starts with black panel
export const T3_ManifestoHeavy: PageTemplate = {
    key: 'T3_ManifestoHeavy',
    name: 'Manifesto Heavy',
    description: 'Aggressive start. Dark mode header. Brutalist layout.',
    sections: [
        {
            id: 'sec_intro',
            order: 0,
            layout_mode: 'grid_12',
            className: 'pt-0 pb-0 bg-black text-white', // REMOVED MIN-HEIGHT
            blocks: [
                { id: 'b_masthead_inv', block_type: 'MastheadLane', col_span: 12, variant: 'M', data_binding: { source: 'static' } },
                { id: 'b_manifesto_xl', block_type: 'BlackManifestoPanel', col_span: 8, variant: 'XL', data_binding: { source: 'static', static_content: { label: "URGENT", text: "The signal is the only thing that matters." } } },
                { id: 'b_rail_inv', block_type: 'TeaserIndexRail', col_span: 4, variant: 'M', chaos_type: 'breakout_right', data_binding: { source: 'query', query_limit: 4 } }
            ]
        },
        {
            id: 'sec_hero_img',
            order: 1,
            layout_mode: 'grid_12',
            className: '', // REMOVED PADDING
            blocks: [
                { id: 'b_hero_img', block_type: 'HeroTypePlate', col_span: 12, variant: 'L', data_binding: { source: 'pinned' } }
            ]
        },
        {
            id: 'sec_features',
            order: 2,
            layout_mode: 'grid_12',
            blocks: [
                { id: 'b_triptych', block_type: 'FeatureTriptych', col_span: 12, variant: 'L', data_binding: { source: 'query', query_limit: 3 } }
            ]
        },
        {
            id: 'sec_mix',
            order: 3,
            layout_mode: 'grid_12',
            blocks: [
                { id: 'b_quote', block_type: 'QuotePlate', col_span: 6, variant: 'M', data_binding: { source: 'static' } },
                { id: 'b_cta', block_type: 'KitFeatureCTA', col_span: 6, variant: 'M', chaos_type: 'overlap_badge', data_binding: { source: 'query', query_tags: ['Engineering'] } }
            ]
        },
        {
            id: 'sec_footer',
            order: 4,
            layout_mode: 'grid_12',
            blocks: [
                { id: 'b_micro', block_type: 'MicroIndex', col_span: 8, variant: 'S', data_binding: { source: 'query' } },
                { id: 'b_stats', block_type: 'StatsStrip', col_span: 4, variant: 'S', data_binding: { source: 'static' } }
            ]
        }
    ]
};

export const TEMPLATE_REGISTRY: Record<string, PageTemplate> = {
    'T1_CoverRail': T1_CoverRail,
    'T2_IndexAsHero': T2_IndexAsHero,
    'T3_ManifestoHeavy': T3_ManifestoHeavy
};
