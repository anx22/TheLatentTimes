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

## Antwort-Sammelblatt — *ausgefüllt 2026-06-01*
| # | Feature | Entscheidung | Charakter |
|---|---|---|---|
| Q1 | Spectator Newsroom | **B — Cinematic Control Room** | maximales Erlebnis |
| Q2 | Einfluss-Steuerung | **B — Co-Director Mode** | tiefe Beteiligung |
| Q3 | Critics' Corner sichtbar | **B — Revisions-Schleife** | lebender Organismus |
| Q4 | Echte Debatte | **A — intern** | Erlebnis, nicht publiziert |
| Q5 | Adapter: Storys posten | **A — assistiert** | Mensch gibt frei |
| Q6 | Reply-Agent (Artikel im Thread) | **B — Multi-Botschafter** | autonom, multi-plattform |
| Q7 | Citizen Desk | **B — voller Desk** | Attribution + Debatte |
| Q8 | Lead-Indicators-Digest | **A — Web/E-Mail** | klassischer Kanal |
| Q9 | Latent Space Karte | **A — Leser-Karte** | öffentliches Signature-Feature |
| Q10 | Makro/Meso/Tag-Ebenen | **B — Meta-Ausgaben** | schreibt eigene Geschichte |
| Q11 | Provenienz/Glass-Box | **A — Lightweight** | Quellen + Claims |
| Q12 | Honest-by-Default | **B — voller Sweep** | UI-weit ehrlich |
| Q13 | „Ein Gehirn" | **B — kanonische Pipeline jetzt** | Fundament zuerst |

---

## Synthese der Entscheidungen

**Muster:** Du baust die **maximalistische Version** von *Erlebnis* (Q1/Q2/Q3 alle B), *Community*
(Q7 B), *Chronik* (Q9 A-Leser / Q10 B) — auf einem **bewusst solide vorab gebauten Kern** (Q13 B) —
moderierst aber das **nach-außen-Risiko** an genau zwei Stellen (Q5 assistiert, Q8 klassischer Digest).

**Innere Stimmigkeit (stark):** Q13 B ist die konsequente Folge des Rests. Cinematic Newsroom,
Co-Director, autonome Adapter und Provenienz brauchen *eine Wahrheit* — also das kanonische Herzstück
**zuerst** zu bauen, ist kohärent (auch wenn es vom „nur vertikale Slices, keine Fundament-Phase"-
Prinzip des Master-Dokuments abweicht → **bewusste Roadmap-Änderung**, in §6/Akt-Struktur nachzuziehen).

**Drei Spannungen, die wir bewusst auflösen sollten:**
1. **🔴 Q6 (autonom, multi-plattform, eigene Artikel in fremde Threads) × Q11 (nur Lightweight-
   Provenienz) × Q5 (Storys posten nur assistiert).** Das ist die **riskanteste Kombination** im ganzen
   Set: das *gefährlichere* Verhalten (autonom ganze Artikel posten) ist mutiger gewählt als das
   *harmlosere* (Storys posten), und gleichzeitig ist der Schutzmechanismus (Provenienz) der leichtere.
   → Empfehlung: Für den **Q6-Pfad** entweder Provenienz auf **B (volle Spur)** heben *oder* Q6 anfangs
   eng starten (eine Plattform, Freigabe), bis Vertrauen+Qualität bewiesen sind. **Vor Akt IV entscheiden.**
2. **🟡 Q4 (Debatte intern) × Q1/Q2 (cinematic + Leser stimmen in Debatten mit).** Wenn Leser in
   Debatten mitstimmen und alles cinematisch sichtbar ist, *ist* die Debatte de facto öffentlich —
   „intern" heißt dann nur „nicht als eigener Artikel verpackt". Reconcilebar, aber benennen.
3. **🟡 Q13 B (großer Vorab-Refactor) × Akt I „eine makellose Ausgabe zuerst".** B verschiebt Gewicht
   nach vorn auf das Fundament. Das ist ok, solange Akt I nicht monatelang auf das Pipeline-Herzstück
   wartet → Empfehlung: kanonische Pipeline + Freigabe-Queue als **erster Slice von Akt I**, nicht als
   vorgeschaltete Phase ohne sichtbares Ergebnis.

**Resultierende North-Star-Form:** Erlebnis-maximal, Community-offen, Chronik-öffentlich, auf solidem
Kern — mit *einer* offenen Sicherheitsfrage (Spannung 1), die vor dem Bau von Akt IV zu klären ist.

## Nächster Schritt
- [ ] **Spannung 1 entscheiden** (Q6-Autonomie vs. Provenienz-Tiefe) — einzige echte Inkonsistenz.
- [ ] **Master-Doc updaten**: Akt IV „Distribution + Community" + Q13-B-Fundament als erster Slice + die
      13 Entscheidungen als verbindliche Richtungswahl einarbeiten.
