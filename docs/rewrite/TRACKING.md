# TRACKING — lebendes Board
> **Single source of progress.** Jede Session aktualisiert hier Status + Notiz (siehe `README.md`
> Arbeitsprotokoll). Status: `TODO · IN-PROGRESS · BLOCKED · REVIEW · DONE · PARKED`.
> Detail je Task in `ACT-1…4.md`. Stand initial: 2026-06-01.

**Übersicht:** 62 Tasks · 34 TODO · 1 IN-PROGRESS · **3 BLOCKED** (Mensch-Entscheidung) · 0 REVIEW · 24 DONE
**Nächster Task:** **Akt-II-Kleinkorrekturen DONE** (`T-2.2.2`/`T-2.2.3`/`T-2.5.1`/`T-2.5.2`/`T-2.6.2`). Akt I inhaltlich durch (außer `T-1.0.4` Prod-Deploy = **braucht Mensch/Convex-Zugänge** + gestopptem Cockpit-Redesign `T-1.4.3`). Nächste substanzielle Brocken: **Explainable Wire** `T-2.1.1`→`T-2.1.2`/`T-2.1.3` (deterministisches Clustern) + **echte Debatte** `T-2.3.1`. (`T-1.2.0`/`T-3.3.0`/`T-4.0.1` BLOCKED.)
**Blocker, die der Mensch entscheiden muss:** `T-1.2.0` (Design-Baseline) · `T-3.3.0` (Identität/Governance) · `T-4.0.1` (Plattform-Wahl).

## Akt I — Makellose Ausgabe
| ID | Task | Status | Depends | Audit/Note |
|---|---|---|---|---|
| T-1.0.1 | Gemini-Actions absichern | DONE | — | **S1/P0** — Session-Token-Gate + Per-Session-Rate-Cap. **Live verifiziert** auf `adamant-mastiff-745`: Negativ (Fremd-Token → `Unauthorized` abgelehnt) + Positiv (Passwort→Token-Mint→`generateText`="OK"). genai 2.x live OK, `sessions`-Tabelle deployed. |
| T-1.0.2 | Netlify-Key-Hygiene | DONE | — | S4/EF-7 — `depl_key_claudecode` (write-fähiger Convex-Key, `is_secret:false`/Klartext, vom Build ungenutzt) via Netlify-MCP gelöscht. Einzige Env-Var; keine weiteren Stray-Vars. Build unberührt (`VITE_CONVEX_URL` via `netlify.toml`). ⚠️ Key-Wert war exponiert → **rotieren empfohlen**. |
| T-1.0.3 | Embedding-Dim-Guard | DONE | — | C2 — `assertEmbeddingDim` wirft jetzt (jeder Call, nicht once-only); `generateEmbedding` guardet primär+Fallback → 768-dim kann 3072-Index nicht mehr korrumpieren. FE-Build + convex deploy/typecheck grün. |
| T-1.0.4 | Echtes Prod-Deployment | TODO | — | EF-10/P1 |
| T-1.1.1 | Agenten-Schicht extrahieren | DONE | — | A1/A3 — `services/agents/modelClient.ts` (reine, transport-agnostische Schicht mit injizierbarem `ModelTransport` + `callJsonAgent`/`safeGenerateContent`/`Schemas`/`Type`). `services/gemini.ts` = Client-Adapter (injiziert Convex-Transport, re-exportiert). 20 Agenten → `./modelClient`; alle ohne React/DOM = convex-bündelbar. FE-Build grün. |
| T-1.1.2 | Cron reused Schicht | DONE | T-1.1.1 | A1/A3 — `autonomousActions` nutzt jetzt `EditorialOrchestrator` + geteilte Agenten (Debatte→Columnist→Editor) statt Inline-Prompts; injizierter Server-`ModelTransport` (GoogleGenAI + Token-Telemetrie); Embeddings via geteilte `generateEmbedding` (→ T-1.0.3-Guard greift auch im Cron). `convex dev --once` typecheckt+bündelt die ganze Schicht grün. Live-Editorial-Run bestätigt sich bei Autonomie-an (Super-Switch/Cron). |
| T-1.1.3 | Freigabe-Queue (drafts.status) | DONE | T-1.1.2 | Wette 1 — `PrintingPress` IST die Queue: zeigt nicht-publizierte Drafts, badged `review` als „Autonomous Draft", Approve (→`addItemToLatestIssue`+`updateDraftStatus 'published'`)/Reject (→`deleteDraft`) = bewusste Mensch-Klicks. Cron speist sie jetzt (T-1.1.2). ⚠️ Approve-Flow fabriziert noch Unsplash-Bild/Fake-Comments/Fake-Score → **U6/T-1.2.4**. |
| T-1.1.4 | Lauf-Deduplizierung | DONE | T-1.1.2 | A5 — TTL-Lock (`tryDiscoveryLock`/`releaseDiscoveryLock`, key `discovery_lock`) zentral in `discoverStories` (beide Pfade); try/finally. Live getestet: acquire→true, gehalten→false, nach release→true. |
| T-1.2.0 | Design-Baseline | **BLOCKED** | Mensch | Lücke G3 |
| T-1.2.1 | Echte Metriken | DONE | — | C1 — `getDeepInsight` zählt jetzt echt: Stories via `collect` (klein), Signals via `take(501)`/"500+" (Embeddings → unbegrenztes Lesen teuer). Live: signals 280, narrativePillars 12, activeSources 29. |
| T-1.2.2 | Darkroom-Bild propagieren | DONE | — | U1 — Root-Cause: `atelierState` (inkl. `currentImageBase64` + `history[].base64`, je mehrere MB) wurde komplett in `newsroom_state` persistiert → sprengt Convex' ~1-MB-Dokumentlimit → `saveNewsroomState` wirft → GESAMTE Persistenz (auch `imageId`) bricht still, daher „Bild propagiert nicht" nach Reload. Fix: `sanitizeAtelierForPersist` strippt Base64-Payloads vor dem Speichern; Asset überlebt via persistiertem `imageId`→`data.image` (Darkroom rendert bereits `image`). |
| T-1.2.3 | Grid-Layout persistieren | DONE | T-1.2.6 | U5. Neue Mutation `updateLatestIssueLayout` (patcht `content.layout`, via T-1.2.6 validiert). `MagazineGrid` persistiert nur auf `onDragStop`/`onResizeStop` (nicht beim Mount-Fire) und **nur für Editoren** (`canEdit` gegated Drag/Resize/Handle → kein Anon-Abuse). Reorder überlebt Reload via App-`getLatestIssue`. |
| T-1.2.4 | Schein-Metriken entfernen | DONE | — | U6 — Approve-Flow (PrintingPress): Unsplash-Stockfoto, erfundener `score{}` & zwei Fake-Comments ("The Board"/"The Editor") raus; nutzt jetzt echtes Darkroom-Bild oder keins (`media_type`→'text'). Pipeline: Random-"Confidence" (`0.85+rand`) raus. `usePublicationFlow`: hartkodierter `score` raus. Ticker war bereits als dekorativ kommentiert. **Offen (Design):** `picsum`-Platzhalter greifen jetzt bei bildlosen Artikeln → typografische "kein Bild"-Behandlung im Design-Pass. |
| T-1.2.5 | Legal-Gate koppeln | DONE | — | U3 — `runSimilarityAudit` loggte nur PASSED/FAILED, blockierte aber nichts. Jetzt hartes Gate in `usePublicationFlow.publish`: bei aktivierten Guardrails + Seed-Draft muss der UrhG-Audit gelaufen & ≥70% sein, sonst `setError` + Block (mit `recommendation`). Non-Seed-Drafts ungated (keine Quelle zum Kopieren); Toggle = explizites Opt-out. Deckt beide Publish-Pfade (`publish` + `executeFullPipeline`). |
| T-1.2.6 | issues.content-Validator | DONE | — | Validated Boundaries. **Boundary-Validator** `convex/newsroom/issueContent.ts` statt strikter Table-Schema (gespeicherte Shape divergiert vom Typ → `ticker`-Feld; strikt würde Legacy-Patches brechen). Prüft kritischen Vertrag (`meta`/`cover`-Objekte, `items`/`layout`-Arrays mit `i,x,y,w,h`) an allen 3 Write-Stellen (`publishIssue`, `addItemToLatestIssue` Patch+Genesis). |
| T-1.2.7 | NewsroomProvider-Scope | DONE | — | S3. `isActive`-Flag (= `showNewsroom`) durch `NewsroomProvider`→`useNewsroomState`→`useNewsroomData` gefädelt; alle 11 Live-Queries via Convex-`"skip"` deaktiviert solange Ops zu. Öffentliche Seite liest Context nicht (verifiziert) + hat eigene `getLatestIssue` in `App.tsx`. Auto-Seed durch `dbSourcesResult!==undefined`-Guard geschützt. |
| T-1.2.8 | Pause/Resume echt | DONE | T-1.1.2 | U2 — `enginePaused` war reiner lokaler `useState` (kosmetisch). Jetzt persistenter Flag: `setAutonomyPaused`-Mutation → eigene `newsroom_state`-Zeile `autonomy_control`; Cron `runScheduledAutonomousRun` prüft `control.paused` → skippt Sweep. UI liest/schreibt via Convex-Hooks. Live-Round-Trip verifiziert (true→false). |
| T-1.3.1 | Provenienz-Panel (light) | DONE | T-1.2.5, T-1.1.3 | Q11 A — **Glass-Box v1.** Serialisierbarer `ArticleProvenance`-Snapshot (sources+claims) am Item, beim Publish erfasst — nie fabriziert. Path 1 (ThreeZone): echte Seed-/Independent-Quellen + atomare Claims aus `usePublicationFlow`. Path 2 (PrintingPress/autonom): Server (`addItemToLatestIssue`) leitet Quellen aus den Story-Signals ab (`storyId`), Claims leer (ehrlich). Panel in `ArticleDetail` (ersetzt fabrizierte „Technical Specs") + dezenter `Ns·Mc`-Indikator auf Grid-Karten. Beide Pfade tragen provenance via `agentLayoutDesigner`/Server ins `layout[].data` → überlebt Reload. |
| T-1.4.0 | Cockpit-UX-Audit + Richtung | DONE | — | G7 — Audit in `docs/rewrite/UI-AUDIT.md`. **Entscheid (Mensch):** Redesign unterwirft sich **kreativ komplett der editorialen Produkt-Grammatik** (Paper/Ink, Playfair/Inter, Crimson/Emerald), bleibt aber **funktional auf vorhandenen Logiken & High-Level-Flows** (Step-Machine, Räume, Pipelines, Wiring unverändert). Fundament existiert teils schon (`tailwind.config.js`, Fonts in `index.html`). |
| T-1.4.1 | Editorial-Token-Fundament + Primitives | DONE | T-1.4.0 | Tokens in `tailwind.config.js` (ink/crimson/signal/hairline/paper-*) + `NewsroomUI` komplett umgeskinnt (Button/Label/Panel/Header/alle Cards) auf Paper/Ink/Crimson/Emerald + Playfair-Titel; neuer `EmptyState`-Primitive; Focus-Rings + aria. APIs/Logik 1:1. |
| T-1.4.2 | Shell + Navigation umskinnen | DONE | T-1.4.1 | `NewsroomFloor` (Masthead „The Latent Times" Playfair, Tab-Nav mit Crimson-Unterstreichung + `aria-current`, Sub-Navbar, Log-Sidebar, Error-Banner, Bottom-Bar) + `NewsroomAuthBar` + App-„Ops"-Button editorial; Standby-Sackgasse → `EmptyState`+CTA; Purple/Orange-Raumfarben → Crimson (Restraint). Logik/Flows 1:1. |
| T-1.4.3 | Räume umskinnen + Defekte (①–⑧) | IN-PROGRESS | T-1.4.2 | **Exemplare fertig:** `TheBullpen` + `TheDarkroom` editorial. **Offen:** Wire/`ThreeZonePipeline`, `PrintingPress`, `AutonomousPipeline`, `ObservabilityDashboard`, `SignalSourcingBar` — Dichte/Responsivität/A11y/States, Logik erhalten. |

## Akt II — Motor, dem man vertraut
| ID | Task | Status | Depends | Audit/Note |
|---|---|---|---|---|
| T-2.1.1 | Deterministisches Gruppieren | TODO | T-1.1.2 | A2 |
| T-2.1.2 | LLM nur Benennen | TODO | T-2.1.1 | A2 |
| T-2.1.3 | Intent-Trace-Artefakt | TODO | T-2.1.1 | Traceable Intent |
| T-2.1.4 | Dormante Agenten verdrahten | TODO | — | A4 |
| T-2.2.1 | centroid_embedding befüllen | TODO | T-2.1.1 | Lücke G4 |
| T-2.2.2 | getNewsClusters-Limit | DONE | — | C4 — `const limit=1` → `args.limit ?? 20`. Einziger Aufrufer (Wire) bekam still nur 1 Cluster; Cron nutzt längst `getStory`. Stories sind wenige → Default 20 günstig. |
| T-2.2.3 | drafts.storyId typisieren | DONE | — | C3 — `drafts.storyId` `v.string()`→`v.id("stories")` + `saveDraft`-Arg getypt, `as any` raus. Werte verifiziert real: Cron-`targetStoryId` durch `getStory({id:v.id("stories")})` bewiesen, UI nutzt `selectedStoryId`. tsc/build grün (Hook-`data` ist `any` → keine FE-Brüche; Laufzeit-FK greift). |
| T-2.3.1 | Mehr-Runden-Debatte | TODO | T-1.1.1 | Q4 A |
| T-2.3.2 | Personas differenziert | TODO | T-2.3.1 | — |
| T-2.4.1 | Volle Provenienz-Kette | TODO | T-1.3.1 | Q11 |
| T-2.5.1 | Validatoren (Rest v.any) | DONE | — | Schicht 5 — **Boundary-Validatoren** `convex/newsroom/contracts.ts` (wie T-1.2.6) statt strikter Table-Schemas: `drafts.blocks` (Array v. {id, sentences:[{id,text}]} — `type` bleibt freier String wg. „text"/LLM-Varianz; Vertrag deckt sich exakt mit `Schemas.Columnist`-required → kein Writer bricht), `missions.metadata` (Objekt, diagnostic-erweiterbar), `newsroom_state.data` (Objekt — polymorph über Keys `current`/`discovery_lock`/`autonomy_control`, strikt unmöglich). Verdrahtet in `saveDraft`/`startMission`/`saveNewsroomState`. Table bleibt bewusst `v.any()` (Extra-Feld-Toleranz). |
| T-2.5.2 | @ts-nocheck entfernen | DONE | T-1.1.2 | EF-9 — `@ts-nocheck` raus aus `crons.ts` (sauber via getypte `api`/`internal`-Refs statt `makeFunctionReference`+`as any`), `clusteringActions.ts` (expliziter Handler-Returntyp bricht die `api`-Selbstreferenz-Zirkularität TS7022/7023 → löste alle 7 Folgefehler), `autonomousActions.ts` (war nach T-1.1.2-Umbau bereits typsicher, Direktive veraltet). convex codegen + tsc + build grün. (`testing.ts` nicht im Scope.) |
| T-2.6.1 | Signal-Cache | TODO | T-1.1.2 | S2 |
| T-2.6.2 | Token-Telemetrie ehrlich | DONE | — | C5 — `recordUsage`-Catch schluckt nicht mehr still: bei Fehler Best-Effort-`flagTelemetryGap` → `missions.tokenUsageIncomplete=true`; Dashboard zeigt „⚠ partial" statt einer still-falschen Summe als autoritativ. Generation wird nie geblockt (Telemetrie-only). |

## Akt III — Lebendiges Redaktionshaus
| ID | Task | Status | Depends | Audit/Note |
|---|---|---|---|---|
| T-3.1.1 | Live-Aktivitätsstrom | TODO | T-1.2.1 | Q1 B |
| T-3.1.2 | Fünf Räume als Bühne | TODO | T-3.1.1 | Q1 B |
| T-3.1.3 | Agenten als Charaktere | TODO | T-2.1.4 | Q1 B |
| T-3.2.1 | Draft-Versionierung | TODO | — | Q3 B |
| T-3.2.2 | Critics' Corner sichtbar | TODO | T-3.2.1 | Q3 B |
| T-3.3.0 | Identität/Governance | **BLOCKED** | Mensch | Lücke G2 |
| T-3.3.1 | Signal boosten/Angle | TODO | T-3.3.0 | Q2 B |
| T-3.3.2 | In Debatte mitstimmen | TODO | T-3.3.0 | Q2 B |
| T-3.3.3 | Queue mitkuratieren | TODO | T-3.3.0, T-1.1.3 | Q2 B |
| T-3.4.0 | Zeitreihen-Design | TODO | — | Lücke G1 |
| T-3.4.1 | Embeddings sichtbar | TODO | T-2.2.1 | Q9 A |
| T-3.4.2 | Leser-Karte (UI) | TODO | T-3.4.0, T-1.0.3 | Q9 A |
| T-3.5.1 | Altitude-Tagging | TODO | — | Q10 B |
| T-3.5.2 | Meta-Ausgaben-Generator | TODO | T-1.2.6 | Q10 B |
| T-3.6.1 | Art-Direction-Profile | TODO | T-1.2.0 | Visual Supremacy |
| T-3.6.2 | Komponierbares Layout | TODO | — | U8 |

## Akt IV — Die Zeitung kommt zu den Menschen
| ID | Task | Status | Depends | Audit/Note |
|---|---|---|---|---|
| T-4.0.1 | Plattform-Spike | **BLOCKED** | Mensch | Lücke G5 |
| T-4.1.1 | Outbound-Modell + Queue | TODO | — | §2 Human-Gate |
| T-4.1.2 | Freigabe-UI (Outbound) | TODO | T-4.1.1 | §2 |
| T-4.2.1 | Story-Post-Drafter | TODO | T-4.1.1 | Q5 A |
| T-4.2.2 | Thread-Reply-Drafter | TODO | T-4.1.1, T-4.0.1 | Q6 (gated) |
| T-4.3.1 | Submission-Inbox | TODO | — | Q7 B |
| T-4.3.2 | Moderation/Gate | TODO | T-4.3.1 | Q7 B |
| T-4.3.3 | Attribution + Debatte | TODO | T-4.3.1 | Q7 B |
| T-4.4.1 | Digest-Generator | TODO | — | Q8 A |
| T-4.4.2 | Zustellung Web/E-Mail | TODO | T-4.4.1 | Q8 A |

---
## Änderungslog (Sessions tragen hier ein)
- 2026-06-01 — Board initial angelegt aus REWRITE_MASTERPLAN + COVERAGE. Alle Tasks `TODO`/`BLOCKED`.
- 2026-06-01 — +2 Tasks aus Alt-Datei-Extraktion: `T-1.0.4` Prod-Deployment (EF-10), `T-2.5.2` @ts-nocheck (EF-9).
  EF-8 (Alt-Branches) → `NOW.md` Tech-Debt (manuell). CODEBASE_ANALYSIS/EMERGENCY_FIXES gelöscht.
- 2026-06-01 — `T-1.0.1` → REVIEW: Session-Token-Gate für die 5 Gemini-Actions (S1/P0). Passwort-Check mintet
  jetzt ein Server-Token (`sessions`-Tabelle); jede Action ruft `consumeRateBudget` (Auth + 120/min-Cap).
  Client (`services/gemini.ts` + `AuthContext`) hängt Token an. FE-Build grün, `tsc -p convex` 0 Fehler.
  Cron-Pipeline ungestört (nutzt eigenen `GoogleGenAI`, nicht diese Actions). Struktur-Entscheidung → `docs/DECISIONS.md`.
  Offen: Live-Deploy-Verifikation (CONVEX_DEPLOY_KEY war entgegen Übergabe NICHT in der Env).
- 2026-06-01 — `T-1.0.1` → **DONE**: CONVEX_DEPLOY_KEY gesetzt; `convex dev --once` deployte 1df574c auf
  `adamant-mastiff-745` (`sessions.by_token`-Index angelegt, Functions/Typecheck durch → genai 2.x live bestätigt).
  Gate live getestet: Negativ (Fremd-Token abgelehnt) + Positiv (Passwort→Token→`generateText`="OK"). ⚠️ Hinweis:
  Live-Seite (Build aus `main`) sendet noch keinen Token → ihre Newsroom-Gemini-Calls brechen bis main den Token-
  Client hat (vom Nutzer akzeptiert; Dev-Deployment = de-facto-Prod, EF-10/T-1.0.4 offen).
- 2026-06-01 — `T-1.0.3` → **DONE** (C2): `assertEmbeddingDim` von log-only/once-only auf echten Throw (jeder Call)
  umgestellt; `convex/gemini.ts generateEmbedding` guardet beide Rückgabepfade (`../lib/vector` bündelt convex-seitig).
  FE-Build + `convex dev --once` grün. → Slice 0 hier abgeschlossen; Slice-0→1-Grenze erreicht.
- 2026-06-01 — `T-1.0.2` → **DONE** (S4/EF-7): Netlify-MCP (intermittierende 502, auf Retry erfolgreich) →
  `depl_key_claudecode` (write-fähiger Klartext-Convex-Key, Build-ungenutzt) aus der Netlify-Env gelöscht;
  es war die einzige Var. Build unberührt. Diagnose: MCP weder veraltet noch fehlbedient — transiente
  Cloudflare-Origin-502 (Reads/Writes auf Retry ok). ⚠️ exponierten Key rotieren. **Slice 0 vollständig.**
- 2026-06-01 — **Slice 1 gestartet.** `T-1.1.1` → DONE (A1/A3): reine `services/agents/modelClient.ts` extrahiert
  (injizierbarer `ModelTransport`, `callJsonAgent`/`safeGenerateContent`/`Schemas`/`Type`/`cleanAndParseJSON`).
  `services/gemini.ts` → Client-Adapter (injiziert gegateten Convex-Transport via `setModelTransport`, re-exportiert
  alles → Client-Importe unverändert). 20 Agenten von `'../gemini'` auf `'./modelClient'` umgebogen; alle rein
  (kein React/DOM) → convex-bündelbar. FE-Build grün. Nächst: `T-1.1.2` (Cron reused die Schicht statt Inline-Nachbau).
- 2026-06-01 — `T-1.1.2` → DONE (A1/A3): `autonomousActions.ts` neu — injiziert einen Server-`ModelTransport`
  (GoogleGenAI serverseitig, Token-Telemetrie via `ctx`) und treibt `EditorialOrchestrator` + die geteilten
  Agenten statt der drei Inline-Prompts (Embed/Debatte/Columnist). Embeddings laufen durch die geteilte
  `generateEmbedding` → T-1.0.3-Dim-Guard schützt jetzt auch Cron-Writes. **Die zweite Pipeline ist eliminiert
  — ein Gehirn.** `convex dev --once` deployte + typecheckte die gesamte geteilte Schicht (Orchestrator + 20
  Agenten) grün auf den Server. Offen: End-to-End-Live-Lauf bei Autonomie-an (Super-Switch/Cron; State-Blob
  nicht per CLI getoggelt wg. Full-Replace-Clobber-Risiko). Nächst: `T-1.1.3` (Freigabe-Queue-UI) + `T-1.1.4` (Dedup).
- 2026-06-01 — **Slice 1 KOMPLETT.** `T-1.1.3` → DONE: `PrintingPress` war bereits eine funktionierende
  Freigabe-Queue (nicht-publizierte Drafts, Approve/Reject als Mensch-Klick) und wird durch T-1.1.2 jetzt mit
  echten `review`-Drafts gespeist; Akzeptanz erfüllt. Approve-Flow-Unehrlichkeit (Unsplash/Fake-Comments/Score)
  → U6/T-1.2.4 weitergetragen. `T-1.1.4` → DONE (A5): TTL-Discovery-Lock zentral in `discoverStories`, live
  getestet (acquire/block/release). **Akt I: Slice 0 + Slice 1 fertig (7 DONE).** Nächst: Slice 2 „Honest Magazine".
- 2026-06-03 — **Slice 2 technische Resttasks DONE:** `T-1.2.6` (issues.content-Boundary-Validator), `T-1.2.7`
  (NewsroomProvider-Scope via `"skip"`), `T-1.2.3` (Grid-Layout persistieren, editor-gated). Redesign (`T-1.4.3`)
  auf Mensch-Wunsch gestoppt (Parallel-Session übernimmt).
- 2026-06-03 — **Slice 3 DONE:** `T-1.3.1` Glass-Box-Provenienz v1. `ArticleProvenance`-Snapshot (sources+claims)
  am Item beim Publish; Path 1 echte Seed/Independent-Quellen + atomare Claims, Path 2 (autonom) Server-Ableitung
  aus Story-Signals (Claims leer = ehrlich). Panel in `ArticleDetail` ersetzt fabrizierte „Technical Specs",
  Indikator auf Grid-Karten. tsc + convex codegen + build grün.
