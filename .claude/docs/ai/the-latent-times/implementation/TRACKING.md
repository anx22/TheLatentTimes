# TRACKING — lebendes Board
> **Single source of progress.** Jede Session aktualisiert hier Status + Notiz (siehe `README.md`
> Arbeitsprotokoll). Status: `TODO · IN-PROGRESS · BLOCKED · REVIEW · DONE · PARKED`.
> Detail je Task in `ACT-1…4.md`. Stand initial: 2026-06-01.

**Übersicht:** 56 Tasks · 53 TODO · 0 IN-PROGRESS · **3 BLOCKED** (Mensch-Entscheidung) · 0 DONE
**Nächster Task:** `T-1.0.1` (S1 Action-Auth, P0) — keine Abhängigkeiten.
**Blocker, die der Mensch entscheiden muss:** `T-1.2.0` (Design-Baseline) · `T-3.3.0` (Identität/Governance) · `T-4.0.1` (Plattform-Wahl).

## Akt I — Makellose Ausgabe
| ID | Task | Status | Depends | Audit/Note |
|---|---|---|---|---|
| T-1.0.1 | Gemini-Actions absichern | TODO | — | **S1/P0** |
| T-1.0.2 | Netlify-Key-Hygiene | TODO | — | S4 |
| T-1.0.3 | Embedding-Dim-Guard | TODO | — | C2 |
| T-1.1.1 | Agenten-Schicht extrahieren | TODO | — | A1/A3 |
| T-1.1.2 | Cron reused Schicht | TODO | T-1.1.1 | A1 |
| T-1.1.3 | Freigabe-Queue (drafts.status) | TODO | T-1.1.2 | Wette 1 |
| T-1.1.4 | Lauf-Deduplizierung | TODO | T-1.1.2 | A5 |
| T-1.2.0 | Design-Baseline | **BLOCKED** | Mensch | Lücke G3 |
| T-1.2.1 | Echte Metriken | TODO | — | C1 |
| T-1.2.2 | Darkroom-Bild propagieren | TODO | — | U1 |
| T-1.2.3 | Grid-Layout persistieren | TODO | T-1.2.6 | U5 |
| T-1.2.4 | Schein-Metriken entfernen | TODO | — | U6 |
| T-1.2.5 | Legal-Gate koppeln | TODO | — | U3 |
| T-1.2.6 | issues.content-Validator | TODO | — | Validated Boundaries |
| T-1.2.7 | NewsroomProvider-Scope | TODO | — | S3 |
| T-1.2.8 | Pause/Resume echt | TODO | T-1.1.2 | U2 |
| T-1.3.1 | Provenienz-Panel (light) | TODO | T-1.2.5, T-1.1.3 | Q11 A |

## Akt II — Motor, dem man vertraut
| ID | Task | Status | Depends | Audit/Note |
|---|---|---|---|---|
| T-2.1.1 | Deterministisches Gruppieren | TODO | T-1.1.2 | A2 |
| T-2.1.2 | LLM nur Benennen | TODO | T-2.1.1 | A2 |
| T-2.1.3 | Intent-Trace-Artefakt | TODO | T-2.1.1 | Traceable Intent |
| T-2.1.4 | Dormante Agenten verdrahten | TODO | — | A4 |
| T-2.2.1 | centroid_embedding befüllen | TODO | T-2.1.1 | Lücke G4 |
| T-2.2.2 | getNewsClusters-Limit | TODO | — | C4 |
| T-2.2.3 | drafts.storyId typisieren | TODO | — | C3 |
| T-2.3.1 | Mehr-Runden-Debatte | TODO | T-1.1.1 | Q4 A |
| T-2.3.2 | Personas differenziert | TODO | T-2.3.1 | — |
| T-2.4.1 | Volle Provenienz-Kette | TODO | T-1.3.1 | Q11 |
| T-2.5.1 | Validatoren (Rest v.any) | TODO | — | Schicht 5 |
| T-2.6.1 | Signal-Cache | TODO | T-1.1.2 | S2 |
| T-2.6.2 | Token-Telemetrie ehrlich | TODO | — | C5 |

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
