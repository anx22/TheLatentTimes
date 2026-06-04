import { cronJobs } from "convex/server";
import { api, internal } from "./_generated/api";

const crons = cronJobs();

// Run maintenance every hour
crons.interval("cleanup logs", { hours: 1 }, internal.maintenance.cleanupLogs, {});

// Circadian automatic editorial runs (morning, midday, and evening)
crons.cron("autonomous morning sweep", "0 8 * * *", api.newsroom.actions.runScheduledAutonomousRun, {});
crons.cron("autonomous midday sweep", "0 13 * * *", api.newsroom.actions.runScheduledAutonomousRun, {});
crons.cron("autonomous evening sweep", "0 19 * * *", api.newsroom.actions.runScheduledAutonomousRun, {});

// Weekly Lead Indicators digest (T-4.4.1) — Monday 07:00.
crons.cron("weekly lead digest", "0 7 * * 1", api.newsroom.actions.generateLeadDigest, {});

// Monthly "State of the Revolution" meta-issue (T-3.5.2) — 1st of month 06:00.
crons.cron("monthly meta issue", "0 6 1 * *", api.newsroom.actions.generateMetaIssue, {});

export default crons;
