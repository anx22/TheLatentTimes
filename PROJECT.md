# MODUS: The AI-Native Fashion Magazine

## Vision
MODUS is a living, breathing organism powered by a symphony of AI agents. **AI Technology is our absolute foundation.** We track the bleeding edge of models, workflows, and code. Side sectors like fashion, culture, and social issues are "add-ons" or "lenses" through which we view this technological core. It is "Vogue meets Wired meets The Matrix."

## The Newsroom (The Newsroom Floor)
The heart of MODUS is **The Newsroom Floor**, a comprehensive, simultaneously visible workspace where human editors direct a fleet of AI agents. It is a professional tool designed for dynamic interaction, debate, and critical editing. The interface is modular, with a central workspace that switches between departments while maintaining a persistent operational context.

### The Departments & Agents
The newsroom is divided into operational departments, staffed by specialized agents:

1.  **THE WIRE (Ingestion & Scouting)**: 
    *   **The Ticker (Passive)**: Zero-token aggregation of real-world sources (GitHub, RSS). Managed via a user-installable Source Management Panel.
    *   **Auto-Scout (Active)**: AI-driven exploration of broad tech trends.
    *   **Targeted Search (Specific)**: Deep-dive research into a user-provided query.
    *   *Agent*: **The Scout** (Interfacing with global data streams).
2.  **THE BULLPEN (Ideation, Debate & Drafting)**:
    *   Agents with polarizing personas debate the signal, applying the "Cultural/Fashion Lens" to the "Tech Foundation".
    *   **Granular Collaboration**: Drafts are structured entities (blocks/paragraphs), allowing for micro-actions (Rewrite, Expand) rather than full-document regeneration.
    *   *Agent*: **The Columnist** (Lead Writer - synthesizes vectors and data).
    *   *Agent*: **The Editor** (KI-Linter - analyzes text blocks for tone, clarity, and facts, providing actionable annotations).
3.  **THE DARKROOM (Art & Production)**:
    *   Generates high-fidelity visual assets based on the editorial context.
    *   *Agent*: **The Photographer** (Visual Director - develops latent space artifacts).
4.  **THE PRESS (Publishing)**:
    *   Final review and assembly of the artifact into the dynamic grid.

### The Workflow (The Editorial Chain)
1.  **The Wire**: The Scout identifies a hard tech signal (e.g., "New ComfyUI Workflow").
2.  **The Bullpen (Debate)**: The Board generates distinct angles (Lenses).
3.  **The Bullpen (Drafting)**: The Columnist writes the copy as structured blocks.
4.  **The Bullpen (Editing)**: The Editor (KI-Linter) flags blocks; the user triggers micro-actions to refine the text.
5.  **The Darkroom**: The Photographer creates the imagery.
6.  **The Press**: The artifact is reviewed and pushed to the live magazine.

## Architecture
-   **Frontend**: React + Tailwind (The Interface).
-   **Brain**: Google Gemini (The Intelligence).
-   **State**: LocalStorage (MVP) -> Supabase (Production).
-   **Orchestration**: Event-driven, entity-based state management (Drafts as block arrays) replacing linear pipelines.

## Design Philosophy
-   **Aesthetic**: Brutalist, High-Contrast, Swiss Style, Terminal-Chic.
-   **Interaction**: Fast, Keyboard-centric, "God Mode", Granular Control.
-   **Tone**: Intellectual, Accelerationist, Haughty but Insightful.
