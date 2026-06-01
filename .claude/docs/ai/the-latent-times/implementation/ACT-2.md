# AKT II — „Ein Motor, dem man vertraut" (autonomer Innenbetrieb)
**Beweis: Autonomie *innen* + Vertrauen.** Der Loop läuft unbeaufsichtigt & verlässlich und füllt die
Freigabe-Queue mit nachvollziehbaren Entwürfen. Hier wird „die Zeitung läuft voll autonom (innen)" wahr.
Akzeptanz: über mehrere Cron-Läufe entstehen vertrauenswürdige, erklärbare Entwürfe ohne Eingriff —
jeder mit Intent-Trace.

> Voraussetzung: Akt I Slice 1 (ein Gehirn) muss stehen — sonst veredeln wir die falsche (doppelte) Pipeline.

## Slice 1 — Explainable Wire *(A2; „Authority over Aggregation")*
- **T-2.1.1 — Deterministische Vektor-Korrelation fürs Gruppieren.** Cluster-*Bildung* über
  Embedding-Korrelation (nicht generativ). Files: `clusteringActions.ts` (`checkSemanticSimilarity` 0.74/0.96,
  `discoverStories`), `services/signals/SignalBroker.ts`. **Acceptance:** Gruppierung ist reproduzierbar/erklärbar.
- **T-2.1.2 — LLM nur fürs Benennen/Synthese.** `discoverStories` nutzt das LLM nur noch für Titel/Summary
  bestehender Gruppen. **Acceptance:** Kein LLM entscheidet mehr *welche* Signale zusammengehören.
- **T-2.1.3 — Intent-Trace-Artefakt.** „Warum gehören diese Signale zusammen" als gespeicherte, anzeigbare
  Begründung. Files: `convex/schema.ts` (`stories`), `queries.ts`. **Acceptance:** Jede Story trägt eine Trace.
- **T-2.1.4 — Dormante Agenten verdrahten *(A4)*.** `agentPersonaSpeak/SeedExplorer/LayoutDesigner` in den
  Loop einbinden oder bewusst entfernen. Files: `services/agents/index.ts`. **Acceptance:** Kein toter Export im Hauptpfad.

## Slice 2 — Gesunde Cluster-Daten *(C3/C4; G4)*
- **T-2.2.1 — `centroid_embedding` befüllen *(Lücke G4)*.** Beim Cluster-Bau Zentroid berechnen/speichern
  (Basis für Latent-Space-Karte). Files: `clusteringActions.ts`, `schema.ts` (`stories.centroid_embedding`).
- **T-2.2.2 — `getNewsClusters`-Limit-Bug *(C4)*.** Hartkodiertes `limit=1` respektiert Arg. Files: `queries.ts:176`.
- **T-2.2.3 — `drafts.storyId` typisieren *(C3)*.** `v.string()`+`as any` → `v.id("stories")`. Files: `schema.ts:83`, `mutations.ts:450`.

## Slice 3 — Echte Mehr-Runden-Debatte *(Q4 A)*
- **T-2.3.1 — Debatten-Engine mit echter Friktion.** Mehrere Runden statt *einem* JSON-Call. Files:
  `services/editorial/EditorialOrchestrator.ts` (`conductDebate`), `services/agents` (`agentDebate`), `Schemas.Debate`.
  **Acceptance:** Transkript zeigt iterative Gegenrede, nicht ein Einmal-Ergebnis.
- **T-2.3.2 — Personas differenziert.** Board-Mitglieder mit unterscheidbaren Lenses (`EDITORIAL_LENSES`).
  **Acceptance:** Stimmen sind im Transkript klar verschieden.

## Slice 4 — Provenienz vertieft *(Q11)*
- **T-2.4.1 — Volle Kette erfassen.** Signale→Debatte→Entscheidung→Claims durchgängig an den Draft hängen.
  Files: `mutations.ts` (`saveDraft`), `missions`. **Acceptance:** Lightweight-Panel (T-1.3.1) kann auf die volle Kette ausgebaut werden.

## Slice 5 — Validated Boundaries (Rest) *(Schicht 5)*
- **T-2.5.1 — Validatoren für `drafts.blocks`, `missions.metadata`, `newsroom_state.data`.** `v.any()` → Verträge.
  Files: `convex/schema.ts`, `types.ts`. **Acceptance:** Kein `v.any()` mehr an Kern-Objekten.
- **T-2.5.2 — `@ts-nocheck`-Inseln entfernen *(EF-9)*.** Typcheck in `convex/crons.ts`, `autonomousActions.ts`,
  `clusteringActions.ts` wiederherstellen (`any`-lastig). **Acceptance:** Kein `@ts-nocheck` mehr in diesen Dateien;
  Build typsicher. **Note:** sinnvoll *nach* T-1.1.2 (autonomousActions wird ohnehin umgebaut).

## Slice 6 — Guardrails
- **T-2.6.1 — Signal-Cache *(S2, Zero-Token)*.** Embeddings/Suchen cachen statt pro Signal neu. Files:
  `clusteringActions.ts` (`checkSemanticSimilarity`), `autonomousActions.ts:106`.
- **T-2.6.2 — Token-Telemetrie ehrlich *(C5)*.** `recordUsage`-Catch nicht still schlucken. Files: `convex/gemini.ts:47-51`.
