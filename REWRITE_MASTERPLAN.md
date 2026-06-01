# The Latent Times — REWRITE MASTERPLAN
Stand: 2026-06-01 · Status: **verbindliche Richtungswahl** (Analyse/Plan, keine Implementierung)

> **Was dieses Dokument ist.** Die *eine* Quelle der Wahrheit für den Rewrite. Es führt vier bisher
> getrennte Stränge zusammen:
> 1. **Audit** — schichtweiser Code-Audit (REWRITE1, 5 Schichten) → §8 Audit-Referenz
> 2. **Hochlevel-Strategie** — drei systemische Brüche, drei Wetten → §4
> 3. **10x-Vision** — vier Säulen (`.claude/docs/ai/the-latent-times/10x/session-1.md`) → §1
> 4. **13 Entscheidungen** — Feature-Quiz (`…/10x/session-1-quiz.md`) → §5
>
> Es **ersetzt** die verstreute Plan-Notiz und ist ab jetzt der Bezugspunkt für jede Slice-Planung.
> `PRODUCT.md` bleibt die Marken-/Feature-Vision; dieses Dokument ist der *Bau- und Reihenfolgeplan*.

---

## 1. North Star — vier Säulen

> **The Latent Times ist die community-gerichtete Chronik der KI-Revolution — eine voll-autonome
> Agenten-Redaktion, der man beim Zeitungmachen zuschaut und in die man eingreift, und die ihre Storys
> selbst dorthin trägt, wo die Menschen sind. Sie beweist nebenbei, dass autonome Agenten in einer echten
> Nische auf höchstem Niveau publizieren können.**

| Säule | Was sie bedeutet | Kern-Hebel |
|---|---|---|
| **SCHAUSPIEL** | Die arbeitende Redaktion ist die Attraktion — zuschauen *und* eingreifen | Cinematic Newsroom, Co-Director, sichtbare Kritik & Debatte |
| **CHRONIK** | Die KI-Revolution auf Makro-/Meso-/Tagesebene kartographieren — „Geschichtsbücher" | The Latent Space (Leser-Karte), Meta-Ausgaben |
| **VERTRAUEN / BEWEIS** | Provenienz als Moat *und* öffentlicher Beleg, dass autonome Agenten vertrauenswürdig arbeiten | Glass-Box, Honest-by-Default, ein Gehirn |
| **PLATTFORM** | Die Zeitung kommt zu den Menschen + die Community schreibt mit | Distributions-Adapter (gated), Citizen Desk |

**Der Meta-Beweis** (das Warum hinter dem Warum): zeigen, dass voll-autonome, agentenbasierte Workflows
in einer echten Nische — News-Aggregation + echtes Artikelschreiben + Layouten auf hohem Niveau — funktionieren.

---

## 2. Hartes Leitprinzip: „Autonom innen, Mensch-gated außen"

- **Innen läuft die Zeitung voll autonom.** Agenten ingestieren, clustern, debattieren, entwerfen,
  layouten — eigenständig, im Dauerloop.
- **Alles, was nach außen geht, ist NICHT autonom** (vorerst): jeder Social-Post, jede Thread-Antwort,
  jeder an die Welt publizierte Artikel braucht **Human-in-the-Loop-Freigabe**.
- **Begründung:** Die Welt hasst KI-Spam. Wir spammen nicht. Outbound-Vertrauen muss *verdient* werden.
- **Volle Outbound-Autonomie = Zukunfts-Meilenstein** (§7), erst *nachdem* sich die Zeitung über
  Qualität, Provenienz und Track-Record bewiesen hat.

Dieses Prinzip überschreibt die Quiz-Antwort Q6 von „autonom" auf **„autonom entworfen, menschlich
freigegeben"** (Multi-Plattform-Scope bleibt) und macht die Spannung Q6×Q11×Q5 obsolet.

---

## 3. Arbeitsprinzipien
- **Von der Vision her** bauen, nicht vom Ist-Zustand.
- **Vertikale Slices** mit sichtbarem Ergebnis — kein „Fundament" ohne Resultat.
- **Ein Gehirn / eine Wahrheit** — eine kanonische Pipeline, keine Doppel-Engines.
- **Honest by default** — kein UI-Element ohne echte Daten/echte Aktion.
- **Tiefe vor Breite** — Raum für Raum, über Monate.
- **Autonom innen, Mensch-gated außen** (§2).
- **Provenienz als Beweis** — die Arbeit ist immer zeigbar.

---

## 4. Die drei systemischen Brüche (Diagnose)
Der Code scheitert nicht an Einzel-Bugs, sondern an drei Wurzeln:

1. **Zwei Gehirne.** Zwei parallele Redaktions-Pipelines (Client-Agenten ↔ Server-Cron) ohne
   gemeinsames Gehirn → jedes Feature wird doppelt gebaut, „Wahrheit" driftet. *(Audit A1)*
2. **Unehrliche Oberfläche.** Schein-Confidence, Stock-Bilder, tote Buttons, hängende Wirings,
   theatrale Regler → es *sieht* fertig aus, *tut* aber nicht, was es zeigt. *(Audit U1–U9, C1)*
3. **Schlafende Seele.** Echte Debatte, lebendes Magazin, kohärente Bildsprache, nachvollziehbare
   Intention — existieren nur in Fragmenten. Die Vision ist geschrieben, läuft aber nicht. *(Audit Schicht 5)*

**Die drei Wetten dagegen:** (1) *Ein Gehirn + Freigabe-Queue* · (2) *Ehrlich per Default* · (3) *Seele anschalten*.

---

## 5. Verbindliche Entscheidungen (aus dem Quiz, mit §2-Override)

| # | Feature | Entscheidung | Akt |
|---|---|---|---|
| Q13 | „Ein Gehirn" | **kanonische Server-Pipeline + Freigabe-Queue ZUERST** | I (1. Slice) |
| Q12 | Honest-by-Default | **voller UI-weiter Sweep** | I |
| Q11 | Provenienz/Glass-Box | **Lightweight (Quellen + Atomic Claims)** — Gate ist die Sicherheit, Provenienz das Leser-Vertrauen | I→II |
| Q4 | Debatte | **echte Mehr-Runden-Debatte, intern/erlebnisseitig** (nicht als eigener Artikel) | II |
| Q1 | Spectator Newsroom | **Cinematic Control Room** | III |
| Q2 | Einfluss-Steuerung | **Co-Director Mode** (Leser stimmen mit/kuratieren) | III |
| Q3 | Critics' Corner | **öffentliche Revisions-Schleife** (Artikel versioniert sich) | III |
| Q9 | The Latent Space | **öffentliche Leser-Karte** | III |
| Q10 | Chronik-Ebenen | **generierte Meta-Ausgaben** (Makro/Meso/Tag) | III |
| Q5 | Adapter: Storys posten | **assistiert (Mensch gibt frei)** | IV |
| Q6 | Reply-Agent (Artikel im Thread) | **Multi-Plattform, aber autonom *entworfen* / menschlich *freigegeben*** *(per §2)* | IV |
| Q7 | Citizen Desk | **voller Desk (Attribution + Debatte)** | IV |
| Q8 | Lead-Indicators-Digest | **Web/E-Mail** | IV |

**Roadmap-Folge aus Q13 B:** Das „eine Gehirn" wandert nach vorn — aber als **erster sichtbarer Slice
von Akt I** (kanonische Pipeline + Freigabe-Queue, die sofort *eine* echte Ausgabe trägt), **nicht** als
stille Vorab-Phase ohne Ergebnis (treu zu „vertikale Slices").

---

## 6. Roadmap — vier Akte (Tiefe vor Breite)

### AKT I — „Eine makellose Ausgabe" auf kanonischem Kern
**Beweis: Tiefe + ehrlicher Kern.** Ein Mensch dirigiert *eine* Ausgabe vom Signal bis zum gedruckten,
visuell starken, nachvollziehbaren Magazin — auf einem Fundament, das hält.
- **Slice 1 — Kanonisches Gehirn + Freigabe-Queue** *(Q13 B, Wette 1, behebt A1/A3)*: transport-agnostische
  Agenten-Schicht (`callModel`-Interface), die Client **und** Cron aufrufen; Maschine erzeugt Entwurf →
  **Freigabe-Queue** → Mensch publiziert. Das Herzstück, das alles Spätere braucht.
- **Slice 2 — Honest Magazine** *(Q12 B, Wette 2)*: Schein-Confidence raus (U6), echte Metriken (C1),
  Darkroom-Bild propagieren (U1), Grid-Layout persistieren (U5), Legal-Gate tatsächlich koppeln (U3),
  `issues.content`-Validator (Validated Boundaries).
- **Slice 3 — Lightweight-Provenienz** *(Q11 A)*: „Quellen + Atomic Claims"-Panel pro Artikel — erster
  Glass-Box-Baustein, Leser-Vertrauen ab Tag 1.
- **Guardrails mitgezogen:** S1 (Action-Auth/Rate-Limit — P0), S4 (Key-Hygiene), C2 (Embedding-Dim-Guard).

### AKT II — „Ein Motor, dem man vertraut" (autonomer Innenbetrieb)
**Beweis: Autonomie *innen* + Vertrauen.** Der Loop läuft unbeaufsichtigt & verlässlich — und füllt die
Freigabe-Queue mit nachvollziehbaren Entwürfen. Hier wird „die Zeitung läuft voll autonom (innen)" wahr.
- **Explainable Wire** *(A2)*: deterministische Vektor-Korrelation fürs Gruppieren, LLM nur fürs
  Benennen/Synthese; **Intent-Trace** („warum gehören diese Signale zusammen").
- **Echte Mehr-Runden-Debatte** *(Q4 A)*: statt *einem* JSON-Call echte Friktion zwischen Personas —
  erlebnisseitig genutzt (Vorstufe fürs Schauspiel).
- **Provenienz vertieft** *(Q11)*: die Kette Signale→Debatte→Entscheidung→Claims wird durchgängig erfasst.
- **Guardrails:** S2 (Signal-Cache, Zero-Token-Prinzip), C5 (Token-Telemetrie ehrlich).

### AKT III — „Lebendiges Redaktionshaus" (Schauspiel + Chronik)
**Beweis: Erlebnis + Chronik — die Seele, öffentlich & lebendig.**
- **Cinematic Newsroom** *(Q1 B)*: die fünf Räume leuchten auf, Agenten als Charaktere, Debatte streamt live.
- **Co-Director** *(Q2 B)*: Leser boosten Signale, schlagen Angles vor, stimmen in Debatten mit, kuratieren
  in der Freigabe-Queue mit *(alles innen — bleibt §2-konform)*.
- **Living Magazine** *(Q3 B)*: Critics' Corner als öffentliche Revisions-Schleife (v1→v2).
- **The Latent Space** *(Q9 A)*: öffentlich erkundbare Karte der KI-Revolution.
- **Chronik-Ebenen** *(Q10 B)*: generierte „State of the Revolution"-Meta-Ausgaben (Makro/Meso/Tag).
- **Visual Supremacy:** Art-Direction-Profile/Moodboards (Glitch/Brutalist/Swiss), komponierbares Layout (U8).

### AKT IV — „Die Zeitung kommt zu den Menschen" (Distribution + Community, Mensch-gated)
**Beweis: Reichweite + Bewegung.** *Erst nach* dem Vertrauens-Fundament, weil Outbound ohne Provenienz
zu Spam würde.
- **Distributions-Adapter** *(Q5 A / Q6 §2)*: Agenten *entwerfen* autonom Posts & Thread-Antwort-Artikel,
  finden relevante Threads — **jeder Outbound wird menschlich freigegeben**. Multi-Plattform-Scope (X/Reddit/Insta).
- **Citizen Desk** *(Q7 B)*: Community steuert Links/Papers/Gedanken bei; die Redaktion debattiert sie,
  publiziert ggf. mit Attribution. Moderation + Gate verpflichtend.
- **Lead-Indicators-Digest** *(Q8 A)*: wiederkehrendes Web/E-Mail-Artefakt (Cadence = Gewohnheit).

---

## 7. Zukunfts-Meilenstein (post-Akt IV)
**Volle Outbound-Autonomie.** Wenn die Zeitung über Monate bewiesen hat: hohe Artikelqualität, lückenlose
Provenienz, sauberer Track-Record auf den Plattformen — *dann* dürfen ausgewählte Outbound-Pfade vom
Human-Gate auf autonom-im-Rahmen umgestellt werden. Bis dahin: Gate ist Pflicht.

---

## 8. Audit-Referenz (REWRITE1, kondensiert — den Akten zugeordnet)
> Bereits behoben (ausgeschlossen): Convex-Verbindung/Build · Cron-Crash A1(`completeMission`) ·
> Drafting A2(`getStory`) · Read-Usage/Embeddings · Newsroom-Auth+Read-only · Client-Doppel-Heartbeat ·
> Modell-Alias-Zentralisierung · `frontendApi` @ts-nocheck · gebrandeter Leerzustand · Netlify-Env-Hygiene.

| Code | Befund (Kurz) | Schwere | Adressiert in |
|---|---|---|---|
| **S1** | Gemini-Actions öffentlich ohne Auth → unbegrenzte Kosten | **P0** | Akt I (Guardrail) |
| **A1** | Doppelte Pipeline (Client ↔ Cron) | Kritisch | Akt I Slice 1 |
| **U1** | Darkroom-Bildvorschau hängt | Kritisch | Akt I Slice 2 |
| **C1** | `getDeepInsight` liefert hartkodiert 0 | Hoch | Akt I Slice 2 |
| **C2** | Embedding-Dim-Mismatch (768 vs 3072) | Hoch | Akt I (Guardrail) |
| **U2** | „Pause/Resume Core" UI-only | Hoch | Akt I/II |
| **U3** | Legal-Guardrails von Draft entkoppelt | Hoch | Akt I Slice 2 |
| **U4** | `chronological`-Methodik = Stub | Hoch | Backlog (Stub bleibt) |
| **U5** | Grid-Layout nicht persistiert | Hoch | Akt I Slice 2 |
| **A2** | Verstreute/unsync. Schwellen; generativ statt erklärbar | Mittel | Akt II |
| **A3** | `GoogleGenAI` inline statt zentralem Transport | Mittel | Akt I Slice 1 |
| **A4** | Tote/dormante Agenten exportiert, nicht verdrahtet | Mittel | Akt II/III |
| **U6** | Schein-Confidence/Stock-Bilder/statischer Ticker | Mittel | Akt I Slice 2 |
| **U8** | 18 Templates ohne Kompositions-UI | Mittel | Akt III |
| **S2** | Vektorsuche pro Signal, kein Cache | Mittel | Akt II |
| **S3** | `NewsroomProvider` mountet auf jeder Seite | Mittel | Akt I/II |
| **S4** | Write-fähiger Convex-Key non-secret in Netlify | Mittel | Akt I (Guardrail) |
| **C3** | `drafts.storyId` als `v.string()` + `as any` | Mittel | Akt I/II |
| **C4** | `getNewsClusters` hartkodiert `limit=1` | Mittel | Akt II |
| **C5** | Token-Recording schluckt Fehler still | Niedrig | Akt II |
| **Schicht 5** | Vision-Drift: `v.any()`-Grenzen, simulierte Debatte, fehlende Moodboards, unsichtbare Kritik | div. | Akte I–III |

**Cross-Cutting-Wurzeln:** (1) zwei Wahrheiten → ein Gehirn · (2) UI↔DB-Desync → ehrliches UI ·
(3) ungetypte Grenzen `v.any()` → Schema-Verträge · (4) vorgetäuschte Funktion → Honest-Pass ·
(5) Vision dormant → Vision-Realisierung.

---

## 9. Verifikation / nächster Schritt
Reine Analyse — keine Code-Änderung. Audit + Vision + Entscheidungen sind konsolidiert.
**Nächster Schritt nach Freigabe:** **Akt I, Slice 1** (kanonisches Gehirn + Freigabe-Queue) als ersten
ausführbaren Arbeitsblock detaillieren — konkrete Dateien, `callModel`-Interface-Schnitt,
Queue-Schema, Akzeptanzkriterien — zusammen mit den P0/P1-Guardrails (S1, S4, C2).
