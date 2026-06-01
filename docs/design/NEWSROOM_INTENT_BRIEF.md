# The Latent Times — Newsroom Intent Brief
*Für Claude Design · Stand 2026-06-01*

> **Ziel dieses Dokuments:** Nicht die UI vorschreiben. Die *Absicht* hinter jedem Raum so klar machen, dass das Design von selbst die richtigen Entscheidungen trifft.

---

## Was ist dieser Ort?

Ein **autonomer Nachrichtenraum**. Echte KI-Agenten ingestieren laufend Signale aus der Welt, diskutieren sie, entwerfen Artikel, layouten sie — und warten dann auf einen Menschen, der auf Publish drückt.

Der Mensch, der diesen Raum betritt, ist **Chefredakteur einer Redaktion aus Maschinen**. Er dirigiert nicht jeden Schritt — er *schaut zu*, greift ein wo es wichtig ist, und gibt am Ende frei.

**Das Schauspiel ist die Attraktion.** Die arbeitende Maschine soll erlebt werden — nicht versteckt.

---

## Die Produktionslogik — der Fluss

```
WELT              →   THE WIRE          →   THE BULLPEN       →   THE DARKROOM
Signale kommen         Editorial-Agenda       Debatte + Angle        Visuals entstehen
rein (laufend)         wird gesetzt           wird beschlossen

         →   PRINTING PRESS       →   PUBLIZIERT
              Layout + Freigabe         erst nach Menschenklick
              Mensch gibt frei
```

**Dieser Fluss ist der Dreh- und Angelpunkt des gesamten Newsrooms.** Jede Raumgestaltung muss diesen Fluss spürbar machen — wo bin ich im Prozess, was kommt als nächstes?

---

## Die drei Betriebsmodi (Methodologien)

### Three-Zone (manuell)
Der Mensch führt die Produktion Schritt für Schritt. Er wählt im Wire ein Signal, schickt es in den Bullpen, überwacht die Debatte, initiiert die Visuals, löst das Layouting aus. Die Maschine führt aus, der Mensch dirigiert jeden Übergabepunkt.

### Autonomous
Die Maschine läuft allein. Der Cron-Job feuert dreimal täglich — Signale kommen rein, werden geclustert, debattiert, entworfen, layoutet. Das Ergebnis landet in der Freigabe-Queue. Der Mensch öffnet den Newsroom und findet fertige Entwürfe die auf sein Ja warten. Er schaut zu, greift selten ein, gibt am Ende frei.

### Chronological *(parked)*
Zeitbasierter Ansatz — noch nicht aktiv. Taucht als Option auf, tut aber nichts.

**Die Wahl des Modus ist die wichtigste einzelne Einstellung im gesamten System.** Sie bestimmt ob der Mensch Dirigent ist oder Aufseher.

---

## Die fünf Räume — Intent

### THE WIRE — *Der Empfangsraum*

**Was hier passiert:** Die Welt schickt Signale. Algorithmen, Paper, Breaking News, GitHub-Commits, RSS-Feeds — 193 Signale aus 23 Quellen laufen permanent rein. Hier entscheidet sich, welche davon es in die Redaktion schaffen.

**Was die Person hier tut:**
- Überblick gewinnen: Was ist gerade wichtig? Was resoniert?
- Im Three-Zone-Modus: aktiv ein Signal auswählen und in den nächsten Raum schicken
- Im Autonomous-Modus: beobachten, was die Maschine aufgreift

**Das Wesentliche:** Das Signal — nicht die Quelle — ist die Haupteinheit. Quellen sind Konfiguration (Setup, kein Dauerfokus). Die Person schaut auf *was kommt rein*, nicht auf *woher es kommt*.

**Output:** Ein ausgewähltes Signal/Thema geht in den Bullpen.

---

### THE BULLPEN — *Das Debattier-Zimmer*

**Was hier passiert:** Mehrere KI-Personas diskutieren: Welchen Angle nehmen wir? Was ist unsere Perspektive auf dieses Signal? Welche Geschichte steckt dahinter? Das ist keine nette Zusammenfassung — das ist Friktion, Widerspruch, echte Meinungsverschiedenheit.

**Was die Person hier tut:**
- Zuschauen wie Agenten debattieren
- Die Debatte lenken (Vorschläge, Vetos)
- Den beschlossenen Angle akzeptieren oder ablehnen

**Das Wesentliche:** Die Debatte ist lebendig und soll *erlebt* werden. Es geht nicht um ein Ergebnis-Dropdown — es geht darum, die Maschine beim Denken zuzuschauen.

**Output:** Ein vereinbarter Editorial-Angle und eine Thesis gehen in die Entwurfsphase.

---

### THE DARKROOM — *Das Visuelle Atelier*

**Was hier passiert:** Visuelle Identität des Artikels wird entwickelt. KI generiert Bilder, schlägt Farbpaletten vor, entwirft Stimmungsbilder. Hier bekommt die Story ihr Gesicht.

**Was die Person hier tut:**
- Generierte Bilder reviewen
- Visual-Richtung akzeptieren oder neu generieren lassen
- Das Art-Direction-Profil für den Artikel bestätigen

**Das Wesentliche:** Dunkelheit ist Absicht — dieser Raum ist buchstäblich ein Entwicklungsraum. Etwas entsteht. Das finale Visual ist der Output, nicht der Prozess.

**Output:** Ein visuelles Asset + Art-Direction gehen in den Printing Press.

---

### THE PRINTING PRESS — *Die Produktionshalle und der Freigabe-Punkt*

**Was hier passiert:** Der fertige Entwurf trifft auf das Layout. Artikel werden in Magazine-Blöcke gesetzt, die Ausgabe wird zusammengesetzt. Und dann: der Mensch entscheidet ob es rausgeht.

**Was die Person hier tut:**
- Fertige Entwürfe reviewen (Headline, Deck, Body, Bild)
- Den Layout-Vorschlag prüfen
- **Freigeben oder ablehnen** — dieser Klick ist die einzige Veröffentlichungs-Handlung im System

**Das Wesentliche:** Die Freigabe-Queue ist das Herzstück dieses Raums. Alles andere — Layout-Ansicht, Block-Grid — ist Kontext. Die Entscheidung `Freigeben / Überarbeiten / Ablehnen` ist die wichtigste Interaktion im gesamten Newsroom.

**Regel:** Nichts geht ohne den menschlichen Freigabe-Klick live. Nie.

**Output:** Publizierte Ausgabe oder zurück in Revision.

---

### THE OBSERVATORY — *Mission Control*

**Was hier passiert:** Systemische Sicht auf alles. Wie viele Missionen laufen? Welche Agenten arbeiten? Token-Verbrauch, Latenz, Pipeline-Status, Fehler. Das ist die Vogelperspektive.

**Was die Person hier tut:**
- Systemgesundheit überwachen
- Sehen ob die autonome Pipeline läuft oder steckt
- Diagnosieren wenn etwas schief geht

**Das Wesentliche:** Echte Zahlen oder gar nichts. Keine Fake-Confidence, keine erfundenen Balken. Wenn die Pipeline gerade nichts tut — dann zeigt das UI genau das.

---

## Die Agenten — ihre journalistischen Rollen

Die Maschine arbeitet nicht als monolithisches System. Es gibt Rollen — wie in einer echten Redaktion:

| Rolle | Was er tut |
|-------|-----------|
| **Scout** | Durchsucht Quellen, bewertet Relevanz, erkennt Resonanz |
| **Curator** | Gruppiert verwandte Signale zu Stories, schlägt Cluster vor |
| **Editor** | Trifft redaktionelle Entscheidungen: Angle, Framing, Prio |
| **Columnist / Persona** | Schreibt aus einer definierten Stimme/Perspektive |
| **Critic** | Hinterfragt Entwürfe, deckt Schwächen auf, fordert Revision |
| **Art Director** | Visuelle Entscheidungen: Bildstimmung, Farbe, Layout-Typ |
| **Publisher** | Finale Qualitätsprüfung, Assembly, Übergabe an die Queue |

**Diese Rollen sind sichtbar.** Im Talkback/Log ist immer erkennbar, welcher Agent gerade was tut. Die Maschine hat Charakter — das ist keine Black Box.

---

## Was der Newsroom kommunizieren muss (Design-Werte)

**1. Ehrlichkeit vor Ästhetik.**
Kein Element zeigt einen Wert der nicht aus echten Daten kommt. Leere States sind klar benannt. Eine offline Quelle zeigt "OFFLINE" — nicht einen vollen Balken.

**2. Der Fluss ist immer spürbar.**
Man muss immer wissen: wo bin ich im Produktionsprozess? Was kam vorher, was kommt als nächstes?

**3. Die Maschine hat Persönlichkeit.**
Agenten haben Namen. Ihre Aktivität ist sichtbar. Das Gefühl: echte Charaktere arbeiten hier, kein anonymes System.

**4. Der Mensch ist Herr über das Ausgang.**
Die Freigabe ist der heilige Moment. Sie muss sich so anfühlen.

**5. Dichte ist kein Fehler.**
Dieser Raum ist für Profis. Information darf kompakt sein. Nicht jedes Element braucht Erklärung.

---

## Was der Raum NICHT ist

- Kein Dashboard für passive Beobachtung (man arbeitet hier)
- Kein Source-Management-Tool (Quellen konfiguriert man einmalig — nicht im laufenden Betrieb)
- Kein schöner Wrapper um eine API (die Maschine ist die Hauptfigur)
- Kein System das man erklärt (man erlebt es)
