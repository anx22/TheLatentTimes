
import { BlockInstance, IssueContent, MagazineItem } from '../../types';

export interface ResolvedData {
    item?: MagazineItem;
    staticContent?: any;
    items?: MagazineItem[]; // For lists
    label?: string;
}

/**
 * Resolves the data for a block based on its binding configuration.
 * Handles:
 * - 'static': Returns the config object directly.
 * - 'pinned': Finds an item by ID.
 * - 'query': Filters items by tags/recency.
 */
export const resolveBinding = (block: BlockInstance, context: IssueContent): ResolvedData => {
    const binding = block.data_binding;
    
    // 1. Static Content
    if (binding.source === 'static') {
        return { staticContent: binding.static_content };
    }

    // CONSOLIDATE CONTENT POOLS
    // We strictly map all source types (Stories, Drops) to the standardized MagazineItem interface
    // to ensure Block components (which expect .title and .dek) receive the correct properties.
    
    const coverItem: MagazineItem | null = context.cover.title ? {
        id: 'cover_story', // Synthetic ID for the active cover
        title: context.cover.title,
        dek: context.cover.deck,
        published_at: new Date().toISOString(),
        tags: ['Cover', 'Feature'],
        media_type: 'image',
        hero_image_url: context.cover.img_base64,
        status: 'published',
        featured_level: 'hero'
    } : null;

    const pool: MagazineItem[] = [
        ...(coverItem ? [coverItem] : []),
        ...(context.items || []),
        ...context.features.map(f => ({ 
            ...f, 
            title: f.headline, 
            dek: f.deck,
            tags: [f.category, f.topic], 
            media_type: f.media_type || 'text' 
        } as any)),
        ...context.columns.map(c => ({ 
            ...c, 
            title: c.headline, 
            dek: c.deck,
            tags: [c.category, 'Opinion'], 
            media_type: 'text' 
        } as any)),
        ...context.drops.map(d => ({ 
            ...d, 
            tags: [d.category, 'Short'], 
            title: d.headline, 
            dek: d.body, 
            media_type: 'text' 
        } as any))
    ];

    // 2. Pinned Item
    if (binding.source === 'pinned' && binding.pinned_item_id) {
        const item = pool.find(i => i.id === binding.pinned_item_id);
        return { item };
    }

    // 3. Query
    if (binding.source === 'query') {
        let results = [...pool];

        // Filter by Tag
        if (binding.query_tags && binding.query_tags.length > 0) {
            results = results.filter(item => 
                item.tags?.some(tag => binding.query_tags?.includes(tag))
            );
        }

        // Apply Limit
        const limit = binding.query_limit || 1;
        const sliced = results.slice(0, limit);

        if (limit === 1) {
            return { item: sliced[0] };
        } else {
            return { items: sliced };
        }
    }

    return {};
};
