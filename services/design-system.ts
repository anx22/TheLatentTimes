
import { BlockType } from '../types';

export interface BlockDefinition {
    type: BlockType;
    description: string;
    variants: string[];
    constraints: {
        max_headline_chars: number;
        max_deck_chars: number;
        requires_image: boolean;
        recommended_tone: string;
    };
    suitable_for: string[]; // 'COVER', 'FEATURE', 'LIST', 'DATA'
}

export const DESIGN_SYSTEM: Record<string, BlockDefinition> = {
    'HeroTypePlate': {
        type: 'HeroTypePlate',
        description: "Massive, screen-dominating typography. No image. Pure statement.",
        variants: ['S', 'M', 'L'],
        constraints: {
            max_headline_chars: 40,
            max_deck_chars: 0,
            requires_image: false,
            recommended_tone: "Manifesto, Urgent, Cryptic"
        },
        suitable_for: ['COVER', 'MANIFESTO', 'SECTION_HEADER']
    },
    'MastheadLane': {
        type: 'MastheadLane',
        description: "Horizontal strip for the latest big drop or breaking news.",
        variants: ['M'],
        constraints: {
            max_headline_chars: 60,
            max_deck_chars: 0,
            requires_image: false,
            recommended_tone: "Newsworthy, Direct"
        },
        suitable_for: ['HEADER', 'BREAKING']
    },
    'FeatureCard': {
        type: 'FeatureCard',
        description: "Standard editorial card with optional image and metadata.",
        variants: ['S', 'M', 'L'],
        constraints: {
            max_headline_chars: 80,
            max_deck_chars: 120,
            requires_image: false, 
            recommended_tone: "Editorial, Informative"
        },
        suitable_for: ['FEATURE', 'COLUMN']
    },
    'FeatureTriptych': {
        type: 'FeatureTriptych',
        description: "Three vertical slots for visual-heavy features.",
        variants: ['L'],
        constraints: {
            max_headline_chars: 50,
            max_deck_chars: 100,
            requires_image: true,
            recommended_tone: "Visual, Aesthetic"
        },
        suitable_for: ['GALLERY', 'FEATURE_SET']
    },
    'TopicTicker': {
        type: 'TopicTicker',
        description: "Scrolling marquee of short data points or breaking headlines.",
        variants: ['S', 'M'], // S = Light, M = Dark
        constraints: {
            max_headline_chars: 25,
            max_deck_chars: 0,
            requires_image: false,
            recommended_tone: "Telegraphic, Data-driven"
        },
        suitable_for: ['DATA', 'TICKER']
    },
    'BlackManifestoPanel': {
        type: 'BlackManifestoPanel',
        description: "Solid black block for high-contrast statements or index definitions.",
        variants: ['M', 'L', 'XL'],
        constraints: {
            max_headline_chars: 30,
            max_deck_chars: 200,
            requires_image: false,
            recommended_tone: "Philosophical, Abstract"
        },
        suitable_for: ['MANIFESTO', 'INDEX_HEADER']
    },
    'TeaserIndexRail': {
        type: 'TeaserIndexRail',
        description: "A numbered list of headlines. High density.",
        variants: ['M', 'L'],
        constraints: {
            max_headline_chars: 60,
            max_deck_chars: 0,
            requires_image: false,
            recommended_tone: "Listicle, Archive"
        },
        suitable_for: ['LIST', 'ARCHIVE']
    },
    'QuotePlate': {
        type: 'QuotePlate',
        description: "Large pull-quote with attribution.",
        variants: ['M', 'L'],
        constraints: {
            max_headline_chars: 120,
            max_deck_chars: 30,
            requires_image: false,
            recommended_tone: "Voice, Opinion"
        },
        suitable_for: ['QUOTE', 'OPINION']
    },
    'StatsStrip': {
        type: 'StatsStrip',
        description: "Data metrics row.",
        variants: ['S'],
        constraints: {
            max_headline_chars: 10,
            max_deck_chars: 0,
            requires_image: false,
            recommended_tone: "Numeric"
        },
        suitable_for: ['DATA']
    }
};

export const getConstraintsFor = (blockType: string) => {
    return DESIGN_SYSTEM[blockType]?.constraints || {
        max_headline_chars: 100,
        max_deck_chars: 200,
        requires_image: false,
        recommended_tone: "Neutral"
    };
};
