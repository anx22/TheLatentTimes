# Newsroom UI Redesign — Context für Claude Design
*The Latent Times · Stand 2026-06-01*

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

## Aktuelle Code-Struktur (Shell + Design-Primitives)

### NewsroomFloor.tsx — die gemeinsame Shell

```tsx
// Grundstruktur der Shell — MUSS erhalten bleiben (nur visuell neu gestalten)

<div className="fixed inset-0 z-[150] bg-black flex flex-col text-white font-sans">
  
  {/* ① ERROR BANNER — Pipeline Exceptions, immer sichtbar */}
  {error && (
    <div className="absolute top-16 right-8 z-[200] max-w-sm bg-red-950/90 border border-red-500/50 ...">
      Pipeline Exception: {error}
    </div>
  )}

  {/* ② TOP BAR — Branding + Autonomy Toggle + Room Navigation + Auth */}
  <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-8 bg-zinc-950">
    
    {/* Logo + Live-Dot */}
    <div className="flex items-center gap-3">
      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
      <span className="font-mono text-[14px] uppercase tracking-[0.4em] font-black">
        LNT.Newsroom
      </span>
    </div>

    {/* Engine Autonomy Toggle — KRITISCH: steuert echte Pipeline */}
    <div className="flex items-center gap-3">
      <span className="font-mono text-[9px] tracking-widest text-zinc-500 uppercase">Engine Autonomy</span>
      <input type="checkbox" checked={context.activeMethodology === 'autonomous'} ... />
      {/* Toggle: OFF = drei-zone manuell, ON = autonomer Dauerlauf */}
    </div>

    {/* Room Navigation Tabs */}
    {[
      { id: 'NEWS_TERMINAL', name: 'TERMINAL', icon: Radio },
      { id: 'OBSERVABILITY', name: 'OBSERVE', icon: Activity },
      { id: 'EDITORIAL_BOARD', name: 'EDITORIAL', icon: MessageSquare },
      { id: 'DARKROOM', name: 'VISUAL', icon: Image },
      { id: 'PRINTING_PRESS', name: 'PUBLISH', icon: Printer },
    ].map(dept => (
      <button key={dept.id} onClick={() => setStep(dept.id)}>
        {/* Aktiv: text-[#ccff00] ← DAS WOLLEN WIR LOSWERDEN */}
        {/* Inaktiv: text-zinc-600 */}
      </button>
    ))}

    {/* Auth Bar + Close Button */}
    <NewsroomAuthBar />
  </div>

  {/* ③ SUB-NAVBAR — Raum-spezifischer Kontext (ändert sich je nach aktivem Raum) */}
  <div className="h-12 border-b border-zinc-600 bg-zinc-900 flex items-center px-8">
    {/* The Wire: Methodology Switcher (three-zone / autonomous / chronological) */}
    {/* Editorial Board: "Active Debate Session" Badge */}
    {/* Darkroom: "Studio Operations" Badge */}
    {/* Printing Press: "Publishing Pipeline" Badge */}
  </div>

  {/* ④ MAIN WORKSPACE */}
  <div className="flex-1 flex overflow-hidden">
    
    {/* Zentrum: Der aktive Raum */}
    <div className="flex-1 bg-zinc-900">
      {renderActiveDepartment()} {/* TheWire | TheBullpen | TheDarkroom | PrintingPress | Observatory */}
    </div>

    {/* Rechte Sidebar: Operational Log — Live Agent-Aktivität */}
    <div className="w-80 border-l border-zinc-600 bg-zinc-800 flex flex-col">
      {/* Oben: Related Topics (Cluster-Karten) */}
      {/* Unten: Live Log — Agent-Nachrichten, neueste zuerst, sortiert nach timestamp */}
      {logs.map(log => (
        <div key={log._id}>
          <span className="text-emerald-500/70">[{log.agentName}]</span>
          <span className="text-zinc-500">{log.message}</span>
        </div>
      ))}
    </div>
  </div>

  {/* ⑤ STATUS BAR — Bottom Strip */}
  <div className="h-8 border-t border-zinc-600 bg-black flex items-center justify-between px-8">
    <span>Status: Operational</span>
    <span className="opacity-30">LNT.OS_MESH</span>
  </div>
</div>
```

### NewsroomUI.tsx — geteilte Design-Primitives

```tsx
// Aktuelle Design-Token-Definitionen (in newsroomUI.tsx definiert, aber NICHT konsequent genutzt)
export const newsroomTheme = {
  colors: {
    bg: '#060606',
    panel: '#0a0a0a',
    accent: 'emerald-500',
    text: {
      primary: 'zinc-100',
      secondary: 'zinc-400',
      muted: 'zinc-600',
      terminal: 'emerald-400',
    },
    border: 'zinc-800/50',
  },
};

// Shared Components:
// NewsroomButton    — Varianten: primary(emerald), secondary(white/black), ghost(border), tactical(emerald-tinted)
// NewsroomPanel     — Wrapper mit side='left'|'right'|'center'
// NewsroomLabel     — Varianten: header | status | key
// NewsroomHeader    — Raum-interner Kopfbereich
// SignalCard        — Live-Signal-Karte aus The Wire (zeigt: source, title, timestamp, RESONANT badge)
// MagazineSignalCard — Größere Signal-Karte für featured view
// BriefingCard      — Draft-Vorschau in der Queue
// ClusterCard       — Story-Cluster-Karte in der Sidebar
// ClusterCard       — Story-Cluster in der Sidebar
// EditorialCard     — Editorial Entscheidungs-Karte
// AssetPreviewCard  — Bild-Vorschau (Darkroom)
```

### Tailwind-Config (Design-Tokens)

```js
// tailwind.config.js — zwei getrennte Design-Welten (Magazine vs. Newsroom)
// Magazine-Tokens (für Reader View):
colors: {
  background: '#ffffff',  // Papier-Weiß
  foreground: '#000000',
  accent: '#000000',      // Schwarz als Akzent
  muted: '#f5f5f5',
}

// Newsroom-Tokens: direkt als Tailwind-Klassen (zinc-*, emerald-*)
// + zwei Ad-Hoc-Farben die raus müssen:
//   #ccff00 (acid lime — aktiver Tab, resonante Signale)
//   lila-500, orange-500 (per-Raum-Farben)

// Fonts:
fontFamily: {
  display: ['"Playfair Display"', 'serif'],   // Magazine Headlines
  sans: ['"Inter"', 'sans-serif'],            // Body, UI
  mono: ['"JetBrains Mono"', 'monospace'],    // Code, System Labels
}
```

---

## Das aktuelle Farbsystem — die Probleme

```
SOLL:    Emerald (#10B981) = "online / live / verbunden"
IST:     Emerald für alles: Buttons, Headers, Labels, Borders, Text

PROBLEM: #ccff00 (Acid Lime) wurde ad-hoc für aktive Tabs + "Resonant"-Signale ergänzt
         → kämpft mit Emerald, passt zu nichts

PROBLEM: Raum-spezifische Farben ohne System:
         - Darkroom → purple-500
         - Printing Press → orange-500  
         - Kein gemeinsames Prinzip

PROBLEM: Drei parallele Farb-Systeme:
         1. tailwind.config.js (Magazine-Tokens)
         2. newsroomTheme-Objekt (Newsroom-Tokens, aber nicht konsequent genutzt)
         3. Direkte Hex-Werte (#ccff00, #060606) inline im JSX
```

---

## Was wir designen wollen: "Night Signal" Direction

**Vibe:** Reuters Global Operations × Linear.app dark × Terminal at 3am × Professional Newsroom

**Kernentscheidung:** Ein einheitliches Farb-Token-System für den gesamten Newsroom. Keine Per-Raum-Akzentfarben.

### Vorgeschlagenes neues Farbsystem

```
Background:      #0A0A0A   (fast schwarz, leicht warm — nicht kalt)
Surface:         #111111   (Panels, Karten)
Surface-Raised:  #161616   (Hover-States, elevated elements)
Border:          #1F1F1F   (subtle hairlines)
Border-Muted:    #161616   (sehr subtile Trenner)

Active/Primary:  #F5A524   (Terminal Amber — ersetzt #ccff00 komplett)
                           Warm, professionell, liest sich als "live"
                           ohne neon zu sein

Live/Online:     #10B981   (Emerald BLEIBT — nur noch für:
                           • Live-Dot im Header
                           • "Online"-Verbindungsstatus
                           • Kritisch-aktive Agent-States)

Text-Primary:    #F4F4F5   (zinc-100)
Text-Secondary:  #A1A1AA   (zinc-400)
Text-Muted:      #52525B   (zinc-600)
Text-Disabled:   #27272A   (zinc-800)

Error/Alert:     #EF4444   (bleibt)
Warning:         #F59E0B   (amber-500 — jetzt von #F5A524 abgeleitet)
```

### Typografie-System (bleibt, aber klarer geregelt)

```
JetBrains Mono → ALLE System-Labels, Timestamps, Raum-Namen, Code, Logs
Inter          → UI-Text: Button-Labels, Descriptions, Body
Playfair Disp. → NUR für Editorial-Output-Vorschauen (Artikel-Text in der Queue)
               → Schafft Kontrast: "Maschinen-UI" vs. "Menschliche Ausgabe"
```

### Raum-Differenzierung: NICHT durch Farbe, sondern durch Inhalt

```
❌ Alt: Darkroom = purple, PrintingPress = orange
✅ Neu: Alle Räume in derselben Dark-Sprache
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

### Was RAUSFLIEGT:
- `#ccff00` — komplett weg
- Per-Raum-Zufallsfarben (purple-500, orange-500)
- Jeder angezeigte Wert der nicht aus echten Daten kommt (Fake-Confidence-Zahlen etc.)

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

**Danach:** Die Right Sidebar (Operational Log) — das zweite Element das immer sichtbar ist.

**Dann:** Einen Raum exemplarisch — empfohlen: **The Wire** (einfachste Struktur) oder **Printing Press** (wichtigste neue Funktion: Freigabe-Queue).
