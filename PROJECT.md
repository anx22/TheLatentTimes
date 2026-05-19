# The Latent Times: The AI-Native Fashion Magazine

## Vision
The Latent Times is a living, breathing organism powered by a symphony of AI agents. **AI Technology is our absolute foundation.** We track the bleeding edge of models, workflows, and code. Side sectors like fashion, culture, and social issues are "add-ons" or "lenses" through which we view this technological core. It is "Vogue meets Wired meets The Matrix."

## The Newsroom (The Newsroom Floor)
The heart of The Latent Times is **The Newsroom Floor**, a comprehensive, simultaneously visible workspace where human editors direct a fleet of AI agents. It is a professional tool designed for dynamic interaction, debate, and critical editing. The interface is modular, with a central workspace that switches between departments while maintaining a persistent operational context.

### The Departments & Agents
The newsroom is divided into operational departments, staffed by specialized agents:

1.  **THE NEWS TERMINAL (Intelligent News Engine)**: 
    *   **Source Management**: Tracking of specific feeds, APIs, and webhooks with `last_fetched` cutoffs to prevent redundant crawling.
    *   **Vector Clustering (The Ticker)**: Incoming news is embedded via Gemini and clustered into "Stories" based on semantic similarity. Deduplication happens automatically.
    *   **Auto-Scout (Active)**: AI-driven exploration of broad tech trends to discover new sources.
    *   **Targeted Search (Specific)**: Deep-dive research into a user-provided query.
    *   *Agent*: **The Scout** (Interfacing with global data streams and managing the Knowledge Graph).
2.  **THE EDITORIAL BOARD (Ideation, Debate, Drafting & Critique)**:
    *   **Fusion of Angles & Drafts**: This room is the "Gold Mine". It combines the source news, the debated angles (Lenses), and the resulting first article.
    *   **Critical Analysis**: Agents critically engage with the source material. We need confidence levels, fact-checking, and correct categorization.
    *   **Story Transformation**: Here, raw material is transformed into a story idea using parameters and professional agent assessments.
    *   **Granular Collaboration**: Drafts are structured entities (blocks/paragraphs/sentences), allowing for micro-actions (Rewrite, Expand) rather than full-document regeneration.
    *   **Editorial Excellence Module**: A surgical editing engine that enables sentence-level annotations, multi-agent critiques, and contextual rewrites that maintain global narrative coherence.
    *   **Cultural Grounding Engine**: Automated extraction of philosophical and cultural "vectors" (Querverbindungen) from technical signals to add depth and historical context.
    *   *Agents*: **The Editor** (Lead), **The Critic** (Provocateur), **The Trendsetter** (Fashion Lens), **The Columnist** (Writer), **The Archivist** (Cultural Grounding).
3.  **THE DARKROOM (Art & Production)**:
    *   Generates high-fidelity visual assets based on the editorial context and "Mood Board" cultural vectors.
    *   *Agent*: **The Photographer** (Visual Director).
4.  **THE PRINTING PRESS (Publishing & Feedback)**:
    *   Final review and assembly of the artifact into the dynamic grid.
    *   **The Critic's Corner**: Post-publication AI peer review sidebar for readers.
    *   **Technology**: `react-grid-layout` with native handles for drag-and-drop editorial control.

### The Workflow (The Editorial Chain)
The Newsroom Floor operates as a **Deep Pipeline** managed by core services:
1.  **Signal Broker**: Manages a fleet of adapters (RSS, GitHub) and handles normalization/embeddings.
2.  **Editorial Orchestrator**: Manages debate cycles (`conductDebate`) and structured drafting (`produceDraft`).
3.  **Atelier Engine**: Orchestrates visual identity extraction and high-fidelity asset production (`developAsset`).
4.  **Refinement**: The user triggers surgical micro-actions on structured blocks.
5.  **Distribution**: Push to `The Printing Press` for layout and post-publication feedback.

### Observability
*   **Mission Threads**: Every editorial run is assigned a `missionId`, which groups all agent "Chatter" (logs) and intermediate artifacts for auditability.

## Architecture (v2.2.0)
The system operates as a **Deep Multi-Agent Coordination Engine** with a unidirectional data flow and strict state ownership.

### 1. Domain-Driven Seams (The Hooks)
The frontend is built on specialized domain hooks that provide **leverage** to the UI while hiding implementation complexity:
*   `useNewsroomData`: Canonical write-paths to Convex.
*   `useEditorialAgents`: High-leverage agent coordination (Debate, Pipeline).
*   `useVisualAgents`: Atelier-led visual production.
*   `usePublicationFlow`: Final assembly and grid-layout synthesis.

### 2. Deep Services (The Core)
*   **Signal Broker**: Normalizes external signals via adapters (`RSSAdapter`, `GitHubAdapter`).
*   **Mission Registry**: Manages terminal-level execution runs with built-in telemetry and error-recovery logic.
*   **Editorial Orchestrator**: Manages multi-agent debate and structured drafting.
*   **Atelier Engine**: Centralized visual strategy and asset development.

### 3. The Front Page (The Latent Grid)
*   **Technology**: `react-grid-layout` driven by `agentLayoutDesigner`.
*   **State**: Layouts are persisted in the `issues` table; AI suggests placements during the publishing phase.

### 4. Digital Experiences
*   **Critics Corner**: Conversational rebuttal system for human-AI editorial debate.

## Design Philosophy
-   **Aesthetic**: Brutalist, High-Contrast, Swiss Style, Terminal-Chic.
-   **Interaction**: Fast, Keyboard-centric, "God Mode", Granular Control.
-   **Tone**: Intellectual, Ai Visionary, Disruptive, .
