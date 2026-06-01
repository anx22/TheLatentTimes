# The Latent Times — 10x Entscheidungs-Quiz (Session 1)
Date: 2026-06-01 | Begleitet `session-1.md`

> **Spielregel:** Jede Frage erklärt ein vorgeschlagenes Feature und bietet **Variante A**,
> **Variante B** oder **Verwerfen**. A und B sind keine „gut/schlecht"-Optionen, sondern zwei
> *ehrliche Implementierungs-Philosophien* mit unterschiedlichen Trade-offs. Deine Antworten
> fließen zurück ins Master-Dokument (Akte & Slices).
>
> Markiere pro Frage: **A** / **B** / **Verwerfen** (+ optional Notiz).

---

## Block I — Säule SCHAUSPIEL (zuschauen + eingreifen)

### Q1 — Spectator Newsroom *(Feature M1)*
**Erklärung:** Die arbeitende Redaktion wird vom unsichtbaren Backend zum sichtbaren Erlebnis —
man schaut den Agenten beim Extrahieren, Debattieren, Layouten zu. Das ist deine „leicht spielerische"
Kern-Idee. Assets (dormante Agenten, Bullpen, Missions) liegen schon im Code.
- **A — Ambient Activity Stream:** Ein leichter Live-Log/Ticker („Scout zieht 12 Signale", „Board
  debattiert *Sora-2*", „Designer setzt Cover"). Schnell baubar, read-only, ehrlich.
- **B — Cinematic Control Room:** Eine inszenierte Bühne — die fünf Räume leuchten auf, Agenten als
  Charaktere, Debatte streamt live. Maximales „Wow", deutlich mehr Aufwand & Design-Identität nötig.
- **Verwerfen:** Backend bleibt unsichtbar; Fokus nur auf das fertige Magazin.

### Q2 — Einfluss-Steuerung für Zuschauer *(Feature Med1)*
**Erklärung:** Aus „zuschauen" wird „mitspielen" — der Leser nimmt Einfluss auf den laufenden Loop.
Realisiert deinen Wunsch „sowohl zuschauen als auch Einfluss nehmen".
- **A — Lightweight Nudges:** Leser boosten ein Signal / schlagen ein Thema vor → biast die autonome
  Queue, ohne Kontrolle abzugeben. Niedrige Missbrauchsfläche.
- **B — Co-Director Mode:** Leser stimmen in Debatten mit, wählen Angles, kuratieren in der
  Freigabe-Queue mit. Tiefe Beteiligung, aber Governance/Missbrauch/Qualität zu lösen.
- **Verwerfen:** Einflussnahme bleibt dem Single-Operator („Director") vorbehalten.

### Q3 — Critics' Corner sichtbar *(Feature Med2 — verschenktes Asset)*
**Erklärung:** Die KI-Kritik an Artikeln wird **heute schon erzeugt**, aber nie gezeigt. Anschalten
macht das Magazin zum „lebenden Organismus" (`PRODUCT.md:14`).
- **A — Kritik als Annotation:** Kritiken erscheinen als Randnotizen am Artikel. Minimal, sofort.
- **B — Öffentliche Revisions-Schleife:** Kritik triggert sichtbare Überarbeitung; Artikel
  versioniert sich (v1 → v2), Leser sehen die Evolution.
- **Verwerfen:** Kritik bleibt internes Signal.

### Q4 — Echte Mehr-Runden-Debatte als Lesestoff *(Feature Med3)*
**Erklärung:** Heute ist die „Debatte" *ein* JSON-Call (REWRITE1 BULLPEN). Voraussetzung für ein
glaubwürdiges Schauspiel (Q1) ist echte Friktion. Backlog nennt das „Board Debate v2" (`NOW.md:13,44`).
- **A — Friction-Transcript intern:** Echte Mehr-Runden-Debatte, im Ops sichtbar, fürs Erlebnis genutzt.
- **B — Debatte als publiziertes Format:** Das Transkript wird selbst zum Leserartikel („wie dieser
  Artikel erstritten wurde") — Prozess als Content.
- **Verwerfen:** Ein-Call-Konsens beibehalten (billiger, aber „simuliert").

---

## Block II — Säule PLATTFORM (Distribution + Community)

### Q5 — Social-Distributions-Adapter: Storys posten *(Feature M2, Teil 1)*
**Erklärung:** Deine „ganz große Vision" — Adapter, die auf X/Reddit/Instagram spannende Storys
verteilen. Die Zeitung bringt sich selbst zu den Menschen.
- **A — Assistiert (Human-in-the-loop):** Agent entwirft den Post, Mensch gibt frei, dann raus.
  Sicher, ToS-konform, langsamer.
- **B — Autonom (im Guardrail-Rahmen):** Agent postet direkt nach Regeln/Quoten. Skaliert,
  höheres Reputations-/ToS-Risiko.
- **Verwerfen:** Keine aktive Social-Distribution.

### Q6 — Reply-Agent: eigenen Artikel schreiben & im Thread antworten *(Feature M2, Teil 2)*
**Erklärung:** Der kühnste Teil — Adapter finden relevante Threads/Artikel+Kommentare, schreiben
**selbstständig einen eigenen Artikel** zu diesem Gedankengang und posten ihn als Kommentar + Link.
- **A — Eine Plattform, eng & überwacht:** Start auf *einer* Plattform (z.B. Reddit oder X), enge
  Themen-Scopes, Mensch gibt die Artikel-Antwort frei. Lernschleife mit kontrolliertem Risiko.
- **B — Multi-Plattform-„Botschafter":** Mehrere autonome Adapter, die plattformübergreifend agieren.
  Maximale Reichweite, maximales Risiko (Spam-Wahrnehmung, Bans).
- **Verwerfen:** Kein autonomes Artikel-Posting in fremde Threads.

### Q7 — Citizen Desk: Community schreibt mit *(Feature M5)*
**Erklärung:** Leute steuern Gedanken/Links/wissenschaftliche Arbeiten bei; die Redaktion arbeitet damit.
Macht „community-gerichtet" real.
- **A — Submission-Inbox:** Schlichter Eingang → Beiträge fließen in den Signal-Pool, die Wire
  ingestiert sie wie eine Quelle. Minimal, schnell.
- **B — Voller Citizen Desk:** Beitragende erhalten Attribution; die Redaktion debattiert ihren Input
  und publiziert ggf. mit Credit. Bindung + Bewegung, aber Moderation/Qualität nötig.
- **Verwerfen:** Inbound bleibt rein maschinell (RSS/GitHub/Search).

### Q8 — Lead-Indicators-Digest *(Feature Med4)*
**Erklärung:** Ein wiederkehrendes Leser-Artefakt (die stärksten aufsteigenden Signale). Cadence =
Gewohnheit; löst das `PRODUCT.md:7`-Versprechen „stay ahead of the curve" ein.
- **A — Web/E-Mail-Digest:** Klassischer kuratierter Rhythmus-Digest.
- **B — Multi-Channel:** Digest + automatische Verteilung über die Social-Adapter (Q5).
- **Verwerfen:** Kein wiederkehrendes Digest-Format.

---

## Block III — Säule CHRONIK (Latent Space)

### Q9 — The Latent Space: Karte der Revolution *(Feature M3)*
**Erklärung:** Den Namen einlösen — eine navigierbare Karte, wie Signale zu Narrativen werden und über
Zeit driften. Embeddings dafür werden heute schon berechnet und weggeworfen.
- **A — Leser-Karte:** Öffentlich erkundbare „Karte der KI-Revolution" (Cluster/Narrative über Zeit). Signature-Erlebnis.
- **B — Director-Werkzeug:** Internes Explorations-Tool, um Stories/Lücken zu finden. Weniger Glanz, schneller Nutzen.
- **Verwerfen:** Latenter Raum bleibt rein internes Clustering-Mittel.

### Q10 — Makro / Meso / Tag-Ebenen der Chronik *(Feature M3-Erweiterung)*
**Erklärung:** Deine Vision: die Revolution „auf mittlerer und großer Ebene und teils von Tag zu Tag"
abbilden — die Zeitung, die in den Geschichtsbüchern stehen wird.
- **A — Altitude-Tagging:** Stories werden nach Ebene getaggt (Tag/Meso/Makro), Leser browsen nach Flughöhe.
- **B — Generierte „State of the Revolution"-Meta-Ausgaben:** Die Zeitung schreibt periodisch ihre
  eigene Geschichte (Wochen-/Monats-Synthese als eigenständige Ausgabe).
- **Verwerfen:** Nur Tagesgeschäft, keine explizite Ebenen-Logik.

---

## Block IV — Säule VERTRAUEN/BEWEIS + FUNDAMENT

### Q11 — Provenienz / Glass-Box pro Artikel *(Feature M4)*
**Erklärung:** Jeder Artikel zeigt seine Herkunftskette — der Vertrauens-Moat *und* der öffentliche
Beleg, dass autonome Agenten vertrauenswürdig arbeiten (dein Meta-Ziel). Voraussetzung, damit M2 nicht wie Spam wirkt.
- **A — Lightweight „Quellen + Claims":** Ein kompaktes Panel (Quellen, Atomic Claims). Schnell, ehrlich.
- **B — Volle Spur:** Signale → Debatten-Transkript → Entscheidung → Claims/Evidence → Text. Maximaler Beweis, mehr Aufwand.
- **Verwerfen:** Keine sichtbare Provenienz.

### Q12 — Honest-by-Default-Pass *(Features G1/G2/G4 — Quick Wins)*
**Erklärung:** Schein-Elemente raus, echte rein: echte Confidence statt `0.85+rand`, „Why this story?"-
Einzeiler, echte Dashboard-Zahlen (C1). Billig, kippt den Vertrauensbruch (U6) sofort.
- **A — Minimal:** Nur Schein-Confidence ersetzen + „Why this story?"-Zeile.
- **B — Voller Sweep:** Alle Schein-Metriken/toten Elemente UI-weit ehrlich machen.
- **Verwerfen:** Bleibt vorerst kosmetisch.

### Q13 — „Ein Gehirn" — die zwei Pipelines vereinen *(Fundament, Wette 1)*
**Erklärung:** Heute zwei parallele Redaktions-Pipelines (Client-Agenten ↔ Server-Cron, REWRITE1 A1).
Provenienz (Q11), Adapter (Q5/6) und Schauspiel (Q1) brauchen *eine* Wahrheit. Das ist das wichtigste
unsichtbare Fundament.
- **A — Agenten-Schicht extrahieren, Cron reused sie:** Wie im Master-Doc — sanft, vertikal, risikoarm.
- **B — Eine kanonische Server-Pipeline + Freigabe-Queue jetzt:** Größerer Refactor vorab, dafür sauberes
  Herzstück früher. Riskanter, aber weniger „auf Sand bauen".
- **Verwerfen:** Zwei Pipelines belassen (driften weiter auseinander — nicht empfohlen).

---

## Antwort-Sammelblatt
| # | Feature | A | B | Verwerfen | Notiz |
|---|---|---|---|---|---|
| Q1 | Spectator Newsroom | ☐ | ☐ | ☐ | |
| Q2 | Einfluss-Steuerung | ☐ | ☐ | ☐ | |
| Q3 | Critics' Corner sichtbar | ☐ | ☐ | ☐ | |
| Q4 | Echte Debatte | ☐ | ☐ | ☐ | |
| Q5 | Adapter: Storys posten | ☐ | ☐ | ☐ | |
| Q6 | Reply-Agent (Artikel im Thread) | ☐ | ☐ | ☐ | |
| Q7 | Citizen Desk | ☐ | ☐ | ☐ | |
| Q8 | Lead-Indicators-Digest | ☐ | ☐ | ☐ | |
| Q9 | Latent Space Karte | ☐ | ☐ | ☐ | |
| Q10 | Makro/Meso/Tag-Ebenen | ☐ | ☐ | ☐ | |
| Q11 | Provenienz/Glass-Box | ☐ | ☐ | ☐ | |
| Q12 | Honest-by-Default | ☐ | ☐ | ☐ | |
| Q13 | „Ein Gehirn" | ☐ | ☐ | ☐ | |
