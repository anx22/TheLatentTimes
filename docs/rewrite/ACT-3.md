# AKT III — „Lebendiges Redaktionshaus" (Schauspiel + Chronik)
**Beweis: Erlebnis + Chronik — die Seele, öffentlich & lebendig.** Hier wird das Backend zur Attraktion
und die Tagesnachricht zur kartographierten Geschichte der KI-Revolution.
Akzeptanz: ein Besucher kann der Redaktion live zuschauen, eingreifen, und die Revolution über Zeit erkunden.

> Voraussetzung: Akt II (echte Debatte, gesunde Embeddings, ehrliche Missions) — sonst ist das Schauspiel
> nur Theater ohne Substanz.

## Slice 1 — Cinematic Newsroom *(Q1 B)*
- **T-3.1.1 — Live-Aktivitätsstrom.** Echtzeit-Strom aus `agent_logs`/`missions` („wer tut gerade was").
  Files: `convex/newsroom/queries.ts` (`getAgentLogs`, `getMissions`, `getDeepInsight`), `NewsroomFloor.tsx`.
  **Acceptance:** Besucher sehen den laufenden Loop in Echtzeit. **Depends:** T-1.2.1 (echte Metriken).
- **T-3.1.2 — Fünf Räume als Bühne.** Wire/Bullpen/Darkroom/Press/Magazine leuchten je nach Aktivität auf.
  Files: `components/newsroom-v2/*`. **Acceptance:** Aktiver Raum ist visuell erkennbar.
- **T-3.1.3 — Agenten als Charaktere.** Personas (T-2.1.4) mit erkennbarer Identität in der Bühne.

## Slice 2 — Living Magazine *(Q3 B)*
- **T-3.2.1 — Draft-Versionierung.** Artikel kann v1→v2 evolvieren (Datenmodell + UI). Files: `schema.ts`
  (`drafts`), `MagazineGrid.tsx`/`ArticleDetail.tsx`.
- **T-3.2.2 — Critics' Corner sichtbar + Revisions-Schleife.** `agentCriticsCorner`-Kritik rendern; Kritik
  triggert sichtbare Überarbeitung. Files: `services/agents` (`agentCriticsCorner`, `agentConverseWithCritic`).
  **Acceptance:** Leser sehen Kritik *und* die daraus folgende Revision.

## Slice 3 — Co-Director *(Q2 B)* — bleibt §2-konform (Einfluss ist *innen*)
- **T-3.3.0 — Identität/Governance-Design *(Lücke G2 — BLOCKED)*.** Mehrnutzer-Identität, Rollen,
  Missbrauchsschutz statt Single-Operator-Soft-Wall. Files: `convex/auth.ts`, `contexts/NewsroomContext.tsx`
  (`applyReadOnlyGuard`), `App.tsx` (mock session). **Depends:** **Mensch-Entscheidung.**
- **T-3.3.1 — Signal boosten / Angle vorschlagen.** Leser-Input biast die autonome Queue.
- **T-3.3.2 — In Debatte mitstimmen.** Leservotum fließt in den Konsens.
- **T-3.3.3 — Freigabe-Queue mitkuratieren.** Community kann in der Editorial-Queue (T-1.1.3) priorisieren.

## Slice 4 — The Latent Space *(Q9 A)*
- **T-3.4.0 — Zeitreihen-/Snapshot-Design *(Lücke G1)*.** Konzept für Narrativ-Drift über Zeit (z.B. neue
  Tabelle `story_snapshots`). **Acceptance:** Designentscheid dokumentiert, bevor gebaut wird.
- **T-3.4.1 — Embeddings/Cluster sichtbar machen.** Basis-API über `centroid_embedding` (T-2.2.1).
- **T-3.4.2 — Leser-Karte (UI).** Navigierbare „Karte der KI-Revolution". **Depends:** T-3.4.0, T-1.0.3.

## Slice 5 — Chronik-Ebenen *(Q10 B)*
- **T-3.5.1 — Altitude-Tagging.** Stories nach Tag/Meso/Makro taggen + browsen. Files: `schema.ts` (`stories`).
- **T-3.5.2 — Meta-Ausgaben-Generator.** Periodische „State of the Revolution"-Synthese als eigene Ausgabe.
  Files: `issues` (validiert via T-1.2.6), neuer Cron in `convex/crons.ts`.

## Slice 6 — Visual Supremacy
- **T-3.6.1 — Art-Direction-Profile/Moodboards.** Glitch/Brutalist/Swiss-Presets + issue-übergreifende
  Bildsprache. Files: `services/agents` (`agentArtDirector`, `agentPhotographer`), Darkroom. Baut auf T-1.2.0.
- **T-3.6.2 — Komponierbares Layout *(U8)*.** Read-only-Grid → echte Layout-Engine, die die 18 Templates nutzt.
  Files: `components/blocks/templates/*`, `MagazineGrid.tsx`, `types.ts`.
