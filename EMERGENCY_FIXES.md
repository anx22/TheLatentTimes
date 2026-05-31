# EMERGENCY FIXES — Weg zur Produktionsreife

> Abgeleitet aus `CODEBASE_ANALYSIS.md` (statisch + live verifiziert) und dem
> Review-Wissen dieser Session. Stand: 2026-05-31, Branch `claude/intelligent-mayer-PHjEf`.
>
> ⚠️ **Hinweis zum „Review-Dokument":** Ich habe das gesamte Repo, alle Remote-Branches
> (`main`, `claude/eloquent-planck-KFxPA`, `vercel/…`), GitHub-Issues/PRs und das
> Container-Dateisystem durchsucht. Es existiert **keine separate Review-MD**. Das einzige
> Review-Artefakt ist `CODEBASE_ANALYSIS.md` (diese Session). Falls du ein eigenes
> Review-Dokument meinst, bitte einfügen/pushen — ich arbeite es dann ein.

Skala: **P0** = blockiert Produktion / kostet aktiv Geld / kaputt · **P1** = wichtig vor Launch ·
**P2** = direkt danach. Status: ✅ erledigt diese Session · 🔴 offen.

---

## ✅ Bereits erledigt & live (Funktionsfähigkeit hergestellt)
Diese Punkte machten die App „läuft nur stellenweise" → jetzt grundsätzlich funktionierend:

| # | Fix | Status |
|---|---|---|
| E1 | **Frontend ↔ Backend verbunden** — `VITE_CONVEX_URL` (regional `eu-west-1`) gesetzt; öffentliche Seite war komplett blind (Config-Error-Screen) | ✅ live |
| E2 | **Netlify-Build repariert** — `npm run build` statt `convex deploy --cmd` (Dev-Key-403) | ✅ live |
| E3 | **Autonomer Cron-Crash (A1)** — `completeMission`-tokenUsage-ArgError | ✅ live |
| E4 | **Autonomes Drafting (A2)** — Story-Lookup über `getNewsClusters` (limit=1) verfehlte → kein Artikel; `getStory` ergänzt | ✅ live |
| E5 | **Read-Bandbreite** — `getSignals` ohne Embeddings (−90 %), `getAgentLogs` 300→50 | ✅ live |

---

## ✅ Umgesetzt (Auth-Session)
- **EF-2 erledigt:** PW-only Newsroom-Auth. Passwort **server-verifiziert** (`convex/auth.ts`,
  `NEWSROOM_PASSWORD` in Convex-Env, nie im Bundle); Login-Leiste in `NewsroomFloor`.
  **Read-only-Modus** für Anon über *einen* zentralen Choke-Point (`NewsroomContext`-Guard,
  deny-by-default: alle Nicht-`set*`-Funktionen werden No-Ops) → refactor-fest. Zusätzlich
  Persist/Seed-Writes für Anon gesperrt. `useAuth()` fällt **fail-closed** auf read-only.
- **EF-3 erledigt:** Client-Doppel-Engine-Heartbeat entfernt (Server-Cron kanonisch).
- **EF-4 erledigt:** Modell-Aliasse zentralisiert (`convex/models.ts` + `constants.ts MODELS`),
  alle Literale in Transport/Actions/Agenten umgestellt.
- **EF-1 (Teil/Restrisiko):** Die soft wall stoppt anonyme/versehentliche Kosten über die UI.
  Die Convex-Actions bleiben technisch direkt per URL aufrufbar (bewusst im Scope „nur Newsroom
  PW, Rest ungeschützt"). Echte serverseitige Härtung (per-User-Auth / Rate-Limit) bleibt offen.

## 🔴 P0 — Echte Emergencies (vor jeder öffentlichen Nutzung)

### EF-1 · Offene, unauthentifizierte, bezahlte KI-Endpunkte  ⟵ größtes Risiko
**Problem:** `convex/gemini.ts` exportiert `generateText/generateImage/editImage/generateEmbedding/searchTrend`
als **public `action`** ohne Auth. Die Deployment-URL ist seit dem Connection-Fix **im öffentlichen Bundle**.
→ Jeder kann mit der URL direkt `api.gemini.generateImage` etc. aufrufen und **unbegrenzt deinen
Gemini-Key + Convex-Usage verbrennen**. Das ist auch ein Haupttreiber deiner Kostenbeobachtung.
**Fix (Stufen):**
1. *Sofort-Mitigation:* serverseitiges **Rate-Limiting / Tageskontingent** pro IP/Session in den
   Gemini-Actions (Convex-Tabelle als Zähler) + harte Token-Obergrenze pro Call.
2. *Richtig:* **Auth einführen** (siehe EF-2) und in jeder Action `ctx.auth.getUserIdentity()`
   prüfen; ohne Identity → ablehnen.
3. *Alternativ/ergänzend:* KI-Actions auf `internalAction` umstellen und nur über
   authentifizierte, gerätelimitierte Wrapper aufrufen.
**Aufwand:** M (Mitigation S, Auth M).

### EF-2 · Keine Authentifizierung (Mock-Session, offenes Ops-Panel)
**Problem:** `App.tsx` nutzt eine hartkodierte Mock-Session; das komplette Newsroom-/Ops-Panel
(triggert teure Multi-Agent-Pipelines, publiziert Inhalte, löscht Daten via `resetNewsroom`/`clearAll`)
ist für **jeden Besucher** der public URL offen. Produktionsblocker.
**Fix:** Convex Auth (z. B. `@convex-dev/auth` Password/OAuth) einführen; Ops-Routen + gefährliche
Mutations hinter Identity-Check; öffentliche Seite read-only für Anonyme.
**Aufwand:** M. **Abhängigkeit:** löst auch EF-1 Stufe 2.

### EF-3 · Client-Doppel-Engine (Kostenmultiplikator)
**Problem:** `AutonomousPipeline.tsx` fährt per 30s-`setInterval` zur Slot-Zeit die **komplette
Pipeline ein zweites Mal client-seitig** — parallel zum Convex-Cron. Bei offenem Ops-Panel doppelte
Ingest-/Embedding-/Token-Last. Zudem doppelte „Wahrheit".
**Fix:** Client-Heartbeat entfernen/deaktivieren; Server-Cron ist der kanonische Scheduler.
Manuelle Trigger-Buttons bleiben.
**Aufwand:** S.

---

## 🔴 P1 — Wichtig vor Launch

### EF-4 · Modell-Aliasse zentralisieren
**Problem:** 10+ verstreute Modell-Literale (`gemini-3-flash-preview`, `gemini-2.5-flash-image`,
`gemini-embedding-2`, und `gemini-2.5-pro` in `agentWorkbench` — teuer, umgeht die Fallback-Ladder).
Eine Modell-Deprecation bricht viele Call-Sites; Kostenkontrolle erschwert.
**Fix:** Eine `MODELS`-Konstante (z. B. in `constants.ts`/`convex/models.ts`), alle Call-Sites darauf
umstellen. (Modelle funktionieren live — kein Crash, aber Wartungs-/Kostenrisiko.)
**Aufwand:** S–M.

### EF-5 · Weiteres Read/Compute-Sparpotenzial
- ✅ `getOrphanSignals` + `getSignal`: Embeddings/Vektoren gestrippt, Over-fetch `*5`→`*3` (erledigt).
- 🔴 `checkSemanticSimilarity`: eine **Vektorsuche pro ingestiertem Signal** (≈193/Sweep) → batchen
  oder Schwelle/Sampling (offen, größerer Eingriff).
- 🔴 `NewsroomProvider` hängt an jeder öffentlichen Seite (~13 Live-Queries) → nur bei offenem
  Ops-Panel mounten (offen, Refactor).
**Aufwand:** Rest S–M.

### EF-6 · Produktions-Leerzustände  ✅ erledigt
Bare „No Articles Published Yet"-Box ersetzt durch eine gebrandete „Genesis Issue is being
composed"-Landing (`App.tsx`). (Optional weiter: echte erste Ausgabe kuratieren/seeden.)

---

## 🔴 P2 — Direkt nach Launch / Aufräumen

- **EF-7 · Netlify-Hygiene:** ✅ verwaiste UI-Env-Vars `VITE_CONVEX_URL` (nicht-regional) und
  `CONVEX_DEPLOY_KEY` (ungenutzt) gelöscht. 🔴 Rest: `depl_key_claudecode` (write-fähiger Convex-
  Dev-Deploy-Key, **non-secret** in Netlify gespeichert, vom Build nicht mehr genutzt) — löschen
  oder rotieren+als-secret markieren. Sicherheits-/Kostenrelevant (EF-1-nah).
- **EF-8 · Alt-Branches:** 🔴 `claude/eloquent-planck-KFxPA` (Ancestor von main → redundant) und
  `vercel/setup-vercel-speed-insights-in-rwyfz2` (geschlossener Bot-PR) löschen. **Manuell nötig** —
  der Managed-Git-Proxy lehnt Delete-Refspecs ab; per GitHub-UI entfernen.
- **EF-9 · `@ts-nocheck`-Inseln:** ✅ `frontendApi.ts` entschärft (Typcheck wieder aktiv).
  🔴 Rest: `crons.ts`, `autonomousActions.ts`, `clusteringActions.ts` (risikoreicher — `any`-lastig).
- **EF-10 · Dev- vs. Prod-Deployment:** Öffentliche Seite hängt an einem **Dev**-Convex-Deployment
  (`dev:adamant-mastiff-745`). Für Produktion echtes Prod-Deployment + Prod-Deploy-Key + `convex deploy`
  im CI etablieren.

---

## Empfohlene Reihenfolge
1. **EF-2 + EF-1** zusammen (Auth einführen → schließt die offenen KI-Endpunkte). Höchste Priorität:
   Sicherheit **und** Kosten.
2. **EF-3** (Doppel-Engine aus) — schneller Kosten-Win.
3. **EF-4 / EF-5** (Modelle zentral, Compute senken).
4. **EF-6** (Leerzustand), dann **EF-10** (Prod-Deployment).

> Danach: **großer Audit** (Architektur, Major-Bugs, Inkonsistenzen, **massive UX-Verbesserungen**)
> als eigene Phase — Scope separat planen.
