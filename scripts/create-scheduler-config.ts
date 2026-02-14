import mongoose from "mongoose";
import { Env } from "~configs/env.config";
import { createLogger } from "~configs/logger.config.ts";
import { Job } from "~models/job.model";

/**
 * Scheduler configs for the AI Real Estate Agent (Track 2)
 * - follow_up: Daily follow-ups for hot leads
 * - nurture: Nurture sequences for leads in pipeline
 * - re_engagement: Re-engagement campaigns for cold/stale leads
 * - inbound_check: Fast response to new inbound inquiries
 */
const JOBS_CONFIGS = [
  {
    name: "follow_up",
    corn: "* * * * *",
    enabled: false,
  },
  {
    name: "nurture",
    corn: "* * * * *",
    enabled: false,
  },
  {
    name: "re_engagement",
    corn: "* * * * *",
    enabled: false,
  },
  {
    name: "inbound_check",
    corn: "* * * * *",
    enabled: false,
  },
] as const;

const logger = createLogger("create-scheduler-config");

async function createJobsConfigs() {
  await mongoose.connect(Env.DATABASE_URL);
  await Job.insertMany(JOBS_CONFIGS);

  logger.info("Created scheduler configs");
  await mongoose.disconnect();
}

createJobsConfigs().catch((err: unknown) => {
  logger.error(err as string);
  process.exit(1);
});
