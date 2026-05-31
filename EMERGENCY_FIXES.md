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
- `checkSemanticSimilarity`: eine **Vektorsuche pro ingestiertem Signal** (≈193/Sweep) → batchen
  oder Schwelle/Sampling.
- `getOrphanSignals` trägt noch Embeddings (aktuell nicht client-abonniert) → strippen, falls je genutzt.
- `getAllDrafts`/`getMissions` reaktiv mit Defaults prüfen.
**Aufwand:** S–M.

### EF-6 · Produktions-Leerzustände
**Problem:** `issues = 0` live → öffentliche Seite zeigt „No Articles Published Yet". Für einen
echten Launch braucht es mindestens eine kuratierte publizierte Ausgabe oder eine ansprechende
Landing statt Leerzustand.
**Fix:** Genesis-Issue mit echtem Inhalt seeden oder Landing-Fallback gestalten.
**Aufwand:** S.

---

## 🔴 P2 — Direkt nach Launch / Aufräumen

- **EF-7 · Netlify-Hygiene:** verwaiste UI-Env-Vars entfernen (`VITE_CONVEX_URL` ohne Region —
  von `netlify.toml` überschrieben; `CONVEX_DEPLOY_KEY` — ungenutzt). *(Aktuell durch Netlify-MCP-502
  blockiert.)*
- **EF-8 · `.env` in Alt-Historie:** Branches `claude/eloquent-planck-KFxPA` / `vercel/…` enthalten
  ggf. noch `.env` in der History (enthielt nur `VITE_CONVEX_URL`, kein Geheimnis). Alt-Branches
  schließen/löschen.
- **EF-9 · `@ts-nocheck`-Inseln** (`crons.ts`, `frontendApi.ts`, `autonomousActions.ts`) — Typsicherheit
  dort blind; mittelfristig auflösen.
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
