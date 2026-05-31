---
name: grid-geometry
description: Guidelines for calculating and manipulating 2D layouts and Magazine grids. Use whenever manipulating responsive grid coordinates.
---

# Grid Geometry Skill

This skill dictates how to safely manipulate elements in a 2-dimensional grid (like `react-grid-layout` or structural array mappings) without causing collisions or layout bugs.

## Golden Rules for Grid Mutation

1. **Explicit Coordinates Over Implicit Order**:
   - Layout arrays do not govern visual order through mapping index. The `y` and `x` coordinates control rendering.
   - When injecting a new item at the top of the grid (Top fold / Hero placement): **Do not** map it to `y: Math.max(...layout.y)`.
   - **Correct Approach**: Place the new item at `y: 0`. Then, explicitly map over the existing layout state and shift everything else down by the new item's height (`item.h`).

2. **Height and Width Bounds (Aspect Ratios)**:
   - Ensure the width (`w`) adheres to your standard column structure (typically `12` columns in a full width row, or `6` for half columns).
   - Assign heights (`h`) that match the inherent design of the block template (e.g., `CoverStory` might be `h: 6` or `h: 8`, while a `SmallArticle` is smaller).

3. **Avoid Overlaps**:
   - If grid collision isn't automatically handled by a layout manager, maintain a rigid Y-stack calculation.
   - Always derive the maximum boundary for an item via `(item.y + item.h)` when determining where the NEXT chronological item must go when pushing to the bottom.

4. **Do Not Lose Old Items**:
   - Spreading prior state (`...oldLayout`) is required before replacing or mutating grid items.
