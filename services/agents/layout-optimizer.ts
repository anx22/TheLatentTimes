
import { Type } from "@google/genai";
import { Section, PageTemplate } from "../../types";
import { safeGenerateContent, cleanAndParseJSON } from "../gemini";

interface LayoutVariant {
    name: string;
    rationale: string;
    sections: Section[];
}

export const agentLayoutOptimizer = async (
    currentSections: Section[], 
    intent: string = "Create a more dynamic rhythm."
): Promise<LayoutVariant[]> => {
    
    // Simplify input to save tokens, we only need structure
    const structuralContext = currentSections.map(s => ({
        id: s.id,
        layout_mode: s.layout_mode,
        blocks: s.blocks.map(b => ({
            id: b.id,
            type: b.block_type,
            span: b.col_span,
            variant: b.variant,
            binding: b.data_binding.source // We want to preserve bindings
        }))
    }));

    const response = await safeGenerateContent({
        model: "gemini-3-flash-preview",
        contents: `Act as a SWISS GRID SYSTEM DESIGNER. 
        
        TASK: Remix the following page sections to create 2 distinct layout variations based on this intent: "${intent}".
        
        INPUT STRUCTURE:
        ${JSON.stringify(structuralContext)}
        
        CONSTRAINTS:
        1. RESPECT THE GRID: Total col_span per row must be 12.
        2. PRESERVE BINDINGS: Keep the 'data_binding' logic (source/query) intact, but you can change the 'block_type' and 'variant' to fit the new layout.
        3. BLOCK PALETTE: Use these block types: 'HeroTypePlate', 'FeatureCard', 'FeatureTriptych', 'TeaserIndexRail', 'QuotePlate', 'BlackManifestoPanel'.
        
        VARIATION 1: "Editorial" (Large images, white space, big typography).
        VARIATION 2: "Dense" (Information heavy, rails, lists).

        Return JSON array of variants.
        `,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        rationale: { type: Type.STRING },
                        sections: { 
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING },
                                    order: { type: Type.NUMBER },
                                    layout_mode: { type: Type.STRING, enum: ['grid_12', 'grid_12_dense', 'flex_row', 'fixed_height'] },
                                    className: { type: Type.STRING },
                                    blocks: {
                                        type: Type.ARRAY,
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                id: { type: Type.STRING },
                                                block_type: { type: Type.STRING },
                                                col_span: { type: Type.NUMBER },
                                                row_span: { type: Type.NUMBER },
                                                variant: { type: Type.STRING, enum: ['S', 'M', 'L', 'XL'] },
                                                chaos_type: { type: Type.STRING, enum: ['none', 'breakout_left', 'breakout_right', 'overlap_badge', 'tilt_hover'] },
                                                data_binding: {
                                                    type: Type.OBJECT,
                                                    properties: {
                                                        source: { type: Type.STRING, enum: ['static', 'query', 'pinned'] },
                                                        query_tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                                                        query_limit: { type: Type.NUMBER },
                                                        pinned_item_id: { type: Type.STRING }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    const raw = cleanAndParseJSON(response.text);
    return raw || [];
};
