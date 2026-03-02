# THE ATELIER: VISUAL ENGINE OVERHAUL

## 1. Core Philosophy
Shift from "taking a photo" (Darkroom) to "crafting a visual identity" (Atelier). The image is not just a depiction of the text, but a visual entry point that carries the "vibe" and "meta-meaning" of the article.

## 2. Architecture & Workflow

### Phase 1: The Briefing (Agent Art Director)
Instead of one prompt, the Agent analyzes the draft and proposes **3 Visual Concepts**:
1.  **The Literal**: A direct representation of the subject.
2.  **The Metaphor**: An abstract or symbolic interpretation.
3.  **The Vibe**: A mood-based, atmospheric approach.

### Phase 2: The Setup (Controls)
*   **Prompt Editor**: Full control for the human.
*   **Layout Presets**: "Cover" (Vertical, negative space at top), "Feature" (Wide, cinematic), "Column" (Square, portrait-focused).
*   **Color Harmony**: Presets like "Neon Noir", "Swiss Print", "Analog Warmth".

### Phase 3: The Canvas (Generation & Editing)
*   **Main View**: High-res image display.
*   **Modifier Pills**: Quick-action buttons to "steer" the image.
    *   *Examples*: "Make it darker", "Add grain", "Zoom out", "Minimalist style".
    *   **Custom Pill**: Input field for specific instructions (e.g., "Add a red balloon").
    *   **Tech**: Uses `gemini-2.5-flash-image` for fast image-to-image editing.

### Phase 4: The Context (Preview)
*   **Live Mockup**: See the image immediately with the headline overlaid (CSS overlay).
*   **History**: Film strip of previous iterations to compare/revert.

## 3. Technical Implementation

### New Components
*   `TheAtelier.tsx`: Main container.
*   `ConceptBoard.tsx`: Selection of the 3 initial concepts.
*   `ModifierBar.tsx`: The dynamic pill interface.
*   `LayoutPreview.tsx`: The context view with headline overlay.

### Data Structure Updates
*   `StoryArtifact` needs to store:
    *   `visual_concepts`: Array of generated concepts.
    *   `image_history`: Array of past image IDs.
    *   `active_modifiers`: List of applied edits.

### Agent Updates
*   **`agentArtDirector`**: New agent specialized in extracting visual metaphors and formatting prompts for specific layouts.

## 4. Improvements & Ideas
*   **Composition Guides**: Overlay "Safe Zones" on the canvas where text will appear, helping the user/agent frame the shot correctly.
*   **Style DNA**: Allow saving a successful combination of settings as a "House Style" for future use.
*   **Face Consistency**: (Future) If we have a specific columnist persona, ensure their "avatar" style remains consistent if they appear in the image.

## 5. Execution Steps
1.  **Scaffold**: Create `TheAtelier` UI shell.
2.  **Agent**: Implement `agentArtDirector` to generate concepts.
3.  **Wire**: Connect Prompt Input and Generation logic.
4.  **Edit**: Implement the Modifier Pill system (Image-to-Image).
5.  **Polish**: Add Layout Previews and History.
