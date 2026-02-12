
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

    const pool = context.items || [];

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
                item.tags.some(tag => binding.query_tags?.includes(tag))
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
