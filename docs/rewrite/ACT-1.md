# AKT I — „Eine makellose Ausgabe" auf kanonischem Kern
**Beweis: Tiefe + ehrlicher Kern.** Ein Mensch dirigiert *eine* Ausgabe vom Signal bis zum gedruckten,
visuell starken, nachvollziehbaren Magazin — auf einem Fundament, das hält.
Akzeptanz des Akts: eine reale Ausgabe durchläuft Signal → Cluster → Entwurf → **Freigabe-Queue** →
publiziert, **ohne ein einziges Schein-Element**, mit sichtbarer Provenienz.

> Reuse-Befund: Client-Agenten routen Modell-Calls bereits über `api.gemini.generateText`
> (`services/gemini.ts`). Die Dopplung sitzt in der **Orchestrierung** (`autonomousActions.ts` baut
> Prompts inline mit eigenem `GoogleGenAI`), nicht im Transport. Und `drafts.status='review'` ist
> faktisch schon eine Freigabe-Queue → wir bauen darauf auf, statt neu zu erfinden.

---

## Slice 0 — Guardrails (parallel, P0/P1)
### T-1.0.1 — Gemini-Actions absichern *(S1, P0)*
- **What:** Auth/Rate-Limit vor die öffentlich aufrufbaren Actions `generateText/generateImage/editImage/generateEmbedding/searchTrend`.
- **Files:** `convex/gemini.ts:58,112,135,166,194`; Auth via `convex/auth.ts`.
- **Acceptance:** Aufruf per Deployment-URL ohne gültige Session/Token wird abgelehnt; legitimer Newsroom-Flow unverändert; einfacher Per-Session-Rate-Cap aktiv.
- **Depends:** —

### T-1.0.2 — Netlify-Key-Hygiene *(S4)*
- **What:** Write-fähigen `depl_key_claudecode` aus Netlify-Env entfernen (vom Build ungenutzt); Stray-`VITE_CONVEX_URL`-Dup bereinigen.
- **Files:** Netlify-Env (kein Repo-Change) / `netlify.toml`.
- **Acceptance:** Kein write-fähiger Convex-Key mehr non-secret im Frontend-Env; Build grün.
- **Depends:** —

### T-1.0.3 — Embedding-Dim-Guard *(C2)*
- **What:** Harter Guard, dass nur 3072-dim-Embeddings in den `by_embedding`-VectorIndex gelangen; Fallback `gemini-embedding-001` (768) darf den Index **nicht** stillschweigend korrumpieren.
- **Files:** `convex/gemini.ts:182-189` (`generateEmbedding`, `MODELS.embed`/`embedFallback`), `convex/schema.ts` (`signals.by_embedding`, 3072), `lib/vector.ts`.
- **Acceptance:** Dim-Mismatch wirft/skippt statt zu schreiben; Log macht das sichtbar.
- **Depends:** —

### T-1.0.4 — Echtes Prod-Deployment *(EF-10, P1)*
- **What:** Die öffentliche Seite hängt an einem **Dev**-Convex-Deployment (`dev:adamant-mastiff-745`). Echtes Prod-Deployment + Prod-Deploy-Key aufsetzen und `convex deploy` im CI etablieren (statt Dev-Key-Push).
- **Files:** `netlify.toml`, Convex-Deployment-Config, CI.
- **Acceptance:** Public site läuft gegen ein dediziertes Prod-Deployment; kein Dev-Key im Produktionspfad.
- **Depends:** —

---

## Slice 1 — Ein Gehirn + Freigabe-Queue *(Wette 1; A1/A3/A5)*
### T-1.1.1 — Transport-agnostische Agenten-/Orchestrierungs-Schicht extrahieren
- **What:** Agenten-Prompts + `EditorialOrchestrator`-Logik in ein **gemeinsames Modul** heben, das per
  injiziertem `callModel`/`callJsonAgent` arbeitet — ohne React/Client-Transport-Kopplung. Client übergibt
  `services/gemini.ts`-Transport, Convex übergibt direkten Server-Transport.
- **Files:** `services/agents/*` (`agentScout/Debate/Columnist/Editor/Synthesis…`), `services/editorial/EditorialOrchestrator.ts`, `services/gemini.ts` (`callJsonAgent`, `Schemas`), Ziel: gemeinsames `shared/`-Modul; Konsument 1 = `hooks/useEditorialAgents.ts`.
- **Acceptance:** Eine einzige Quelle für Prompts/Schemas/Schwellen; Client-Pfad funktional unverändert; Schicht ohne DOM/React importierbar.
- **Depends:** —

### T-1.1.2 — Cron reused die Schicht (Inline-Nachbau entfernen)
- **What:** `runScheduledAutonomousRun` ruft die geteilte Schicht (T-1.1.1) statt eigener Inline-Prompts + eigenem `new GoogleGenAI`. Schwellen zentralisieren (`0.96`/`0.74`).
- **Files:** `convex/newsroom/actions/autonomousActions.ts:42-330,98-105`; `convex/newsroom/actions/clusteringActions.ts:74`; `convex/crons.ts`.
- **Acceptance:** Cron erzeugt Entwürfe über dieselbe Logik wie der Client; kein zweiter `GoogleGenAI`-Client; Token via zentralem Transport erfasst.
- **Depends:** T-1.1.1

### T-1.1.3 — Freigabe-Queue (editorial) auf `drafts.status` aufsetzen
- **What:** UI + Mutationen für die Queue: Maschine schreibt `status='review'` → Mensch sichtet, kuratiert, **publiziert** (`status='published'`). Reuse der vorhandenen Status-Maschine statt neuer Tabelle.
- **Files:** `convex/schema.ts` (`drafts.status: draft|review|published`), `convex/newsroom/queries.ts` (`getAllDrafts`), `convex/newsroom/mutations.ts` (`saveDraft`), neue Queue-Ansicht in `components/newsroom-v2/printing-press/` + `NewsroomFloor.tsx`.
- **Acceptance:** Autonome Läufe erscheinen als Review-Items; Publizieren ist ein bewusster Mensch-Klick; nichts wird ohne Freigabe live.
- **Depends:** T-1.1.2

### T-1.1.4 — Lauf-Deduplizierung *(A5)*
- **What:** Verhindern, dass Client-`discoverStories` und Cron gleichzeitig clustern → Doppel-Stories.
- **Files:** `hooks/useEditorialAgents.ts:386`, `convex/newsroom/actions/autonomousActions.ts:168`.
- **Acceptance:** Überlappende Läufe erzeugen keine Duplikat-Stories (Lock/Guard).
- **Depends:** T-1.1.2

---

## Slice 2 — Honest Magazine *(Wette 2; C1/U1/U2/U3/U5/U6)*
### T-1.2.0 — Design-Baseline: Entscheidung + minimaler Pass *(Lücke G3 — BLOCKED)*
- **What:** Entscheiden: minimaler Design-System-Pass (Tokens, Hierarchie, 2–3 Cover-Stile) **oder** bewusst reduzierte typografische Ästhetik für Akt I. Volle Art-Direction bleibt Akt III.
- **Files:** `constants.ts` (`DEFAULT_BLOCK_SIZES`, Layout), `components/MagazineGrid.tsx`, `components/blocks/templates/*`.
- **Acceptance:** Eine bewusste Design-Richtung steht; „makellos" ist gegen sie definiert.
- **Depends:** **Mensch-Entscheidung** (siehe COVERAGE G3).

### T-1.2.1 — Echte Observability-Metriken *(C1)*
- **What:** `getDeepInsight` liefert reale `signals`/`narrativePillars`-Zahlen statt hartkodiert 0.
- **Files:** `convex/newsroom/queries.ts:209-220`.
- **Acceptance:** Dashboard zeigt echte Werte; treibt später den Cinematic-Newsroom (Akt III).
- **Depends:** —

### T-1.2.2 — Darkroom-Bild propagieren *(U1)*
- **What:** `data.image` nach `atelierState.currentImage*` propagieren, damit „Develop Lead Asset" die Vorschau füllt.
- **Files:** `hooks/useNewsroomData.ts:28`, `hooks/useVisualAgents.ts:71-76`, `components/newsroom-v2/TheDarkroom.tsx:32`.
- **Acceptance:** Nach Bildentwicklung erscheint die Vorschau zuverlässig.
- **Depends:** —

### T-1.2.3 — Grid-Layout persistieren *(U5)*
- **What:** Umsortiertes Magazine-Grid überlebt Reload (DB statt nur lokalem State).
- **Files:** `App.tsx:161-165`, `components/MagazineGrid.tsx`, `convex/schema.ts` (`newsroom_state` oder `issues.content`).
- **Acceptance:** Layout-Änderung bleibt nach Reload erhalten.
- **Depends:** T-1.2.6 (validiertes Content-Objekt) empfohlen.

### T-1.2.4 — Schein-Metriken/Stock-Bilder entfernen *(U6)*
- **What:** Zufalls-Confidence (`0.85+rand`), hartkodierte Unsplash-Hero-Fallbacks, statischen Ticker durch echte Daten oder ehrliche Leerzustände ersetzen.
- **Files:** `components/newsroom-v2/.../AutonomousPipeline.tsx:236`, `.../PrintingPress.tsx:25-30`, `App.tsx:71-76`.
- **Acceptance:** Kein angezeigter Wert ist erfunden; treibt T-1.3.1 (echte Confidence).
- **Depends:** —

### T-1.2.5 — Legal-Guardrails an die Draft-Erzeugung koppeln *(U3)*
- **What:** `executeDraftFromWorkbench` liest `isLegalGuardrailsEnabled`/`extractedClaims` und blockt ungeprüfte Drafts.
- **Files:** `contexts/NewsroomContext.tsx` (`executeDraftFromWorkbench`), `components/newsroom-v2/.../ThreeZonePipeline.tsx:199-276`.
- **Acceptance:** Bei aktivem Gate läuft kein Draft ungeprüft durch.
- **Depends:** —

### T-1.2.6 — `issues.content`-Validator *(Validated Boundaries)*
- **What:** Schema-Vertrag für das gerenderte `IssueContent` statt `v.any()`.
- **Files:** `convex/schema.ts` (`issues.content`), `types.ts` (IssueContent).
- **Acceptance:** Ungültige Issue-Struktur wird abgelehnt; Reader-Grid kann sich darauf verlassen.
- **Depends:** —

### T-1.2.7 — `NewsroomProvider`-Scope eingrenzen *(S3)*
- **What:** ~13 Live-Queries nur laden, wenn Ops offen — nicht auf jeder öffentlichen Seite.
- **Files:** `contexts/NewsroomContext.tsx`, `App.tsx`, `hooks/useNewsroomData.ts`.
- **Acceptance:** Öffentliche Magazin-Ansicht ohne offenes Ops verursacht keine Newsroom-Reads.
- **Depends:** —

### T-1.2.8 — „Pause/Resume Core" echt machen *(U2)*
- **What:** Pause/Resume pausiert die laufende Async-Pipeline tatsächlich (nicht nur UI).
- **Files:** `components/newsroom-v2/.../AutonomousPipeline.tsx:9,96-101`.
- **Acceptance:** Pause stoppt nachweislich neue Schritte; Resume nimmt sie wieder auf.
- **Depends:** T-1.1.2

---

## Slice 3 — Lightweight-Provenienz *(Q11 A)*
### T-1.3.1 — „Quellen + Atomic Claims"-Panel pro Artikel
- **What:** Kompaktes Panel: Quell-Signale + extrahierte Atomic Claims sichtbar am Artikel. Erster Glass-Box-Baustein.
- **Files:** `components/MagazineGrid.tsx`/`components/ArticleDetail.tsx`, Datenherkunft aus `signals.storyId` + Legal-Claims (`ThreeZonePipeline`-Flow).
- **Acceptance:** Jeder publizierte Artikel zeigt nachvollziehbar Quellen + Kernbehauptungen.
- **Depends:** T-1.2.5, T-1.1.3

---

## Slice 4 — Operator Cockpit (UI/UX) *(Mensch-Priorität; Lücke G7)*
> **Abgrenzung:** *nicht* das Zeitungs-Produkt-Design (T-1.2.0 / Akt III „Visual Supremacy") und *nicht* der
> öffentliche Cinematic Newsroom (T-3.1.x, Zuschauer-Bühne). Hier geht es um die **Bedien-Oberfläche, mit der
> der Operator täglich arbeitet** — Navigation, Informationshierarchie, Konsistenz, Zustände. Auf Mensch-Wunsch
> aufgenommen, weil die Cockpit-UX im Masterplan zwischen Produkt-Design und Schauspiel durchfiel (COVERAGE G7).

### T-1.4.0 — Cockpit-UX-Audit + Richtungsentscheid ✅
- **What:** Strukturierter Audit der Operator-UI; Schwächen priorisiert + Richtung entschieden.
- **Ergebnis:** `docs/rewrite/UI-AUDIT.md`. **Richtungsentscheid (Mensch):** Das Redesign **unterwirft sich kreativ komplett der editorialen Produkt-Grammatik** (Paper/Ink, Playfair/Inter, Akzente Crimson/Emerald, Swiss × Vogue) — bleibt aber **funktional strikt auf den vorhandenen Logiken & High-Level-Flows** (Step-Machine, fünf Räume, Pipelines, Daten-Wiring unverändert). Mutig visuell, konservativ funktional.
- **Acceptance:** erfüllt.

### T-1.4.1 — Editorial-Token-Fundament + Primitives
- **What:** Token-System vervollständigen (Crimson-/Emerald-Akzente ergänzen; Paper/Ink/Muted + Playfair/Inter/Mono existieren bereits in `tailwind.config.js`/`index.html`). Die `NewsroomUI`-Primitives (`NewsroomButton/Label/Panel`, Cards) + ein neuer `EmptyState` auf die editoriale Grammatik umskinnen — eine Quelle der Wahrheit.
- **Files:** `tailwind.config.js`, `components/newsroom-v2/NewsroomUI.tsx`, ggf. `index.css`.
- **Acceptance:** Primitives spiegeln die editoriale Grammatik; Konsumenten erben sie automatisch.
- **Depends:** T-1.4.0

### T-1.4.2 — Shell + Navigation umskinnen *(sichtbarer Checkpoint)*
- **What:** `App`-Shell + `NewsroomFloor` (Masthead, Tab-Nav, Orientierung/Breadcrumb, Error-Banner) auf die Grammatik; Standby-Sackgasse + unklare Zurück-Navigation beheben. Logik/Flows unverändert.
- **Files:** `App.tsx`, `components/newsroom-v2/NewsroomFloor.tsx`.
- **Acceptance:** Shell trägt die editoriale Grammatik; `dev`-Preview-Checkpoint für Mensch-Feedback **vor** dem Raum-Rollout.
- **Depends:** T-1.4.1

### T-1.4.3 — Räume umskinnen + Ausführungs-Defekte ①–⑧
- **What:** Raum für Raum (Wire/`ThreeZonePipeline`, `TheBullpen`, `TheDarkroom`, `PrintingPress`, `AutonomousPipeline`, `ObservabilityDashboard`, `SignalSourcingBar`) auf die Grammatik; dabei Audit-Defekte fixen: Responsivität, Mikro-Text-Dichte, hand-gebaute Buttons → Primitives, `<div onClick>` → `<button>`, Empty/Error-States, A11y. Funktion/Flows erhalten.
- **Files:** `components/newsroom-v2/*`.
- **Acceptance:** Jeder Raum folgt der Grammatik; ①–⑧ adressiert; kein Flow gebrochen.
- **Depends:** T-1.4.2
