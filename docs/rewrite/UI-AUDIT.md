# T-1.4.0 — Cockpit-UX-Audit (Operator-/App-UI)

> Scope: **nur** die Bedien-Oberfläche, mit der der Operator die Redaktion fährt.
> *Nicht* das Zeitungs-Produkt (T-1.2.0 / Visual Supremacy) und *nicht* der öffentliche
> Cinematic Newsroom (T-3.1.x). Read-only-Audit, keine Code-Änderung.

## Die zentrale Spannung (Richtungsfrage)
Es existieren zwei vollständig getrennte Design-Sprachen im Projekt:

| | Produkt-Design (deine Screenshots/README) | Ist-Ops-Cockpit (Code) |
|---|---|---|
| Palette | Paper / Ink, Akzente **Crimson + Emerald**, Muted | `zinc-950`/Schwarz, **Acid-Grün `#ccff00`**, Emerald, Amber |
| Typo | Serif-Display + Sans, definierte Skala | **Monospace**, `uppercase`, `tracking`, 104× `text-[7–9px]` |
| Bild | B&W-Fashion, redaktionell | — (Terminal-Panels) |
| Mood | „Vogue × Swiss", redaktionell | „Hacker-Control-Room" |

→ **Das ist die einzige Frage, die dein Input braucht.** Alles darunter (Ausführungs-Defekte) gilt unabhängig von der Richtung.

## Ist-Architektur (Navigation)
- Ops ist ein **Modal-Overlay** (`App.tsx`, `showNewsroom`-Bool, `z-[150]`) + Floating-„Ops"-Button — kein Router.
- View-Wechsel über `step`-State-Machine (`NewsroomFloor.tsx`): `NEWS_TERMINAL` (TheWire) · `OBSERVABILITY` · `EDITORIAL_BOARD` (Bullpen) · `DARKROOM` · `PRINTING_PRESS`.
- Tab-Leiste in `NewsroomFloor` (aktiver Tab `#ccff00`). **Kein Breadcrumb/Positionsanzeiger**; Default „System Standby" ist ein Sackgassen-Zustand; Zurück-Navigation = manuelle Text-Buttons.
- Shared-Primitive-Lib: `NewsroomUI.tsx` (452 Z.) — `NewsroomButton/Label/Panel`, diverse Cards. Existiert, wird aber **nicht konsequent** genutzt.

## Top-Schwächen (priorisiert — richtungs-unabhängig)
1. **Keine Responsivität in den Kern-Räumen** — `AutonomousPipeline` (12-Spalten-Grid, fix) + `ThreeZonePipeline` (3-Spalten, fix). Auf <Desktop unleserlich. (`AutonomousPipeline.tsx:113`, `ThreeZonePipeline.tsx:57`)
2. **Mikro-Text-Dichte** — 104× `text-[7px]`–`text-[9px]`, kryptische Labels („In/Ds/Db/Dr"). Augenbelastung + Kontrast-Fails. (`AutonomousPipeline.tsx:83-94`)
3. **Hand-gebaute Buttons** umgehen `NewsroomButton` → 3–4 Varianten für dieselbe Semantik. (`TheDarkroom.tsx:48-60`, `AutonomousPipeline.tsx:139`, `ThreeZonePipeline.tsx:113-127`)
4. **Interaktive `<div onClick>`** statt `<button>` (6+) → keine Tastatur/Screenreader. (`ThreeZonePipeline.tsx:71-81`, `AutonomousPipeline.tsx:203-209`)
5. **Inkonsistente/fehlende Empty- & Error-States** — kein gemeinsames `EmptyState`; `SignalSourcingBar` rendert leer ohne Hinweis; `PrintingPress`-Fehler nicht inline. (`SignalSourcingBar.tsx`, `PrintingPress.tsx:21-92`)
6. **Keine Orientierung** — kein Breadcrumb, „Standby"-Sackgasse, manuelle Zurück-Buttons. (`NewsroomFloor.tsx:36-50`)
7. **A11y-Lücken (30+)** — Icon-Buttons ohne `aria-label`, Toggles ohne `aria-pressed`, kein Focus-Trap im Modal. (`NewsroomFloor.tsx:131-136`)
8. **Kognitive Überlast** — 8 Panels im 12-Spalten-Grid ohne Hierarchie (alles wirkt gleich wichtig). (`AutonomousPipeline.tsx:113-354`)

## Größte Komponenten (Refactor-Kandidaten)
`SignalSourcingBar` 810 Z. · `ThreeZonePipeline` 488 Z. · `NewsroomUI` 452 Z. · `AutonomousPipeline` 357 Z. · `ObservabilityDashboard` 214 Z.

## Empfehlung
Richtung **C (Hybrid)**: Control-Room-Charakter behalten (passt zu „Spectator/Cinematic Newsroom"),
aber auf das **Produkt-Token-System umstellen** (Crimson/Emerald statt Acid-Grün, echte Typo-Skala statt
Mikro-Mono) → eine Marken-Familie, Backstage erkennbar. Danach #1–#8 als T-1.4.1/T-1.4.2 abarbeiten.
