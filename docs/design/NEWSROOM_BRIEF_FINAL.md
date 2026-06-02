# The Latent Times — Newsroom Design Brief

---

## Vision

Eine KI-Redaktion die selbstständig Zeitung macht. Du schaust zu, greifst ein wo es zählt.
Das Einzige was du wirklich kontrollierst: was rausgeht.

„Vogue meets Wired meets The Matrix" — high-fashion editorial, KI-native, keine Kompromisse.
Das Schauspiel der arbeitenden Maschine ist das Produkt, nicht das Ergebnis.

---

## Was immer sichtbar ist

- Welcher Raum aktiv ist — fünf Räume, jederzeit wechselbar
- Live-Aktivität der Agenten — was passiert gerade, welcher Agent tut was
- Modusschalter: Manual ↔ Autonomous — die wichtigste Systemeinstellung
- Pipeline-Fehler wenn etwas bricht

---

## Die vier Produktionsräume

### 1 — Signal-Raum *(Beispiel-Screen)*
Eingehende Signale aus der Welt. Nicht Quellen — Signale. Quellen sind Setup, kein Hauptinhalt.

Was hier passiert hängt vom Modus ab — siehe Methodologien unten.

### 2 — Debatten-Raum
Agenten diskutieren die Geschichte. Verschiedene Positionen, echter Widerspruch, kein Konsens-Automat. Du siehst das Transkript entstehen. Im Manualmodus kannst du die Richtung beeinflussen. Output: ein vereinbarter redaktioneller Blickwinkel.

*Heute MVP — wird massiv ausgebaut.*

### 3 — Visueller Raum
KI generiert Bilder und visuelle Richtung für den Artikel. Review, akzeptieren, neu generieren.

*Heute MVP — wird massiv ausgebaut.*

### 4 — Freigabe-Raum
Fertige Entwürfe warten hier. Headline, Body, Bild, Quellen. Drei Entscheidungen: freigeben, zurückschicken, ablehnen. Nichts geht ohne diesen Klick live. Die wichtigste Interaktion im System.

*Heute MVP — wird massiv ausgebaut.*

---

## Diagnostik

Kein Produktionsraum. System-Health, Agenten-Status, Metriken, Pipeline-Logs. Immer erreichbar, nie im Weg.

---

## Methodologien — wie der Signal-Raum sich verhält

Der Modus bestimmt fundamental was der Nutzer im Signal-Raum tut. Es werden mehr Modi kommen — die Grundarchitektur muss das tragen.

---

### Modus: Three-Zone (manuell)
Höchste Kontrolle. Der Nutzer dirigiert jeden Übergabepunkt.

Der Signal-Raum hat drei sequentielle Zonen:

**Zone 1 — Signal-Auswahl**
Ein Pool von bis zu 20 aktuellen Signalen. Der Nutzer wählt manuell welche er weiterverfolgt — 3 bis N Stück. Optional markiert er eines als Anker-Signal (für Copyright-Compliance). Auswahl wird mit einer Aktion in Zone 2 geschickt.

**Zone 2 — Semantischer Arbeitstisch**
Ausgewählte Signale auf einem Arbeitstisch. Das System generiert mehrere Story-Blickwinkel zur Auswahl. Optional: Legal-Compliance-Check (Atomic Claims aus dem Anker-Signal extrahieren, Ähnlichkeits-Audit). Nutzer gibt eine redaktionelle Direktive ein, wählt Blickwinkel aus, triggert das Drafting.

**Zone 3 — Übergabe**
Generierte Entwürfe landen als Karten — bereit für den Debatten-Raum oder direkt in die Freigabe-Queue.

---

### Modus: Autonomous
Keine Kontrolle nötig — die Maschine läuft. Cron feuert 3× täglich.

Der Signal-Raum zeigt den laufenden Prozess in vier Phasen:

**Ingest** — alle aktiven Quellen werden abgefragt, neue Signale gespeichert, Duplikate gefiltert.

**Discover** — Signale werden zu Story-Clustern gruppiert. Cluster nach Resonanz gerankt.

**Debate** — der stärkste Cluster geht in eine Agenten-Debatte. Konsens-Blickwinkel entsteht.

**Draft** — Artikel wird geschrieben, landet mit Status „Ausstehend" in der Freigabe-Queue.

Der Nutzer schaut zu, kann eingreifen, muss aber nicht. Am Ende öffnet er die Freigabe-Queue und findet fertige Entwürfe.

---

### Modus: Chronological *(konzeptionell, noch nicht aktiv)*
Ein einziges Thema über Zeit. Nutzer wählt ein Wurzel-Thema, das System hängt laufend passende neue Signale als chronologische Updates an einen lebenden Artikel.

---

## Die Agenten — ihre Rollen

Agenten haben Namen und Charakter. Ihre Aktivität ist sichtbar — keine Black Box.

| Agent | Rolle |
|---|---|
| Scout | Durchsucht Quellen, bewertet Relevanz |
| Curator | Clustert Signale, rankt Stories |
| Editor | Trifft redaktionelle Entscheidungen |
| Columnist | Schreibt den Artikel |
| Critic | Hinterfragt Entwürfe |
| Art Director | Visuelle Entscheidungen |
| Publisher | Qualitätsprüfung, Übergabe |

---

## Harte Constraints

- Kein Artikel erscheint ohne menschliche Freigabe — nie, kein Sonderfall
- Manual ↔ Auto Schalter immer sichtbar und zugänglich
- Quellenverwaltung ist Setup-Panel — kein Hauptinhalt im Signal-Raum
- Agenten-Aktivität immer sichtbar irgendwo im Chrome
- Leere States ehrlich benennen — kein Fake-Content, keine erfundenen Metriken
