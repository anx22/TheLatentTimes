import { mutation } from "../../_generated/server";
import { v } from "convex/values";

// 7. WORKBENCH SESSION MUTATIONS (Methodology 1)
export const createWorkbenchSession = mutation({
  args: {
    signals: v.array(v.id("signals")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("workbench_sessions", {
      signals: args.signals,
      status: "active",
      created_at: Date.now(),
      updated_at: Date.now(),
    });
  },
});

export const updateWorkbenchSession = mutation({
  args: {
    id: v.id("workbench_sessions"),
    context: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("processing"), v.literal("completed"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updated_at: Date.now(),
    });
  },
});

export const saveStoryAngles = mutation({
  args: {
    angles: v.array(v.object({
      workbenchId: v.id("workbench_sessions"),
      title: v.string(),
      summary: v.string(),
      selected: v.boolean(),
    })),
  },
  handler: async (ctx, args) => {
    // Delete old angles for the workbench first to allow replacement
    if (args.angles.length > 0) {
      const workbenchId = args.angles[0].workbenchId;
      const existing = await ctx.db.query("story_angles")
        .withIndex("by_workbench", q => q.eq("workbenchId", workbenchId))
        .collect();
      
      for (const angle of existing) {
        await ctx.db.delete(angle._id);
      }
    }

    const ids = [];
    for (const angle of args.angles) {
      const id = await ctx.db.insert("story_angles", {
        ...angle,
        created_at: Date.now(),
      });
      ids.push(id);
    }
    return ids;
  },
});

export const toggleStoryAngle = mutation({
  args: { id: v.id("story_angles"), selected: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { selected: args.selected });
  }
});
