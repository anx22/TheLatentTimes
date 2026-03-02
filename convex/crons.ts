import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run maintenance every hour
crons.interval(
  "cleanup logs",
  { hours: 1 },
  internal.maintenance.cleanupLogs
);

export default crons;
