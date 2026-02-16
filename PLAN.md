
# PLAN.md v4.1 — THE DUAL-MODE NEWSROOM (COMPLETE)

## 0) MISSION
To build an autonomous, luxury high-gloss editorial newsroom powered by tiered AI agents. The system separates concerns into two distinct modes: **Content Mode** (Ingest, Verification, Writing) and **Layout Mode** (Assembly, Binding, Metamorphosis).

---

## 1) DESIGN SYSTEM: "THE SWISS VOGUE"
**Non-Negotiables:**
1.  **Monochrome First**: Black text, white paper, hairline borders (`1px` neutral-200). Color is used only for "Status" (signals) or "Art" (images).
2.  **Grid Discipline**: 
    - The page is a sequence of **Sections**.
    - Each Section is a strict **12-column grid**.
    - Hard alignment to edges. Consistent gutters (`gap-4` md: `gap-8`).
3.  **Typography**:
    - **Hero**: Condensed Sans (Archivo/Helvetica Condensed) + Italic Serif Accent.
    - **Body**: Modern Sans (Inter/Helvetica). High readability. *No serif body paragraphs.*
4.  **Chaos Moves**: Controlled entropy. Elements break the grid only when explicitly allowed by the "Chaos Budget."

---

## 2) ARCHITECTURE: THE TWO MODES

The Newsroom is divided into two sovereign states working on shared objects (`MagazineItem`, `Statement`, `Issue`).

### 2.1 Content Mode (The Writer's Room)
*   **Focus:** Find, Verify, Write, Approve.
*   **Input:** Raw Signals (RSS, Search).
*   **Output:** `Approved Items` (with Scores, Domain, Featured Level) & `Statements` (Manifestos).
*   **Actions:**
    *   Scan Wire -> Commission Story.
    *   Draft -> Rewrite -> Fact Check.
    *   Set `Featured Level` (Hero/Standard).
    *   **Pinning:** Mark items as mandatory for the issue.

### 2.2 Layout Mode (The Art Department)
*   **Focus:** Assembly, Binding, Metamorphosis.
*   **UI Structure:**
    *   **Top Bar:** Issue Picker, Template Selector (Auto/T1/T2/T3), Chaos Budget (0-2), Snapshot Status.
    *   **Center:** Live Page Preview (ReadOnly Grid).
    *   **Left (Asset Pool):** Draggable cards of Approved Items, Statements, and Pinned assets. Filterable by Trust/Recency/Media.
    *   **Right (Slot Inspector):** Configuration for the selected Block (Variant, Binding, Locks).

---

## 3) THE LAYOUT ENGINE MECHANICS

### 3.1 Slot Theory
We do not design pixels; we curate **Slots**.
Each Slot (Block Instance) has three binding states:
1.  **Pinned**: Explicitly bound to a specific Item ID (via Drag-and-Drop).
2.  **Query**: Logic-based (e.g., "Top 3 Video Items sorted by Trust").
3.  **Auto**: Machine fills based on Score + Diversity + Visual Fit.

### 3.2 Constraints & Manipulation
Modifications are strictly constrained to preserve the "Vogue" aesthetic:
*   **Variant**: S/M/L/XL (Changes typography density and image ratio).
*   **Span**: Narrow / Standard / Wide.
*   **Lock**: Protects slot from Metamorphosis.
*   **Chaos**: Toggle "Breakout", "Overlap", or "Crop" (only if Slot allows).

### 3.3 Metamorphosis (The Proposal Engine)
Layout changes are transaction-based, not random.
*   **Suggest Layout**: Agent generates 3 distinct Variants (A/B/C) based on the Asset Pool.
*   **Diff View**: Highlights which slots changed.
*   **Apply**: Commits the variant to a new Page Revision.

---

## 4) DATA MODEL

### 4.1 Content
*   **`MagazineItem`**: The core atom.
    *   `status`: `ingested` | `approved` | `rejected` | `published`
    *   `featured_level`: `none` | `featured` | `hero`
    *   `usage_history`: Tracks which issues have used this item.

### 4.2 Layout
*   **`Issue`**: Collection of Pages.
*   **`Page`**: Ordered list of Sections.
*   **`BlockInstance`**:
    *   `binding_type`: 'PINNED' | 'QUERY' | 'AUTO'
    *   `binding_value`: ItemID (if Pinned) or QueryObject (if Query).
    *   `config`: Variant, ChaosMode, Span.

---

## 5) STATUS

### Phase 1: The Shell (Complete)
- [x] React/Vite/Tailwind Setup.
- [x] Basic "Newsroom" Console.
- [x] v3.0 Grid System.

### Phase 2: The Machine (Complete)
- [x] RSS Ingest Pipeline.
- [x] Template Switching.
- [x] Block Library.

### Phase 3: The Editor's Desk (Complete)
- [x] **Dual Mode Switcher** (Content vs Layout Tabs).
- [x] **Layout Mode UI**: Asset Pool (Left) & Inspector (Right).
- [x] **Drag-and-Drop Binding Logic**.
- [x] **Slot Query Builder**.
- [x] **Metamorphosis UI** (Variant Proposals).
- [x] **Persistence Layer** (Layout JSONB serialization).
