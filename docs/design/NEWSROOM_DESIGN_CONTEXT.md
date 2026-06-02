# Newsroom UI Redesign — Context für Claude Design
*The Latent Times · Stand 2026-06-01*


Design spannende Ui Konzepte für unser Zeitungs Redaktions System.
Es ist ein neuartiges Projekt, hier trifft die alte Welt auf modernste Technologien. Du redesigns den Motor der Zeitung.. den Newsroom - die Redaktion. Sie sieht ganz anders aus als das digitale Papier aber dennoch gehoert es zur gleichen Platform... es ist der absurd intressante Blick unter die Haube, die mischung aus technischer Faszination und agentischer Automation. 

Iteriere 3 Design moeglichkeiten, die ihren ganz eigenen Vibe haben.. aber immer das Spannungsfeld der technologischen Neuzeit 2026 Agentic AI Revolution - mit der alten Zeit - Newspaper, High luxury fashion aesthetics, Buchdruckerei, Medien und Menschen - vereint.

---

## Was ist The Latent Times?

Eine **KI-native Nachrichtenredaktion** — eine voll-autonome Agenten-Redaktion, der man beim Zeitungmachen **zuschaut** und in die man **eingreift**. Keine Fake-AI-Demo. Echte Agenten, die echte Signale ingestieren, debattieren, Artikel entwerfen, layouten und auf Freigabe durch einen Menschen warten.

**Produktvision:** „Vogue meets Wired meets The Matrix" — High-Fashion-Editorial auf der einen Seite, Tech-Terminal-Energie auf der anderen.

**Zwei getrennte Oberflächen:**
- **Das Magazin** (öffentlich) — der Leser sieht das Endprodukt
- **Der Newsroom** (password-gated) — hier arbeitet die Maschine, hier schaut man zu ← **DAS ist unser Fokus**

---

## Die Five Rooms — was sie tun

Der Newsroom besteht aus **fünf Räumen**, zwischen denen der Nutzer navigiert. Jeder Raum ist eine eigene React-Komponente, eingebettet in eine gemeinsame Shell (`NewsroomFloor.tsx`).

| Raum | Code-Step | Funktion |
|------|-----------|----------|
| **The Wire** | `NEWS_TERMINAL` | Signal-Ingestion: 193 Signale aus 23 Quellen laufen rein (RSS, GitHub, Feeds). Zeigt live den Pipeline-Status. |
| **The Bullpen** | `EDITORIAL_BOARD` | Debatten-Board: KI-Agenten diskutieren Angles, Thesen, Editorial-Entscheidungen. |
| **The Darkroom** | `DARKROOM` | Visueller Atelier: Bildgenerierung, Moodboards, Color Palettes. |
| **The Printing Press** | `PRINTING_PRESS` | Layout-Engine + **Freigabe-Queue**: Hier genehmigt der Mensch, bevor etwas publiziert wird. |
| **Observatory** | `OBSERVABILITY` | Mission Control: Echtzeit-Metriken, Agent-Aktivität, System-Health. |

---

### Raum-Differenzierung: NICHT durch Farbe, sondern durch Inhalt

```
❌ Alt: Darkroom = purple, PrintingPress = orange
✅ Neu: Alle Räume in derselben Farb-Sprache
        Raum-Identität entsteht durch Layout + Icon + Content-Typ
```

---

## Funktionale Constraints — was NICHT geändert werden darf

Diese Elemente müssen im neuen Design **erhalten bleiben** (sie kontrollieren echte Backend-Funktionen):

### Muss bleiben:
1. **Engine Autonomy Toggle** im Header — schaltet die echte Pipeline an/aus
2. **5 Room-Navigation-Tabs** — alle 5 Räume, im Header zugänglich
3. **Sub-Navbar** — raum-spezifischer Kontext (besonders: Methodology-Switcher in The Wire)
4. **Right Sidebar: Operational Log** — live Agent-Aktivität (sortiert nach timestamp, neueste zuerst)
5. **Error Banner** — Pipeline-Exceptions müssen sofort sichtbar sein
6. **Status Bar** (unten) — Verbindungsstatus
7. **Auth Bar** — Passwort-geschützter Zugang

### Neu hinzukommend (muss im Design Platz bekommen):
- **Freigabe-Queue im Printing Press** — Card-UI für Approve/Reject von Drafts (die wichtigste neue Funktion)
- **Honest Empty States** — wenn keine Daten da sind: klare, ehrliche Meldungen, kein Fake-Content


---

## Komponenten-Inventar (was existiert)

```
Shell:
  NewsroomFloor.tsx      — Outer shell, Header, Tabs, Sidebar, StatusBar

Five Rooms:
  TheWire.tsx            — Signal-Ingestion, Pipeline-Steuerung
  TheBullpen.tsx         — Debatten-Board
  TheDarkroom.tsx        — Bild-Generierung, Visual-Assets
  PrintingPress.tsx      — Layout + Freigabe-Queue (neu: T-1.1.3)
  ObservabilityDash.tsx  — Mission Control, echte Metriken

Shared UI Primitives (NewsroomUI.tsx):
  NewsroomButton         — 4 Varianten
  NewsroomPanel          — Layout-Wrapper
  NewsroomLabel          — 3 Text-Varianten
  NewsroomHeader         — Raum-interner Header
  SignalCard             — Live-Signal-Karte
  MagazineSignalCard     — Featured Signal-Karte
  BriefingCard           — Draft in der Queue
  ClusterCard            — Story-Cluster
  EditorialCard          — Editorial-Entscheidung
  AssetPreviewCard       — Bild-Vorschau

Context:
  NewsroomAuthBar.tsx    — Auth-Controls
  NewsroomContext.tsx    — Zentraler State (step, logs, error, methodology)

Animation:
  GSAP (via gsap + @gsap/react) — Reveal-Komponente für Entrance-Animationen
```

---

## Start-Fokus für den Entwurf

**Empfehlung:** Beginne mit dem **Top Bar (Header)** — er ist das Frame für alle fünf Räume. Wenn er kohärent ist, ordnen sich die Räume darunter.

Header enthält:
1. Live-Dot + Branding ("LNT.Newsroom")
2. Engine Autonomy Toggle (Checkbox + Status)
3. Room Navigation (5 Tabs, Icons + Labels)
4. Auth Bar + Close

**Dann:** Einen Raum exemplarisch — empfohlen: **The Wire** (einfachste Struktur) oder **Printing Press** (wichtigste neue Funktion: Freigabe-Queue).
