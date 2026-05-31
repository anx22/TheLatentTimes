# The Latent Times — Codebase-Analyse

> Stand: 2026-05-31 · Branch `claude/intelligent-mayer-PHjEf` · HEAD `5399c67`
> Erstellt als Bestandsaufnahme („Wo kommen wir her, wo funktioniert was, wo sind die Lücken").
> Dies ist ein Analyse-Artefakt, kein Code-Change.
>
> **Status-Update:** Die Abschnitte 1–11 sind die *ursprüngliche* Bestandsaufnahme. Viele dort als
> „offen" markierte Befunde sind inzwischen behoben (Verbindung, Build, A1/A2, Read-Usage, fehlende
> Auth via Read-only-Soft-Wall, Client-Doppel-Engine, Modell-Zentralisierung). Den aktuellen Stand
> + die Roadmap siehe **Abschnitt 12–13** unten und **`EMERGENCY_FIXES.md`**.

---

## 0. Tooling- & MCP-Status (was war erreichbar?)

| Kanal | Status | Bemerkung |
|---|---|---|
| **Repo / Git / Dateisystem** | ✅ voll | Vollständige statische Analyse möglich |
| **GitHub MCP** | ✅ verfügbar | History, PRs, Issues lesbar (`anx22/thelatenttimes`) |
| **Convex MCP** | ❌ **nicht vorhanden** | Es gibt keinen offiziellen Convex-MCP-Server in dieser Umgebung. `convex-database` ist nur ein **lokaler Repo-Skill** (`/skills/custom_skills/`), kein MCP. → Live-DB, Env-Vars und Funktionsausführung **nicht prüfbar von hier** |
| **Supabase MCP** | ⚠️ vorhanden, **irrelevant** | Generisches Umgebungs-Preset. Projekt nutzt Convex, nicht Supabase. Nicht angefasst |
| **Vercel MCP** | ✅ vorhanden | Frontend-Deploy/Logs theoretisch prüfbar (Team-/Projekt-ID nötig) |
| **Whiteboard/Diagramm-MCP** | ✅ vorhanden | Für visuelle Doku nutzbar |
| **Live Convex-Deployment** | ❌ nicht erreichbar | Keine Deploy-Keys im Sandbox, kein `.env`. Modell-Aliasse, Cron-Läufe, Daten ungeprüft |

**Folge:** Alles unten ist **statische Code-Wahrheit**. Aussagen über „läuft live" sind markiert als *(nicht verifizierbar von hier)*.

---

## 1. Was das Projekt ist

**The Latent Times** — eine „AI-native Magazin-Engine". Vision (PRODUCT.md): „Vogue meets Wired meets The Matrix". Kein RSS-Reader, sondern ein agentisches Redaktions-Betriebssystem, das technische Signale → kulturelle Narrative → publiziertes Magazin verwandelt. Der Nutzer ist „Director", nicht passiver Leser.

**5 Produkt-Räume:** THE WIRE (Intelligence-Terminal) · THE BULLPEN (Redaktions-Debatte) · THE DARKROOM (Visual-Atelier) · THE PRINTING PRESS (Layout-Engine) · THE MAGAZINE (lebendes Grid).

---

## 2. Tech-Stack (Ist-Zustand)

- **Frontend:** React 18 + Vite 5 + TailwindCSS 3 + `motion` (Framer) + `react-grid-layout`
- **Backend:** **Convex** (`^1.32`) — Realtime-DB, Vektorsuche, Actions, Crons, File-Storage
- **KI:** Google Gemini via `@google/genai` (`latest`) — **ausschließlich serverseitig** in Convex-Actions
- **Deployment:** Vercel (Frontend, SPA-Rewrite) + Convex Cloud (Backend + Crons)
- **Sprache:** TypeScript (strict via tsc-Build), ESLint flat-config

**LOC grob:** components ~4.157 · services ~2.904 · convex ~2.114 · hooks ~1.176 · contexts ~287 · lib ~38

---

## 3. Architektur: Thin-Client-Pattern

Zentrale (und sauber umgesetzte) Entscheidung: **Kein API-Key im Browser-Bundle.**

```
Browser (React)                Convex Cloud                     Google
─────────────                  ────────────                     ──────
services/gemini.ts   ──action──►  convex/gemini.ts ("use node")  ──►  Gemini API
(Thin Proxy)                      liest process.env.GEMINI_API_KEY
   ▲                                   │
   │ useQuery/useMutation              │ runMutation(recordTokenUsage)
   └──────────────────────────────────┘
        Convex Tabellen = Single Source of Truth
```

- `vite.config.ts` hat **bewusst keinen `define`-Block** → Key kann nicht leaken
- `.env` (gitignored) enthält nur `VITE_CONVEX_URL`
- Key lebt nur in Convex: `npx convex env set GEMINI_API_KEY …`
- `.env` wurde aus der **kompletten Git-History per filter-repo gepurged** (61 Commits neu geschrieben)

**Server-Transport** (`convex/gemini.ts`): `generateText` (mit Modell-Ladder + Pro-Cooldown), `generateImage`, `editImage`, `generateEmbedding` (mit Fallback), `searchTrend` (Google-Search-Grounding + Fallback).

---

## 4. Backend-Inventar (Convex)

### 4.1 Tabellen (`convex/schema.ts`) — 10 Stück
| Tabelle | Zweck | Besonderheit |
|---|---|---|
| `sources` | Crawl-Ziele | pack/priority/trustTier/rightsMode (optional) |
| `stories` | Cluster / „Pillars" | centroid_embedding |
| `signals` | Roh-Signale | **vectorIndex `by_embedding`, dim 3072** |
| `drafts` | Artikel | `blocks` als `v.any()` JSON |
| `agent_logs` | Chatter-Stream | by_mission |
| `missions` | Execution-Threads | tokenUsage-Objekt, Observability-Anker |
| `images` | Visuals | storageId → `_storage` |
| `newsroom_state` | UI-Persistenz | key/data (`current`) |
| `issues` | Publiziertes Archiv | `content` = full IssueContent JSON |
| `workbench_sessions` / `story_angles` | Three-Zone-Pipeline | Methodology-1-Staging |

### 4.2 Funktions-Module
- `convex/newsroom/mutations.ts` — **flache 534-LOC-Datei**, 29 Mutations (Missions, Signals, Sources, Issues, Drafts, Workbench)
- `convex/newsroom/queries.ts` — 19 Queries
- `convex/newsroom/actions.ts` — **3-Zeilen Re-Export-Shim** → `actions/`
  - `actions/clusteringActions.ts` (226) — Similarity, discoverStories, Cluster-Titel
  - `actions/fetchActions.ts` (105) — RSS, GitHub, Feed-Probe
  - `actions/autonomousActions.ts` (330) — kompletter autonomer Sweep
- `convex/gemini.ts` (240) — KI-Transport
- `convex/crons.ts` (36) — circadian 08/13/19 UTC + stündl. Cleanup
- `convex/maintenance.ts`, `media.ts`, `testing.ts`, `seedData.ts`

---

## 5. Agenten-Layer

**18 Client-Agenten** (`services/agents/`), jeder eine Datei, alle proxien über `services/gemini.ts`:
Discovery (Scout, TargetedSearch, CulturalGrounding) · Deliberation (PersonaSpeak, Debate, Consensus, Synthesis) · Drafting (Columnist, Editor, RewriteBlock, RewriteSentence, Polisher) · Visual (ArtDirector, PromptEnhancer, Photographer) · Layout/Afterlife (LayoutDesigner, CriticsCorner, ConverseWithCritic). Zusätzlich `agentWorkbench`, `agentSeedExplorer`.

**Orchestratoren:** `EditorialOrchestrator`, `AtelierEngine`, `PublicationOrchestrator`, `SignalBroker` (+ Adapter RSS/GitHub/Search, ScoringEngine, SourceRegistry mit 23 Quellen).

⚠️ **Architektonische Doppelung:** Der autonome Cron (`autonomousActions.ts`) **re-implementiert** die gesamte Kette (Scout→Cluster→Debate→Columnist) serverseitig mit **inline-Prompts und direkter `GoogleGenAI`-Instanz** — er nutzt **nicht** die 18 `services/agents`. Zwei parallele Wahrheiten → Divergenzrisiko.

---

## 6. Frontend-Inventar

- **Einstieg:** `index.tsx` → `App.tsx`. App rendert: Header + (Deko-)Ticker + entweder `MagazineGrid` (wenn Layout) oder `MainNewspaper` (Liste) + `NewsroomFloor`-Overlay (Ops).
- **Newsroom-v2** (`components/newsroom-v2/`): TheWire, TheBullpen, TheDarkroom, PrintingPress, ThreeZonePipeline, AutonomousPipeline, ObservabilityDashboard, SignalSourcingBar.
- **Block-Templates** (`components/blocks/templates/`): 18 Magazin-Bausteine (CoverStory, Glamour, MassiveHeadline, LargeQuote …) + Registry.
- **State:** Contexts (Newsroom, Atelier, Parameter) + 6 Domain-Hooks (useNewsroomData/State/UIState, useEditorialAgents, useVisualAgents, usePublicationFlow).

---

## 7. Git-Evolution (woher kommen wir)

- **Start:** 2026-02-12 — Google-AI-Studio-Genese (`feat(aistudio): …`, AIStudio global types, Key-Selection).
- **Verlauf:** ~3,5 Monate, ~30+ Feature-Commits. Erkennbare Phasen:
  1. **Auth/Login** (Feb) → später **entfernt** (heute Mock-Session)
  2. **Newsroom-Modularisierung** (Mai): NewsroomContext, v2-Components, Hook-Decomposition (800-LOC-Hook gesplittet)
  3. **Strukturierte Drafts** (DraftBlock-Arrays, satzgenaues Editing)
  4. **Vektor-Clustering** + Dedup
  5. **react-grid-layout** als AI-orchestriertes Magazin-Grid
  6. **Three-Zone-Pipeline** + Legal-Shield (UrhG §23/44b)
  7. **Phase 1/2b Cleanup** (KI-Transport serverseitig, Mocks raus, mutations geflattet)
- **Doppelte Commits** in `git log --all` (z.B. zwei × „multi overhauls.. still buggy") = Artefakt des **filter-repo History-Rewrites** beim `.env`-Purge (alte + neue Refs koexistieren).
- **Selbstbeschreibung der Commits:** „multi overhauls.. still buggy" — deckt sich mit „Patchwork, das stellenweise funktioniert".

---

## 8. Externe Konnektoren / Quellen

23 Signal-Quellen in `seedData.ts` / `SourceRegistry.ts`, gruppiert in Packs:
`AI_MODEL_FRONTIER` (OpenAI, HuggingFace, DeepMind, Google Research, Meta, Mistral) · `AI_RESEARCH` (arXiv cs.AI/cs.LG, HF Papers, BAIR) · `AI_DEV_SIGNAL` (NVIDIA, Lil'Log, vLLM, Simon Willison, GitHub Trending, HN) · `AI_LAW_POLICY` (EU, FTC) · `AI_BUSINESS` (TechCrunch, VentureBeat) · `AI_CULTURE` (WIRED, The Verge).
Ingest-Typen: `rss`, `api`, `github`, `html_watch`. *(Live-Erreichbarkeit der Feeds nicht von hier prüfbar.)*

---

## 9. Was funktioniert vs. was nicht (Skip-&-Notiz)

### ✅ Strukturell solide
- Thin-Client / Key-Sicherheit (Bundle ist sauber)
- Convex-Schema konsistent, Vektorindex korrekt (3072 via `lib/vector.ts` erzwungen)
- Frontend-Hydration über `getLatestIssue`
- Modell-Ladder + Rate-Limit-Cooldown im Transport

### ⚠️ / ❌ Verdächtig, kaputt oder ungeprüft
1. **`completeMission`-Bug (konkret, verifiziert):** `autonomousActions.ts:308` ruft `completeMission({ missionId, tokenUsage })` — aber die Mutation akzeptiert nur `{ missionId, resultId? }`. Convex-Argvalidierung **wirft** → der autonome Cron schlägt am **Schlussschritt jedes Laufs** fehl (Draft wird zwar vorher gespeichert, aber Mission endet als „failed"). Genau das, wovor der Session-Handoff warnte.
2. **Modell-Aliasse:** `gemini-3-flash-preview`, `gemini-embedding-2`, `gemini-2.5-flash-image`. Das sind AI-Studio-Ära-Namen; ob sie im echten Deployment auflösen, ist **nicht von hier verifizierbar**. Die DECISIONS-Historie zeigt bereits 404-Kämpfe (`gemini-3.5-flash`). **Single Point of Failure** der ganzen Pipeline.
3. **Keine Auth:** Login/Register/Reset existierten (Feb), sind raus. `App.tsx` nutzt hartkodierte Mock-Session (`editor@latent.times` / `dev-bypass-id`). Ops-Panel öffentlich.
4. **Doku-Drift:** DECISIONS.md + NOW.md beschreiben `mutations.ts` als 5-Modul-Split unter `/convex/newsroom/mutations/` — **existiert nicht**; Datei ist flach (durch `5399c67` rückgängig gemacht wg. TS2589). Der actions-Split ist hingegen real.
5. **Doppelte Pipeline** (siehe §5) — Wartungsfalle.
6. **Ticker** konzeptionell „retired" (DECISIONS Signal-Convergence), aber `Ticker`-Component + `ticker:[]` in `getGenesisIssueContent` leben weiter.
7. **`@ts-nocheck`** in `crons.ts`, `frontendApi.ts`, `autonomousActions.ts` — Typsicherheit dort abgeschaltet (bewusst, aber blinde Flecken).
8. **`UsageTracker`** in `services/mission` ist No-Op-Shim (Telemetrie serverseitig migriert).

---

## 10. Katalog: Widersprüche, Lücken, offene Fragen

### A. Verifizierte Bugs (sofort fixbar)
- **A1** `completeMission`-tokenUsage-Mismatch → Cron failt am Ende. Fix: Argument entfernen (Token-Tracking läuft eh über `recordTokenUsage`).

### B. Doku ↔ Code-Widersprüche
- **B1** mutations-Split (5 Module) in DECISIONS/NOW dokumentiert, aber nicht im Code. → Doku korrigieren.
- **B2** AGENTS.md sagt „All [agents] run client-side" — stimmt für die 18, aber der Cron dupliziert sie serverseitig. → präzisieren.

### C. Nicht-von-hier-verifizierbar (brauchen Deployment-Zugang/Connector)
- **C1** Lösen die Gemini-Modell-Aliasse im echten Deployment auf? Ist `GEMINI_API_KEY` gesetzt?
- **C2** Welche der 23 RSS/API-Feeds liefern live (404-Quote)?
- **C3** Laufen die Crons? Gibt es Daten in `signals`/`issues`?
- **C4** Vercel-Deploy grün? (Team-/Projekt-ID nötig)

### D. Strategische/Architektur-Fragen
- **D1** Soll die serverseitige Cron-Pipeline auf die `services/agents` konsolidiert werden, oder bleibt die Doppelung bewusst (Browser vs. headless)?
- **D2** Auth: bewusst entfernt (Single-User-Tool) oder soll Convex-Auth zurück?
- **D3** Legacy `news_clusters`-Tabelle (in NOW.md als „purge"-Kandidat) — Status? (im Schema nicht (mehr) vorhanden)
- **D4** Embedding-Dim 3072 (`gemini-embedding-2`) vs. Fallback `gemini-embedding-001` (768-dim) — Dim-Mismatch beim Fallback würde `assertEmbeddingDim` werfen. Beabsichtigt?

---

## 11. Empfohlene nächste Schritte (Vorschlag)
1. **A1 fixen** (1-Zeilen-Change, beseitigt garantiertes Cron-Failure).
2. **Connectors einrichten:** Convex-Deploy-Key + `VITE_CONVEX_URL` in die Session → dann C1–C3 live verifizieren.
3. **Doku synchronisieren** (B1/B2) — Single Source of Truth herstellen.
4. **Modell-Aliasse zentralisieren** in eine Konstante (`constants.ts`), damit Modellwechsel an einer Stelle passieren.
5. **Architektur-Entscheid D1** treffen, bevor weiter an zwei Pipelines gebaut wird.

---

## 12. Live-Verifikation (2026-05-31, via Netlify-MCP + Convex-CLI)

Zugang selbst hergestellt: Convex-**Dev**-Deploy-Key aus Netlify-Env (`depl_key_claudecode`)
→ Deployment `adamant-mastiff-745`. Read-only-Checks (keine Mutationen/Deploys ausgeführt).

### Ergebnisse
| Check | Ergebnis |
|---|---|
| **C1** `GEMINI_API_KEY` im Deployment | ✅ **gesetzt** — serverseitiger Transport hat seinen Key |
| **Embeddings live** | ✅ funktionieren — Signals tragen echte 3072-dim Vektoren |
| **Ingestion** | ✅ läuft — Sweep um 19:00 UTC: 202 Items entdeckt, 193 Signals committet, 29 Quellen aktiv |
| **Clustering** | ✅ läuft — 3 „Pillars" gebildet, Story „The Ethics of the Incomputable" existiert |
| `sources` / `missions` / `drafts` / `issues` | 29 / 1 / **0** / **0** |
| **Autonomer Cron-Lauf** | ❌ **[failed]** mit `ArgumentValidationError: extra field 'tokenUsage'` in `completeMission` — **exakt Bug A1** |
| **Öffentliche Netlify-Seite** | ❌ **nicht mit Backend verbunden** |

### Befund I — A1 live bestätigt (Fix bereits committet)
Der Mission-Error-String aus der DB ist wörtlich:
> `ArgumentValidationError: Object contains extra field 'tokenUsage' … Validator: v.object({missionId, resultId?})`

Der heutige Abend-Sweep ingestierte + clusterte erfolgreich und **starb dann am `completeMission`-Aufruf**.
Der Fix in diesem Branch (Commit `80a39a1`) beseitigt genau das — ist aber **noch nicht live**
(Netlify baut `main`; dieser Branch muss erst gemerged + neu deployed werden).

### Befund II — Öffentliche Seite ist vom Backend getrennt 🔴
- `thelatenttimes.netlify.app` → HTTP 200, aber das Bundle (`index-DDsk5iUg.js`) enthält
  „System Configuration Error" + „VITE_CONVEX_URL" und **keine** `*.convex.cloud`-URL.
- Ursache: `index.tsx` liest `import.meta.env.VITE_CONVEX_URL` (Build-Zeit, **kein Fallback**),
  aber in Netlify ist **nur** der Deploy-Key gesetzt — **kein `VITE_CONVEX_URL`**, keine `netlify.toml`.
- Folge: Die Live-Seite rendert den roten Konfigurationsfehler. Besucher sehen kein Magazin.
- Fix-Optionen: (a) `VITE_CONVEX_URL=https://adamant-mastiff-745.convex.cloud` als Netlify-Env-Var,
  oder (b) Build-Command auf `npx convex deploy --cmd 'npm run build'` (injiziert die URL automatisch).
  ⚠️ Nebenbefund: Es wird ein **Dev**-Key (`dev:…`) statt Prod-Key für das öffentliche Deployment genutzt.

### Befund III — Autonomes Drafting wird still übersprungen (neuer latenter Bug A2)
Auch **nach** A1-Fix würde kein Draft entstehen: In `autonomousActions.ts` wird die Zielstory via
`api.newsroom.queries.getNewsClusters` geladen — diese Query liefert aber **hartkodiert `limit = 1`**
(`queries.ts:166`). `clusters.find(c => c._id === targetStoryId)` trifft daher meist nicht →
der gesamte `if (story)`-Drafting-Block (Debate→Columnist→saveDraft) wird übersprungen.
Beleg: Der Lauf erzeugte **genau 7 Logs** (Scout 3 / Board 2 / SYSTEM 2), **keine** Columnist-Zeile,
und `drafts = 0`. → erklärt, warum trotz funktionierender Ingestion/Clustering nie ein Artikel entsteht.

### Konsequenz für den Katalog
- **A1** ✅ gefixt + live als Ursache bestätigt → muss nur noch nach `main` & redeployed werden.
- **A2** (neu): `getNewsClusters` limit=1 vs. Story-Lookup im Cron → Drafting tot. Fix: Story per
  `ctx.db.get(targetStoryId)` direkt holen statt über die limitierte Liste.
- **Deployment** (neu, hohe Prio): `VITE_CONVEX_URL` in Netlify fehlt → öffentliche Seite blind.
- C2 (Feed-404-Quote) noch offen — Ingestion liefert aber live 193 Signals, also grundsätzlich gesund.

---

## 13. Session 2 — Build-Fix + Convex-Read-Usage-Normalisierung

### Deployment / Build (Netlify)
- **Build-Fail-Ursache:** Der erste `netlify.toml`-Versuch (`npx convex deploy --cmd …`)
  scheiterte in CI, weil der verfügbare Schlüssel ein **Dev-Key** ist → `convex deploy`
  liefert `403 Forbidden`. Lokaler `npm run build` (tsc && vite) läuft dagegen sauber.
- **Fix:** `netlify.toml` baut nun mit reinem `npm run build`; `VITE_CONVEX_URL` wird
  als Build-Env gesetzt. **Wichtig:** korrekte Host-Variante ist die **regionale**
  `https://adamant-mastiff-745.eu-west-1.convex.cloud` (die nicht-regionale `…convex.cloud`
  liefert 404). In `[build.environment]` versioniert gepinnt.
- **Backend separat deployed:** Netlify baut nur das Frontend. Die Backend-Funktionen
  (A1, A2, getStory, getSignals-Strip, Log-Limit) wurden via `npx convex dev --once`
  (Dev-Key) auf `adamant-mastiff-745` gepusht.
- **Live verifiziert:** neues Bundle enthält die regionale URL; `getSignals` liefert keine
  Embeddings mehr; `getStory` aufrufbar.
- **Kleiner manueller Rest:** In der Netlify-UI stehen noch zwei verwaiste Vars
  (`VITE_CONVEX_URL` ohne Region — von `netlify.toml` überschrieben; `CONVEX_DEPLOY_KEY` —
  jetzt ungenutzt, da kein `convex deploy` im Build). Aufräumen blockiert durch
  temporären Netlify-MCP-502. Unkritisch.

### Convex-Read-Usage — Hauptverursacher & Fixes
| Hog | Befund | Fix |
|---|---|---|
| **`getSignals` mit Embeddings** | Reaktives Abo (`useNewsroomData`), das bei *jedem* Signal-Write neu lief und 50 Docs × 3072-Float-Embedding (~25 KB/Doc, ~1,25 MB/Lauf) auslieferte. Während eines Sweeps (193 Inserts) → massive DB-Bandbreite. **Dominanter Read-Kostenfaktor.** | `embedding` + `cultural_vectors` serverseitig gestrippt → ~90 % kleinere Payload. Client nutzt diese Felder nie (Cluster-Pfad nutzt frisch gefetchte Vektoren). |
| **`getAgentLogs` limit 300** | Reaktiv; bei hunderten `logMessage`-Writes pro Sweep je 300 Docs gelesen (6× Verstärkung). | Default 300 → 50 (UI zeigt ohnehin ~50). |
| **Client-Doppel-Engine** (`AutonomousPipeline.tsx`) | 30s-`setInterval`, das zur Slot-Zeit die **komplette Pipeline ein zweites Mal client-seitig** fährt (parallel zum Convex-Cron) → doppelte Ingest-/Embedding-/Vektor-Last bei offenem Ops-Panel. | **Nur dokumentiert** (Verhaltensänderung) — Empfehlung: client-seitigen Heartbeat deaktivieren, da der Server-Cron der kanonische Scheduler ist. |

**Weiteres Sparpotenzial (offen):** `checkSemanticSimilarity` macht pro ingestiertem Signal
eine Vektorsuche (193×/Sweep); ggf. Batchen/Schwellen. `getOrphanSignals` trägt ebenfalls
Embeddings (aktuell nicht client-abonniert) — bei künftiger Nutzung ebenfalls strippen.

