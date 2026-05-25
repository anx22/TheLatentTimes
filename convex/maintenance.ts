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
