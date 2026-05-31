# Deep Discovery: Modular Editorial Methodologies

The overarching problem with the current `Ticker -> Cluster -> Story` pipeline is its rigidity. The engine currently forces signals into automated "Clusters" and transitions them straight into overarching Drafts without allowing the Editor to change the workflow.

To resolve this, we are introducing **Choosable Methodologies**. The UI and backend will be modularly structured to allow the user to select from *different explicit workflows* for signal processing, curation, and story generation.

## The First Room: The Methodology Switchboard

In the first editorial room, the user will have a selector to choose their active **Methodology**. This choice completely changes the UI layout and semantic logic flow of that room.

### Methodology 1: The Three-Zone Logic (Manual Steerability)
A highly manual, steerable pipeline divided into three explicit physical boundaries for triage, semantic grooming, and editorial production.

#### ZONE 1: The Signal Mosaic (Curation & Selection)
* **The Feed**: A visually dense, mosaic-style grid of individual raw `Signals` that have already passed high-quality filters (e.g., a high innovation or anomaly score).
* **Interaction**: The user explicitly curates the feed, selecting/toggling 3 to N specific signals to form a "working semantic pool".

#### ZONE 2: The Semantic Workbench (Context & Influence)
* **Action (Execute)**: The selected signals from Zone 1 are pushed into this staging ground.
* **The Breakdown**: Instead of immediately generating a full article, the system generates **modular components: "Story Angles" or "Sub-Article Prompts"** (e.g., *Angle A: Tech Focus*, *Angle B: Culture Focus*).
* **Influence & Steerability**: The user can inject context ("Focus on the economic implications") to steer the LLM to refine the components. The user then selects the preferred Angle(s) to stitch together or build the final story around.

#### ZONE 3: The Editorial Press (Final Draft Generation & Handover)
* **Execution**: Based on the chosen angle from Zone 2, the LLM physically writes the article.
* **The Bullpen**: The finished stories land here for final polish by Editorial Agents before layout handover.

---

### Future Methodologies (Examples of Modularity)
Because the system is built modularly, the user can easily switch away from the Three-Zone logic to other methodologies from a dropdown menu, such as:

* **Methodology 2: "The Fully Autonomous Node"** (Our Current Classic Setup)
  * Purely automated clustering. Signals are ingested, instantly grouped by semantic resonance without manual selection, and fed directly into full story drafts. Good for fast throughput.
* **Methodology 3: "The Chronological Thread"**
  * Focuses on a single ongoing narrative. The user picks one root topic, and the system acts as a live ticker, continuously appending incoming, relevant signals as chronological updates to a living article.

---

## Architectural Implementation Plan

To support true modular methodologies without creating a tangled mess of code:

1. **State Management**:
   - `activeMethodology`: A top-level UI context (e.g., `'three-zone'`, `'autonomous'`).
2. **Component Modularity**:
   - The first room (`TheWire.tsx`/`NewsroomFloor.tsx`) will no longer hold hardcoded logic. It will act as a wrapper that conditionally renders the correct pipeline container based on `activeMethodology` (e.g., rendering `<ThreeZonePipeline />` instead of `<AutonomousPipeline />`).
3. **Extensible Schema**:
   - We will introduce a `Workbench Session` / `Story Component` schema in Convex to support the intermediate staging steps required by Method 1 (Zone 2), distinct from the existing `news_clusters` architecture.
