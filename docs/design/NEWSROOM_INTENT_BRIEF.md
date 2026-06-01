# The Latent Times — Newsroom Intent Brief
*Für Claude Design · Stand 2026-06-01 · Rev 2*

> **Ziel dieses Dokuments:** Nicht die UI vorschreiben. Die *Absicht* hinter jedem Raum so klar machen, dass das Design von selbst die richtigen Entscheidungen trifft.

---

## Was ist dieser Ort?

Ein **autonomer Nachrichtenraum**. Echte KI-Agenten ingestieren laufend Signale aus der Welt, diskutieren sie, entwerfen Artikel, layouten sie — und warten dann auf einen Menschen, der auf Publish drückt.

Der Mensch, der diesen Raum betritt, ist **Chefredakteur einer Redaktion aus Maschinen**. Er dirigiert nicht jeden Schritt — er *schaut zu*, greift ein wo es wichtig ist, und gibt am Ende frei.

**Das Schauspiel ist die Attraktion.** Die arbeitende Maschine soll erlebt werden — nicht versteckt.

---

## Die Räume — Eine Anmerkung zu Namen und Status

**Namen sind nicht fix.** Die aktuellen Bezeichnungen (Wire, Bullpen, Darkroom, Printing Press) sind journalistische Metaphern aus der alten Zeitungswelt — "Old World → New World" ist die Tonalität. Kreative Umbenennungen sind willkommen, solange die Funktion klar bleibt.

**Drei der vier Produktionsräume sind im MVP-Zustand:** Bullpen, Darkroom und Printing Press haben heute minimale Funktionen. Sie werden später massiv ausgebaut. Das Design soll *Raum für Wachstum lassen* — die Architektur überdauert den MVP.

---

## Die Produktionslogik — der Fluss

```
WELT              →   SIGNAL-RAUM       →   DEBATTEN-RAUM     →   VISUELLER RAUM
Signale kommen         Agenda setzen,         Angle debattieren,     Bild- und
rein (laufend)         Signal auswählen       Entscheidung finden    Stimmung erzeugen

         →   PRODUKTIONS-/FREIGABE-RAUM       →   PUBLIZIERT
              Layout + Menschenklick                erst nach Freigabe
```

**Dieser Fluss ist der Dreh- und Angelpunkt des gesamten Newsrooms.** Wo bin ich im Prozess? Was kam vorher, was kommt als nächstes? Das muss immer spürbar sein.

---

## Die Betriebsmodi (Methodologien)

> **Hinweis:** Die aktuellen drei Modi sind Work-in-Progress. Es werden mehr folgen. Die *Atome* (Agenten, Schritte, Übergaben) bleiben gleich — aber wie sie kombiniert, gesteuert und sequenziert werden, unterscheidet sich massgeblich. Das Design muss den Modus als **zentrale, sichtbare Einstellung** behandeln.

---

### Modus 1: Three-Zone (manuell, höchste Kontrolle)

**Charakter:** Der Mensch steuert jeden Übergabepunkt. Die Maschine führt aus, der Mensch entscheidet wann und wohin es weitergeht.

**Ablauf in drei physischen Zonen:**

**Zone 1 — Signal Mosaic:**
Der Mensch sichtet einen Pool von bis zu 20 aktuellen Signalen in einer dichten Übersicht. Er wählt manuell 3 bis N Signale aus, die er weiterverfolgen will. Optional markiert er eines als "Seed" — das Anker-Signal für Copyright-Compliance-Prüfungen. Mit "Send to Workbench" schickt er die Auswahl weiter.

**Zone 2 — Semantic Workbench:**
Ausgewählte Signale landen auf einem Arbeitstisch. Das System generiert mehrere "Story Angles" — verschiedene Blickwinkel auf die Geschichte. Optional läuft ein Legal-Compliance-Check: Atomare Behauptungen werden aus dem Seed-Signal extrahiert, unabhängige Quellen gesucht, ein Ähnlichkeits-Audit gegen den Seed-Artikel gemacht. Der Mensch gibt eine "Editorial Directive" (Fokus-Anweisung) ein, wählt Angles aus, und triggert das Drafting.

**Zone 3 — Editorial Press:**
Aus den ausgewählten Angles entstehen fertige Artikel-Entwürfe. Das System ruft Columnist-Agent und Editor-Agent auf. Entwürfe landen als Karten — bereit für weitere Bearbeitung oder direkt in die Freigabe-Queue.

**Zusammenfassung:** Minutenlange, bewusste Arbeit. Jeder Schritt eine Entscheidung. Volle Transparenz und Kontrolle.

---

### Modus 2: Autonomous (vollautomatisch, kein Eingriff nötig)

**Charakter:** Die Maschine läuft allein. Der Cron-Job feuert dreimal täglich (8h, 13h, 19h UTC). Der Mensch findet fertige Entwürfe wenn er den Newsroom öffnet.

**Ablauf in vier Phasen:**

**Phase 1 — Ingest (The Scout):**
Alle aktiven Quellen werden abgefragt. Feeds werden geholt, GitHub-Trends abgerufen. Jedes neue Item bekommt ein Vektor-Embedding und wird auf Semantik-Duplikate geprüft. Neue, einzigartige Signale werden gespeichert.

**Phase 2 — Discover (The Board):**
Vektor-Clustering gruppiert verwandte Signale zu Story-Clustern. Cluster werden nach Resonanz gerankt (Signal-Dichte + semantische Kohärenz). Neue narrative Säulen werden identifiziert.

**Phase 3 — Debate (The Boardroom):**
Der am höchsten gerankte Cluster kommt in eine Mehr-Agenten-Debatte: verschiedene Personas diskutieren Blickwinkel, Friktion ist erwünscht. Ergebnis: ein Konsens-Angle als Redaktionsentscheidung.

**Phase 4 — Draft (The Columnist):**
Der Columnist-Agent schreibt auf Basis des Consensus-Angles einen vollständigen Artikel (ca. 400 Wörter). Der Entwurf landet mit Status `review` in der Freigabe-Queue — **ohne automatische Veröffentlichung**.

**Zusammenfassung:** Der Mensch kommt, schaut was produziert wurde, und entscheidet ob es rausgeht. Autonome Maschine innen, menschliches Gate aussen. Immer.

---

### Modus 3: Chronological *(konzeptionell, noch nicht aktiv)*

**Charakter:** Kein diskreter Artikel-Output, sondern ein lebendiger, fortlaufender Thread zu einem einzigen Thema.

**Konzept:** Der Mensch wählt ein Wurzel-Thema. Das System überwacht laufend eingehende Signale die dazu passen und hängt sie chronologisch als Updates an einen lebenden Artikel an — wie ein Live-Ticker, der journalistisch verdichtet wird.

*Noch kein Backend, noch kein UI. Taucht als Auswahlmöglichkeit auf.*

---

## Die vier Produktionsräume

### SIGNAL-RAUM *(aktuell: "The Wire")*

**Was hier passiert:** Die Welt schickt Signale. 193 Signale aus 23 Quellen — Algorithmen, Paper, Breaking News, GitHub-Commits, RSS-Feeds — laufen permanent rein. Hier entscheidet sich, welche davon es in die Redaktion schaffen.

**Was die Person hier tut:**
- Im Three-Zone-Modus: aktiv Signale auswählen, Workbench befüllen, zur Debatte schicken
- Im Autonomous-Modus: zuschauen, was die Maschine aufgreift, Cluster-Resonanz verfolgen, Pipeline-Status sehen

**Wichtig:** Das *Signal* ist die Haupteinheit — nicht die Quelle. Quellen sind Konfiguration, kein Dauerfokus. Quellen-Setup gehört in ein Setup-Panel (hinter einem Klick), nicht in die Hauptfläche.

**Output:** Signal(e) → Debatten-Raum.

---

### DEBATTEN-RAUM *(aktuell: "The Bullpen")* · MVP

**Was hier passiert:** Mehrere KI-Personas diskutieren Blickwinkel, Thesen, redaktionelle Positionen — mit echter Friktion, nicht als Summary. Das ist kein Konsensmechanismus, das ist Widerspruch als Methode.

**Was die Person hier tut:**
- Zuschauen wie Agenten debattieren
- Richtung beeinflussen
- Ergebnis akzeptieren oder ablehnen

**Jetzt (MVP):** Einfacher Debate-Durchlauf, ein Ergebnis. **Später:** Live-Streaming der Debatte, sichtbare Charaktere, mehrere Runden, Co-Director-Stimmen des Lesers.

**Output:** Angle + Thesis → Visueller Raum oder direkt Draft.

---

### VISUELLER RAUM *(aktuell: "The Darkroom")* · MVP

**Was hier passiert:** Das visuelle Gesicht des Artikels entsteht. KI generiert Bilder, schlägt Farbpaletten vor, setzt Stimmungsbilder.

**Was die Person hier tut:**
- Generierte Bilder reviewen
- Richtung akzeptieren oder neu generieren lassen

**Jetzt (MVP):** Bildgenerierung, Vorschau (aktuell buggy). **Später:** Art-Direction-Profile (Glitch/Brutalist/Swiss), Moodboards, Komponierbare Bildsprache.

**Output:** Visual Asset + Art-Direction → Produktions-/Freigabe-Raum.

---

### PRODUKTIONS- UND FREIGABE-RAUM *(aktuell: "The Printing Press")* · MVP

**Was hier passiert:** Fertige Entwürfe kommen rein. Werden in Magazine-Blöcke gesetzt. Der Mensch gibt frei — oder nicht.

**Was die Person hier tut:**
- Entwürfe reviewen (Headline, Deck, Body, Bild)
- Layout-Vorschlag prüfen
- **Freigeben, Überarbeiten oder Ablehnen**

**Die Freigabe ist der heiligste Moment des gesamten Systems.** Dieser Klick ist die einzige Veröffentlichungs-Handlung. Nichts geht ohne ihn live.

**Jetzt (MVP):** Basis-Layout-Ansicht, Freigabe-Queue wird im Rewrite gerade gebaut. **Später:** Komponierbares Layout, Art-Direction-Integration, Critics' Corner.

**Output:** Publizierte Ausgabe — oder zurück in Revision.

---

## Das Diagnostik-Panel *(aktuell: "Observatory")*

**Was das ist:** Kein Produktionsraum. Ein Blick unter die Haube — für den Operator und für die Entwicklung. System-Health, Mission-Status, Token-Verbrauch, Pipeline-Fehler, Agent-Aktivität.

**Zugänglichkeit:** Prominent anwählbar (kein Versteck), aber kein Haupt-Raum im Produktionsfluss. Es ist ein Schraubenzieher-Panel — immer erreichbar, aber nicht der Fokus der täglichen Arbeit.

**Wichtig:** Nur echte Daten. Wenn nichts läuft: zeigt es das. Kein Dashboard-Theater.

---

## Die Agenten — ihre journalistischen Rollen

| Rolle | Was er tut |
|-------|-----------|
| **Scout** | Durchsucht Quellen, bewertet Relevanz, erkennt Resonanz |
| **Curator / The Board** | Gruppiert verwandte Signale zu Stories, rankt Cluster |
| **Editor** | Trifft redaktionelle Entscheidungen: Angle, Framing, Prio |
| **Columnist** | Schreibt den Artikel aus einer definierten Stimme/Perspektive |
| **Critic** | Hinterfragt Entwürfe, deckt Schwächen auf, fordert Revision |
| **Art Director** | Visuelle Entscheidungen: Bildstimmung, Farbe, Layout-Typ |
| **Publisher** | Finale Qualitätsprüfung, Assembly, Übergabe an die Queue |

Diese Rollen sind sichtbar. Im Activity-Log ist immer erkennbar, welcher Agent gerade was tut. Die Maschine hat Charakter — keine Black Box.

---

## Was der Newsroom kommunizieren muss (Design-Werte)

**1. Ehrlichkeit vor Ästhetik.**
Kein Element zeigt einen Wert der nicht aus echten Daten kommt. Leere States sind klar benannt.

**2. Der Fluss ist immer spürbar.**
Man muss immer wissen: wo bin ich im Produktionsprozess? Was kam vorher, was kommt als nächstes?

**3. Die Maschine hat Persönlichkeit.**
Agenten haben Namen. Ihre Aktivität ist sichtbar. Echte Charaktere, kein anonymes System.

**4. Der Mensch ist Herr über den Ausgang.**
Die Freigabe ist der heilige Moment. Sie muss sich so anfühlen.

**5. Dichte ist kein Fehler.**
Dieser Raum ist für Profis. Information darf kompakt sein.

**6. Raum für Wachstum.**
Drei Räume sind heute MVP. Die visuelle Architektur muss wachsen können, ohne fundamental zu brechen.

---

## Was der Raum NICHT ist

- Kein Dashboard für passive Beobachtung (man arbeitet hier)
- Kein Source-Management-Tool (Quellen konfiguriert man hinter einem Klick)
- Kein schöner Wrapper um eine API (die Maschine ist die Hauptfigur)
- Kein System das man erklärt (man erlebt es)
