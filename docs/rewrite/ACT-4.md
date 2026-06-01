# AKT IV — „Die Zeitung kommt zu den Menschen" (Distribution + Community)
**Beweis: Reichweite + Bewegung.** Die Zeitung trägt ihre Storys nach draußen und lässt die Community
mitschreiben — **strikt Mensch-gated** (Masterplan §2). *Erst nach* dem Vertrauens-Fundament (Akt I/II).
Akzeptanz: kein einziger Outbound-Artefakt verlässt das System ohne Human-Freigabe; Community-Input fließt
nachvollziehbar in die Redaktion.

> **Leitprinzip hier kompromisslos:** autonom *entwerfen*, Mensch *freigeben*. Volle Outbound-Autonomie
> ist Zukunfts-Meilenstein (§7), nicht Teil dieses Akts.

## Slice 0 — Plattform-Spike *(Lücke G5 — BLOCKED)*
- **T-4.0.1 — Plattform + Credentials entscheiden.** Welche Plattform zuerst (X/Reddit/Instagram), OAuth,
  Rate-Limits, ToS-Konformität klären. **Acceptance:** Eine Zielplattform + Zugangsweg steht. **Depends:** **Mensch-Entscheidung.**

## Slice 1 — Outbound-Freigabe-Queue (das Human-Gate)
- **T-4.1.1 — Outbound-Datenmodell + Queue.** Neue Tabelle(n) für ausgehende Artefakte (Post/Reply/Artikel)
  mit Status `drafted|approved|published|rejected`. Files: `convex/schema.ts` (neu, analog zu `drafts`-Status-Maschine).
  **Acceptance:** Jeder Outbound liegt zuerst als `drafted` vor.
- **T-4.1.2 — Freigabe-UI.** Mensch sichtet/bearbeitet/gibt frei. **Acceptance:** Nichts geht ohne expliziten Klick raus.

## Slice 2 — Distributions-Adapter *(Q5 A / Q6 §2)*
- **T-4.2.1 — Story-Post-Drafter.** Agent entwirft Social-Posts zu publizierten Storys → Outbound-Queue (drafted).
  Files: geteilte Agenten-Schicht (T-1.1.1), neue Adapter-Action. **Acceptance:** Posts erscheinen nur als Entwurf.
- **T-4.2.2 — Thread-Discovery + Reply-Artikel-Drafter.** Agent findet relevante Threads, entwirft *eigenen
  Artikel* zum Gedankengang + Kommentar/Link → Outbound-Queue. Multi-Plattform-Scope, **immer gated.**
  **Acceptance:** Kein automatischer Thread-Post ohne Freigabe; Provenienz (T-2.4.1) hängt am Entwurf.
  **Depends:** T-4.1.1, T-4.0.1.

## Slice 3 — Citizen Desk *(Q7 B)*
- **T-4.3.1 — Submission-Inbox.** Community reicht Links/Papers/Gedanken ein → Signal-Pool. Files:
  `convex/schema.ts` (neu/`sources`), `fetchActions.ts`-analog. **Acceptance:** Beiträge erscheinen als Signale.
- **T-4.3.2 — Moderation/Gate.** Eingehende Beiträge werden geprüft, bevor die Redaktion sie nutzt.
- **T-4.3.3 — Attribution + Debatte.** Beitragende erhalten Credit; ihr Input wird debattiert, ggf. publiziert.
  **Acceptance:** Veröffentlichungen aus Community-Input tragen sichtbare Attribution.

## Slice 4 — Lead-Indicators-Digest *(Q8 A)*
- **T-4.4.1 — Digest-Generator.** Stärkste aufsteigende Signale (Innovation-Score, T-2.x) periodisch synthetisieren.
  Files: neuer Cron `convex/crons.ts`, geteilte Agenten-Schicht.
- **T-4.4.2 — Zustellung Web/E-Mail.** Digest als Web-Artefakt + E-Mail. **Acceptance:** Wiederkehrender Rhythmus steht.

---

## Zukunfts-Meilenstein (post-Akt IV, NICHT Teil dieses Plans)
**Volle Outbound-Autonomie** — ausgewählte Outbound-Pfade vom Human-Gate auf autonom-im-Rahmen umstellen,
*nachdem* Qualität, Provenienz und Plattform-Track-Record über Monate bewiesen sind.
