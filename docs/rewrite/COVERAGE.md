# North-Star Coverage-Check — „Ist alles abgebildet?"
> Gegenprüfung: jedes Element der North Star (Masterplan §1) wird in Capabilities zerlegt; jede
> Capability bekommt Tasks. **Lücken sind unten explizit markiert** — sie sind der eigentliche Wert
> dieses Dokuments. Stand 2026-06-01.

## Legende
✅ abgebildet · ⚠️ teilweise/abhängig · 🔴 **Lücke — noch nicht abgebildet, Aktion nötig**

---

## Säule SCHAUSPIEL (zuschauen + eingreifen)
| Capability | Tasks | Status |
|---|---|---|
| Live-Aktivitätsstrom (cinematic), Räume als Bühne | T-3.1.* | ✅ (abhängig von echten Missions C1 → T-1.2.1) |
| Echte Mehr-Runden-Debatte (statt 1 JSON-Call) | T-2.3.* | ✅ |
| Critics' Corner sichtbar + Revisions-Schleife (Versionierung) | T-3.2.* | ⚠️ braucht Draft-Versionierung (T-3.2.1) + `agentCriticsCorner` verdrahten (A4) |
| Co-Director: Signal boosten, Angle vorschlagen, in Debatte mitstimmen, Queue mitkuratieren | T-3.3.* | ⚠️ braucht **Governance/Identität** (siehe Lücke G2) + Freigabe-Queue (T-1.1.3) |
| Dormante Personas im Loop sichtbar (`agentPersonaSpeak` etc., A4) | T-2.1.4, T-3.1.3 | ✅ |

## Säule CHRONIK (Latent Space)
| Capability | Tasks | Status |
|---|---|---|
| Latent-Space-Leser-Karte (Embeddings sichtbar, Cluster) | T-3.4.* | ⚠️ braucht gesunde Embeddings (C2 → T-1.0.3) + `centroid_embedding` befüllt (Lücke G4) |
| Altitude-Tagging Makro/Meso/Tag | T-3.5.1 | ✅ |
| Generierte „State of the Revolution"-Meta-Ausgaben | T-3.5.2 | ⚠️ braucht `issues.content`-Validator (T-1.2.6) |
| Narrativ-**Drift über Zeit** (zeitliche Cluster-Historie) | — | 🔴 **Lücke G1** |

## Säule VERTRAUEN / BEWEIS
| Capability | Tasks | Status |
|---|---|---|
| Ein Gehirn: gemeinsame Agenten-/Orchestrierungs-Schicht, Cron reused sie (A1/A3) | T-1.1.1, T-1.1.2 | ✅ |
| Freigabe-Queue (editorial) — reuse `drafts.status='review'` | T-1.1.3 | ✅ |
| Honest-by-Default-Sweep (C1/U1/U2/U5/U6/U3) | T-1.2.* | ✅ |
| Lightweight-Provenienz (Quellen + Atomic Claims) | T-1.3.1 | ✅ |
| Provenienz vertieft (Kette Signale→Debatte→Entscheidung→Claims) | T-2.4.* | ✅ |
| Validated Boundaries (`v.any()`: drafts.blocks, issues.content, missions.metadata, newsroom_state.data) | T-1.2.6, T-2.5.1 | ✅ |
| Meta-Beweis: autonomer Innenbetrieb verlässlich + Provenienz öffentlich | T-2.* gesamt | ✅ |

## Säule PLATTFORM (Distribution + Community, Mensch-gated)
| Capability | Tasks | Status |
|---|---|---|
| Distributions-Adapter: Posts & Thread-Antwort-Artikel **entwerfen** | T-4.2.* | ⚠️ braucht externe Plattform-Integration (Lücke G5) |
| **Outbound-Freigabe-Queue** (Human-Gate, getrennt von Editorial-Queue) | T-4.1.* | ✅ (jetzt explizit, war Lücke) |
| Citizen Desk: Inbox + Moderation + Attribution + Debatte | T-4.3.* | ✅ |
| Lead-Indicators-Digest (Web/E-Mail, generieren + zustellen) | T-4.4.* | ✅ |

## Querlaufende Guardrails
| Guardrail | Tasks | Status |
|---|---|---|
| S1 Action-Auth/Rate-Limit (P0) | T-1.0.1 | ✅ |
| S4 Netlify-Key-Hygiene | T-1.0.2 | ✅ |
| C2 Embedding-Dim-Guard | T-1.0.3 | ✅ |
| S2 Signal-Cache (Zero-Token) | T-2.6.1 | ✅ |
| S3 `NewsroomProvider`-Scope eingrenzen | T-1.2.7 | ✅ |

---

## 🔴 Erkannte Lücken (Aktion nötig — nicht aus dem Masterplan ableitbar)
> Das ist das Ergebnis der Gegenprüfung. Diese Punkte waren **nicht** automatisch abgebildet.

- **G1 — Zeitliche Cluster-Historie (Chronik-Drift).** Die Latent-Space-Karte soll zeigen, wie Narrative
  *über Zeit driften* — aber es gibt **keine** Speicherung historischer Cluster-Zustände (`stories` hat nur
  `lastUpdatedAt`, kein Snapshot-Verlauf). **Aktion:** in Akt III ein Snapshot-/Zeitreihen-Konzept entwerfen
  (neue Tabelle `story_snapshots` o.ä.). → als **T-3.4.0 (Design)** angelegt, Status `TODO`.
- **G2 — Identität/Governance für Co-Director.** Leser, die in Debatten mitstimmen/Queue kuratieren
  (Q2 B), brauchen Identität, Rechte und Missbrauchsschutz — heute ist Auth ein **Single-Operator-Soft-Wall**
  (`mock session 'editor@latent.times'`, `applyReadOnlyGuard`). **Aktion:** Mehrnutzer-Identität + Rollen als
  Voraussetzung von Akt III. → **T-3.3.0 (Design)**, Status `TODO`.
- **G3 — Design-Baseline für „makellose, visuell starke Ausgabe" (Akt I) vs. volle Art-Direction (Akt III).**
  Akt I verspricht eine *visuell starke* Ausgabe, aber kohärente Bildsprache/Moodboards liegen erst in Akt III.
  Ohne eine **Design-Baseline** ist „makellos" in Akt I nicht erreichbar. **Offene Entscheidung:** minimaler
  Design-System-Pass in Akt I **oder** bewusst reduzierte, typografische Ästhetik akzeptieren. → **T-1.2.0
  (Entscheidung+Design)**, Status `BLOCKED` (braucht Mensch).
- **G4 — `centroid_embedding` wird nie befüllt.** Feld existiert in `stories`, bleibt leer; Latent-Space-Karte
  und besseres Clustering brauchen es. **Aktion:** beim Cluster-Bau Zentroid berechnen/speichern. → **T-2.2.1**.
- **G5 — Externe Social-Plattform-Integration.** Adapter (Akt IV) brauchen X/Reddit/Instagram-API-Zugänge,
  OAuth, Rate-Limits, ToS-Konformität — eine **externe Abhängigkeit**, die früh geklärt werden muss
  (welche Plattform zuerst, welche Credentials). → **T-4.0.1 (Spike/Entscheidung)**, Status `BLOCKED` (braucht Mensch).
- **G6 — `chronological`-Methodik (U4) bleibt PARKED.** Bewusst nicht abgebildet; im Backlog als Stub. Kein Defekt.
- **G7 — Operator-/App-UI-Qualität (Bedien-Cockpit).** Der Masterplan verschmolz „Design" zu *Produkt-Design*
  (T-1.2.0 / Visual Supremacy) und *öffentlichem Schauspiel* (Cinematic Newsroom T-3.1.x). Die **Bedien-Oberfläche,
  mit der der Operator arbeitet** (Navigation, Hierarchie, Konsistenz, Zustände), war dazwischen **heimatlos** —
  obwohl grundsätzliche Unzufriedenheit besteht. **Aktion:** eigener Track in Akt I. → **Slice 4 / T-1.4.x**
  (Mensch-Priorität), Start mit Audit **T-1.4.0**.

## Fazit der Gegenprüfung
North Star ist **zu ~90 % in Tasks abgebildet**. Sechs Punkte waren *nicht* automatisch gedeckt: drei echte
Bau-Lücken (G1 Zeitreihe, G4 Zentroid, **Outbound-Queue — bereits ergänzt**) und drei
Mensch-Entscheidungen (G2 Identität, G3 Design-Baseline, G5 Plattform-Wahl). Letztere sind als `BLOCKED`
markiert und sollten **vor** dem jeweiligen Akt entschieden werden.
