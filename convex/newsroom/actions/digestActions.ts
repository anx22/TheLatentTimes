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
