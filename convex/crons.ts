import { cronJobs } from "convex/server";
import { api, internal } from "./_generated/api";

const crons = cronJobs();

// Run maintenance every hour
crons.interval("cleanup logs", { hours: 1 }, internal.maintenance.cleanupLogs, {});

// Circadian automatic editorial runs (morning, midday, and evening)
crons.cron("autonomous morning sweep", "0 8 * * *", api.newsroom.actions.runScheduledAutonomousRun, {});
crons.cron("autonomous midday sweep", "0 13 * * *", api.newsroom.actions.runScheduledAutonomousRun, {});
crons.cron("autonomous evening sweep", "0 19 * * *", api.newsroom.actions.runScheduledAutonomousRun, {});

export default crons;
