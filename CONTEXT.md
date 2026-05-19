# CONTEXT.md

## Domain Glossary

### The Newsroom (The Newsroom Floor)
A comprehensive, modular workspace where editors direct AI agents.
*   **The News Terminal**: Ingests and clusters raw technical signals (The Wire).
*   **The Editorial Board**: Orchestrates debates, drafting, and surgical editing (The Bullpen).
*   **The Darkroom**: Produces visual assets and manages cultural resonance (The Atelier).
*   **The Printing Press**: Manages layout and post-publication feedback (Magazine View).

### Entities
*   **Mission**: A discrete, trackable editorial operation (e.g., "Drafting 'The Future of Rust'") that encapsulates agent activity, token telemetry, and outcome verification.
*   **TickerItem (Signal)**: A raw technical data point (from RSS, GitHub, etc.).
*   **Story (Cluster)**: A semantically grouped set of TickerItems.
*   **Draft**: A structured article composed of **DraftBlocks** and **DraftSentences**.
*   **MagazineItem**: A published artifact composed of content and public critiques.
*   **LayoutItem**: A coordinate-based grid definition (x, y, w, h) for a MagazineItem.
*   **Cultural Vector (Querverbindung)**: A philosophical/cultural link mapping tech to history/art.

### Agents
*   **The Scout**: Ingests signals and builds the Knowledge Graph.
*   **The Columnist**: Writes structured drafts from a Story.
*   **The Editor (KI-Linter)**: Performs surgical editing and narrative skeleton verification.
*   **The Photographer**: Visual Director for asset production.
*   **The Critic**: Provides provocative feedback (pre- and post-publication).
*   **The Archivist**: Extracts cultural grounding vectors.
