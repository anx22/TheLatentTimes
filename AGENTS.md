# Agent Map: The Newsroom Staff

## Overview
This project is an AI-native editorial engine ("Vogue meets Wired").
**Current Sprint**: [NOW.md](/NOW.md)

## The Editorial Chain
- **The Scout**: Signal discovery and targeted research.
- **The Board**: Agent debate and consensus logic.
- **The Columnist**: Narrative/Copy generation.
- **The Editor**: Linter and structural peer.
- **The Polisher**: Tone and consistency varnish.
- **The Photographer**: Asset development (Atelier).
- **The Designer**: Strategic layout and grid orchestration.

## Service Map
- `/services/agents`: Core LLM logic for specific personas.
- `/services/editorial`: Orchestration of the draft/debate cycle.
- `/services/visual`: Art direction and asset processing.
- `/services/mission`: Lifecycle, telemetry, and observability.

## Standardized Agent Skills (Installed)
- **`convex-database`** (`/skills/custom_skills/convex-database/SKILL.md`): Hardened rules against silent Convex action failures and missing environment variables detection.
- **`grid-geometry`** (`/skills/custom_skills/grid-geometry/SKILL.md`): Rules governing 2D responsive grid matrices, aspect ratios, and preventing structural layout overlaps in React-Grid-Layout based systems.
- **`llm-orchestration`** (`/skills/custom_skills/llm-orchestration/SKILL.md`): Hard error boundaries, rigid model aliasing policies (e.g., Gemini Flash), and observability patterns for autonomous agents like 'The Board'.
- **`data-ingestion`** (`/skills/custom_skills/data-ingestion/SKILL.md`): Best practices for robust external fetching (RSS/scrapes), handling transient network closures, and data sanitization prior to DB writes.

## Routing
- Feature task -> read [PRODUCT.md](/PRODUCT.md) + [NOW.md](/NOW.md)
- Architecture task -> read [ARCHITECTURE.md](/ARCHITECTURE.md) + [NOW.md](/NOW.md)
- Structural question -> read [DECISIONS.md](/DECISIONS.md)
