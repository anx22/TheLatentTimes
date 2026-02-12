
# MODUS Status Log

**Current Cycle:** v0.0.4 beta // The Director's Cut
**Focus:** Layout Mode & Asset Binding

## Goals (This Week)
- [ ] **Newsroom Architecture**: Implement Tabbed View (Content Mode / Layout Mode).
- [ ] **Layout Mode Shell**:
    - [ ] Top Bar: Issue/Template/Chaos controls.
    - [ ] Left Panel: **Asset Pool** (Approved Items + Statements).
    - [ ] Right Panel: **Slot Inspector**.
    - [ ] Center: Interactive Preview (Click-to-select Block).
- [ ] **Binding Engine**:
    - [ ] Drag-and-Drop from Asset Pool to Block.
    - [ ] Manual "Pinning" of items.
    - [ ] "Query" Builder UI (Tag/Media filters per block).
- [ ] **Slot Configuration**:
    - [ ] Controls for Variant (S/M/L) and Span.
    - [ ] Chaos Toggle (subject to Budget).
- [ ] **Metamorphosis UI**:
    - [ ] "Suggest Layout" Button.
    - [ ] Variant Strip (A/B/C) logic.

## Known Issues
1.  **Mobile Stacking**: The 12-col grid currently stacks vertically on mobile. Need specific mobile-only block variants.
2.  **Persistence**: Need to save "Layout State" (Bindings/Locks) separate from "Content State".
