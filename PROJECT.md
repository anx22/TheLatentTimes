# MODUS: The AI-Native Fashion Magazine

## Vision
MODUS is not just a magazine; it is a living, breathing organism powered by a symphony of AI agents. It explores the intersection of high fashion, synthetic biology, and latent space theory. It is "Vogue meets Wired meets The Matrix."

## The Newsroom (Ops Layer)
The heart of MODUS is **The Newsroom**, a collaborative workspace where human editors direct a fleet of AI agents to produce high-culture artifacts.

### The Agents
The newsroom is staffed by specialized agents, each with a distinct persona, voice, and function:

1.  **The Scout (Ingestion)**: Scans the digital horizon (RSS, APIs, Trends) for "Signals"—weak indicators of future trends.
2.  **The Editorial Board (Ideation)**:
    *   **The Critic**: Skeptical, academic, obsessed with history and theory. Looks for the "ghost in the machine."
    *   **The Runway**: Pure aesthete. Obsessed with visuals, texture, and surface.
    *   **The Atelier**: The engineer. Obsessed with code, structure, and how things work.
3.  **The Editor-in-Chief (Decision)**: Reviews pitches from the Board, selects the best angle, and issues a "Commission."
4.  **The Columnist (Writing)**: Writes the actual prose based on the Commission. Can adopt different voices (Gonzo, Academic, Minimalist).
5.  **The Art Director (Visuals)**: Conceptualizes the visual identity of the story and generates prompts.
6.  **The Photographer (Generation)**: Uses the prompts to generate high-fidelity assets (Images, Video).
7.  **The Production Manager (Layout)**: Assembles the text and visuals into a layout (Cover, Feature, Column).

### The Workflow (The Pipeline)
1.  **Signal Detection**: The Scout identifies a topic (e.g., "Digital Decay").
2.  **The Pitch**: The Editorial Board generates 3 distinct angles.
3.  **The Commission**: The User (acting as EIC) selects an angle.
4.  **Drafting**: The Columnist writes the copy.
5.  **Visualizing**: The Art Director & Photographer create the imagery.
6.  **Publishing**: The artifact is pushed to the live magazine.

## Architecture
-   **Frontend**: React + Tailwind (The Interface).
-   **Brain**: Google Gemini (The Intelligence).
-   **State**: LocalStorage (MVP) -> Supabase (Production).
-   **Orchestration**: Client-side agent chaining (MVP) -> Server-side queues (Production).

## Design Philosophy
-   **Aesthetic**: Brutalist, High-Contrast, Swiss Style, Terminal-Chic.
-   **Interaction**: Fast, Keyboard-centric, "God Mode."
-   **Tone**: Intellectual, Accelerationist, Haughty but Insightful.
