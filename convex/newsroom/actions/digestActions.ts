import { GoogleGenAI } from "@google/genai";
import { action } from "../../_generated/server";
import { v } from "convex/values";
import { api } from "../../_generated/api";
import { MODELS } from "../../models";

/**
 * T-4.4.1 — Lead Indicators digest generator.
 *
 * Periodically synthesizes the strongest *rising* signals (by innovation_score)
 * over a recent window into a compact "Lead Indicators" digest and stores it.
 * Backend artifact only; the web/email rendering + delivery (T-4.4.2) is parked.
 * Self-contained Gemini call (same pattern as synthesizeWithGemini) — no model
 * transport injection needed.
 */
export const generateLeadDigest = action({
  args: { windowMs: v.optional(v.number()), limit: v.optional(v.number()) },
  handler: async (
    ctx,
    args
  ): Promise<{ ok: boolean; reason?: string; digestId?: string }> => {
    const windowMs = args.windowMs ?? 7 * 24 * 60 * 60 * 1000;
    const windowEnd = Date.now();
    const windowStart = windowEnd - windowMs;

    const signals: any[] = await ctx.runQuery(
      api.newsroom.queries.getTopSignalsByInnovation,
      { limit: args.limit ?? 15, windowMs }
    );

    if (signals.length < 3) {
      return { ok: false, reason: `Not enough recent signals (${signals.length}) to synthesize a digest.` };
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) return { ok: false, reason: "Missing Gemini API key." };

    const client = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    });

    const prompt = `
      You are 'The Lead Desk' of The Latent Times. From the strongest rising signals of the past week,
      write a tight "Lead Indicators" digest for professional decision-makers who want to stay ahead.

      SIGNALS (strongest first):
      ${signals.map((s, i) => `${i + 1}. [${s.source}] ${s.title}: ${(s.content || "").slice(0, 240)}`).join("\n")}

      Return JSON ONLY:
      {
        "title": "A sharp, non-clickbait digest title (max 10 words)",
        "markdown": "A concise markdown digest: a 2-sentence intro, then 3-5 bullet 'lead indicators' (each one line, naming the shift and why it matters). No fluff.",
        "topEntities": ["up to 6 key entities/orgs/people named across the signals"]
      }
    `;

    let parsed: { title?: string; markdown?: string; topEntities?: string[] };
    try {
      const result = await client.models.generateContent({
        model: MODELS.text,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" },
      });
      const text = result.text || "";
      if (!text) throw new Error("Empty response from Gemini.");
      parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch (e) {
      console.error("[generateLeadDigest] synthesis failed:", e);
      return { ok: false, reason: `Synthesis failed: ${e instanceof Error ? e.message : String(e)}` };
    }

    const digestId: string = await ctx.runMutation(api.newsroom.mutations.saveLeadDigest, {
      windowStart,
      windowEnd,
      title: parsed.title || "Lead Indicators",
      markdown: parsed.markdown || "",
      topEntities: Array.isArray(parsed.topEntities) ? parsed.topEntities.slice(0, 6) : [],
      signalCount: signals.length,
    });

    return { ok: true, digestId };
  },
});

type MetaAltitude = "macro" | "meso" | "day";
const coerceMetaAltitude = (v: unknown): MetaAltitude =>
  v === "macro" || v === "meso" || v === "day" ? v : "meso";

/**
 * T-3.5.2 — "State of the Revolution" meta-issue generator.
 *
 * Periodically synthesizes recent narrative pillars (stories), organized by
 * chronicle altitude (macro/meso/day from T-3.5.1), into a meta-issue artifact.
 * Backend only; rendering it into a magazine `issues` entry is a parked
 * presentation step.
 */
export const generateMetaIssue = action({
  args: { limit: v.optional(v.number()) },
  handler: async (
    ctx,
    args
  ): Promise<{ ok: boolean; reason?: string; metaIssueId?: string }> => {
    const stories: any[] = await ctx.runQuery(api.newsroom.queries.getNewsClusters, {
      limit: args.limit ?? 40,
    });
    if (stories.length < 3) {
      return { ok: false, reason: `Not enough pillars (${stories.length}) for a meta-issue.` };
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) return { ok: false, reason: "Missing Gemini API key." };

    const byAltitude = (alt: MetaAltitude) =>
      stories.filter((s) => (s.altitudeTags || []).includes(alt));
    const block = (label: string, list: any[]) =>
      list.length
        ? `${label}:\n${list.map((s) => `- ${s.title}: ${(s.summary || "").slice(0, 200)}`).join("\n")}`
        : "";
    const corpus = [
      block("MACRO (epochal shifts)", byAltitude("macro")),
      block("MESO (multi-week trends)", byAltitude("meso")),
      block("DAY (daily beats)", byAltitude("day")),
    ].filter(Boolean).join("\n\n");

    const client = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    });

    const prompt = `
      You are the Editor-in-Chief of The Latent Times writing a "State of the AI Revolution" meta-issue.
      Synthesize these narrative pillars, organized by altitude, into a chronicle of where the revolution stands.

      ${corpus}

      Return JSON ONLY:
      {
        "title": "A sweeping but precise meta-issue title (max 12 words)",
        "sections": [
          { "altitude": "macro" | "meso" | "day", "heading": "Section heading", "markdown": "2-4 sentence synthesis for this altitude" }
        ]
      }
      Include only altitudes that have pillars above. Be analytical, not hype.
    `;

    let parsed: { title?: string; sections?: any[] };
    try {
      const result = await client.models.generateContent({
        model: MODELS.text,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" },
      });
      const text = result.text || "";
      if (!text) throw new Error("Empty response from Gemini.");
      parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch (e) {
      console.error("[generateMetaIssue] synthesis failed:", e);
      return { ok: false, reason: `Synthesis failed: ${e instanceof Error ? e.message : String(e)}` };
    }

    const sections = (Array.isArray(parsed.sections) ? parsed.sections : [])
      .map((s: any) => ({
        altitude: coerceMetaAltitude(s?.altitude),
        heading: String(s?.heading || "Untitled"),
        markdown: String(s?.markdown || ""),
      }))
      .slice(0, 3);

    if (sections.length === 0) {
      return { ok: false, reason: "Synthesis produced no sections." };
    }

    const now = new Date();
    const periodLabel = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

    const metaIssueId: string = await ctx.runMutation(api.newsroom.mutations.saveMetaIssue, {
      periodLabel,
      title: parsed.title || "State of the Revolution",
      sections,
      storyCount: stories.length,
    });

    return { ok: true, metaIssueId };
  },
});
