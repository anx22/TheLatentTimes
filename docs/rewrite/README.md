# Implementation Hub — The Latent Times
> **Echter Einstieg ist `AGENTS.md` (Repo-Root)** — das 5-Datei-Backbone
> (AGENTS/PRODUCT/ARCHITECTURE/NOW/DECISIONS) ist die immer-aktive Schicht. **Dieser Hub ist das
> untergeordnete Rewrite-Modul**, auf das `docs/NOW.md` für Task-Status zeigt. Der Masterplan sagt
> *was & warum*; diese Mappe sagt *wie, in welcher Reihenfolge, und wie weit wir sind*.
> Eine Quelle pro Fakt: Vision → `docs/PRODUCT.md`, Regeln → `docs/ARCHITECTURE.md`, Rewrite-Tasks → `TRACKING.md`.

## Dokumentenkarte
| Datei | Zweck | Wann lesen |
|---|---|---|
| `REWRITE_MASTERPLAN.md` | North Star, 4 Säulen, 4 Akte, 13 Entscheidungen, Leitprinzip | Einmal, zur Orientierung |
| `COVERAGE.md` | North-Star→Task-Matrix + **erkannte Lücken**. Der „ist alles abgebildet?"-Beweis | Vor Planungsänderungen |
| `TRACKING.md` | **Lebendes Board** — eine Zeile pro Task, Status, Blocker | Bei jeder Session, **Pflicht-Update** |
| `ACT-1…4.md` | Detail-Tasks pro Akt: Was, echte Dateien, Akzeptanzkriterien, Abhängigkeiten | Vor Implementierung eines Tasks |
| `10x/session-1*.md` | Vision-Herleitung + Entscheidungs-Quiz (Begründungs-Archiv) | Bei „warum so?"-Fragen |

## Arbeitsprotokoll (verbindlich für alle Sessions)
1. **Orientieren:** `TRACKING.md` öffnen → nächsten Task mit Status `TODO` und erfüllten `depends-on` wählen.
   Reihenfolge folgt den Akten (I → IV); innerhalb eines Akts den Slices.
2. **Verstehen:** den Task in der `ACT-x.md` lesen (Akzeptanzkriterien + echte Dateipfade + Audit-Codes).
3. **Status setzen:** in `TRACKING.md` auf `IN-PROGRESS` (+ kurze Session-Notiz/Datum).
4. **Bauen:** *vertikaler Slice* — sichtbares Ergebnis, kein Fundament ohne Resultat. Akzeptanzkriterien erfüllen.
5. **Leitprinzip wahren:** **autonom innen, Mensch-gated außen** — kein Outbound ohne Human-Freigabe (siehe Masterplan §2).
6. **Abschließen:** Status `REVIEW`→`DONE`, Notiz mit Commit-SHA. Falls neue Erkenntnis die Planung ändert:
   `COVERAGE.md` + betroffene `ACT-x.md` anpassen **und im selben Commit**.
7. **Blockiert?** Status `BLOCKED`, Grund + benötigte Entscheidung in die Task-Notiz; im Zweifel den Menschen fragen.

## Konventionen
- **Task-ID:** `T-<Akt>.<Slice>.<Seq>` → z.B. `T-1.1.2` (Akt 1, Slice 1, Task 2). IDs sind stabil, nie neu vergeben.
- **Status-Legende:** `TODO` · `IN-PROGRESS` · `BLOCKED` · `REVIEW` · `DONE` · `PARKED` (bewusst zurückgestellt).
- **Audit-Codes** (S1/A1/U1/C1…) referenzieren `REWRITE_MASTERPLAN.md §8` und den Original-Audit.
- **Branch:** Entwicklung immer auf `dev` (langlebiger Dev-Branch); `main` = Release. Nie direkt auf `main`.
- **Keine Doku-Drift:** Plan und Code dürfen nie auseinanderlaufen — Doku-Update gehört in denselben Commit wie der Code.

## Prinzipien (Kurzform — Details im Masterplan §3)
Von der Vision her · vertikale Slices · ein Gehirn/eine Wahrheit · honest by default · Tiefe vor Breite ·
**autonom innen, Mensch-gated außen** · Provenienz als Beweis · **Reuse vor Neubau** (erst prüfen, was schon existiert).
