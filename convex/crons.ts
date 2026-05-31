/* eslint-disable */
//@ts-nocheck
import { cronJobs, makeFunctionReference } from "convex/server";

const crons = cronJobs();

const cleanupLogs = makeFunctionReference("maintenance:cleanupLogs");
const runScheduledAutonomousRun = makeFunctionReference("newsroom/actions:runScheduledAutonomousRun");

// Run maintenance every hour
crons.interval(
  "cleanup logs",
  { hours: 1 },
  cleanupLogs as any
);

// Circadian automatic editorial runs (morning, midday, and evening)
crons.cron(
  "autonomous morning sweep",
  "0 8 * * *",
  runScheduledAutonomousRun as any
);

crons.cron(
  "autonomous midday sweep",
  "0 13 * * *",
  runScheduledAutonomousRun as any
);

crons.cron(
  "autonomous evening sweep",
  "0 19 * * *",
  runScheduledAutonomousRun as any
);

export default crons;
