import { action } from "../_generated/server";
import { v } from "convex/values";

export const fetchRss = action({
  args: { url: v.string() },
  handler: async (ctx, args) => {
    try {
      const response = await fetch(args.url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const text = await response.text();
      return text;
    } catch (error: any) {
      console.error(`Failed to fetch RSS from ${args.url}:`, error);
      throw new Error(`Failed to fetch RSS from ${args.url}: ${error.message}`);
    }
  },
});
