import { internalMutation } from "./_generated/server";

export const cleanupLogs = internalMutation({
  args: {},
  handler: async (ctx) => {
    const retentionPeriod = 24 * 60 * 60 * 1000; // 24 hours
    const cutoff = Date.now() - retentionPeriod;

    // Fetch logs older than 24 hours
    // We use the index to efficiently find them
    const oldLogs = await ctx.db
      .query("agent_logs")
      .withIndex("by_timestamp", (q) => q.lt("timestamp", cutoff))
      .take(1000); // Limit to 1000 per run to avoid timeouts if there's a huge backlog

    if (oldLogs.length > 0) {
      for (const log of oldLogs) {
        await ctx.db.delete(log._id);
      }
      console.log(`Maintenance: Deleted ${oldLogs.length} expired logs.`);
    }
  },
});

/**
 * One-off wipe of the regenerable pipeline tables.
 *
 * Keeps configuration (`sources`, `newsroom_state`); clears everything that
 * can be produced again by re-running the pipeline. Invoke from CLI:
 *   npx convex run maintenance:wipePipelineData
 */
export const wipePipelineData = internalMutation({
  args: {},
  handler: async (ctx) => {
    const tables = [
      "signals",
      "stories",
      "drafts",
      "agent_logs",
      "missions",
      "images",
      "issues",
    ] as const;

    const counts: Record<string, number> = {};
    for (const table of tables) {
      const rows = await ctx.db.query(table as any).collect();
      for (const row of rows) {
        await ctx.db.delete(row._id);
      }
      counts[table] = rows.length;
    }
    console.log("[WIPE] cleared pipeline tables:", counts);
    return counts;
  },
});
