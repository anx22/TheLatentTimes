
# DECISIONS.md

## 009 - Hybrid Signal Ingestion (The Live Wire)
**Problem**: Pure LLM-based search is expensive, slow, and can miss "breaking" updates from specific high-trust niches (e.g., specific Substack feeds or TechCrunch).
**Decision**: Implement a **Hybrid Ingestion Model**.
1.  **Deterministic Layer (RSS)**: A hardcoded `FEED_REGISTRY` of high-signal sources (Wired, 404 Media, Arxiv) polled via a CORS proxy. This provides the "Baseline Hum" of the newsroom.
2.  **Agentic Layer (Search)**: Gemini-driven query expansion for specific topics ("Agentic Patterns") to find signals *outside* the registry.
**Why**: Reduces hallucination risk, ensures coverage of trusted domains, and lowers the "Time to Signal" for breaking news.

## 008 - Tactile Layout Binding
**Problem**: Assigning content to layout slots via dropdowns or ID pasting is tedious and breaks flow.
**Decision**: Implement native HTML5 Drag-and-Drop.
- **Source**: Asset Pool cards (`draggable=true`).
- **Payload**: `itemId` string.
- **Target**: Block wrapper in `LayoutEngine`.
- **Feedback**: Visual highlight (Emerald Ring) on valid drop targets.
**Why**: Aligns with the "Editor's Desk" metaphor. Makes the layout process feel like physical collage.

## 007 - Separation of Church and State (Content vs Layout)
**Problem**: Trying to "write" the news and "design" the page in the same view created cognitive overload and UI clutter.
**Decision**: Split the Newsroom into two distinct modes:
1.  **Content Mode**: For gathering signals, writing copy, and editorial approval.
2.  **Layout Mode**: For binding assets to slots, managing the grid, and art direction.
**Why**: Allows for specialized UI (e.g., Asset Pool vs. Agent Console) and mirrors real-world editorial workflows (Editor vs. Art Director).

## 006 - The Layout Engine (v3.0)
**Problem**: Hardcoded React components (`CoverStory.tsx`, `TheEdit.tsx`) made it impossible for AI Agents to "design" the page. The magazine was static structure with dynamic text.
**Decision**: 
- Adopt a **Headless CMS Pattern** where the "Page" is a JSON array of `BlockInstances`.
- Create a `LayoutEngine` component that maps `block_type` strings to React components.
- **Why**: Allows the "Editor Agent" to move sections, change layouts, and invent new page structures without code changes.

## 005 - Tone Physics vs. Presets (v4.3 Legacy)
**Problem**: "Gonzo" or "Academic" presets were too rigid.
**Decision**: Replaced with **Tone EQ** sliders.

## 004 - The Glass Box Principle
**Decision**: Expose raw agent logs and JSON data to the user to build trust.
