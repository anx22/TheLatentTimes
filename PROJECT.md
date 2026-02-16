
# MODUS: Project Architecture v3.0

**Mission:** An autonomous, self-assembling luxury editorial engine. It ingests live signals from the open web and renders them into a strict "Swiss Grid" layout.

## 1. Core Axioms (v3.0)
- **The Grid is Absolute**: Every pixel aligns to a 12-column rigid grid. No floating elements unless specific "Chaos Moves".
- **Content is Data**: Stories, Tickers, and Manifestos are abstract data objects (`MagazineItem`) injected into `Blocks`.
- **Typography is Voice**: 
  - **Hero**: *Archivo Narrow* (Condensed, Uppercase, Tight).
  - **Body**: *Inter* (Clean, Swiss).
  - **Accent**: *Playfair Display* (Italic only).
- **The Wire is Live**: We do not fake data. We ingest real-time RSS feeds and Semantic Search results to construct the issue.

## 2. Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS.
- **Layout Engine**: Custom 12-col grid mapper (`LayoutEngine.tsx`).
- **Ingestion**: 
  - **RSS**: `rss2json` proxy for deterministic signal monitoring (`services/rss.ts`).
  - **Search**: Google Search Grounding (Gemini 3 Flash) for query expansion.
- **State**: `useNewsroom` (Agent Orchestration) + Supabase (Persistence).
- **Intelligence**: Gemini 1.5 Pro (Reasoning) + Flash (Speed/Scanning).

## 3. Data Model (The Assembler)
1.  **Issue**: The container. Holds `Meta` and `Sections`.
2.  **Section**: A horizontal slice of the page. Contains `Blocks`.
3.  **Block**: The atomic UI unit (e.g., `HeroTypePlate`, `Ticker`).
4.  **Binding**: Blocks request data (e.g., "Get top 3 features") or bind to specific `MagazineItems`.

## 4. Directory Structure
- `/components/layout`: The Grid Engine (`LayoutEngine`, `SectionGrid`).
- `/components/blocks`: Atomic UI components (`Hero`, `Ticker`, `Manifesto`).
- `/components/newsroom`: The Operator Console (Split into `ContentMode` and `LayoutMode`).
- `/services/agents`: AI logic (Scout, Critic, Writer, Designer).
- `/services/rss.ts`: The Live Wire feed registry.
