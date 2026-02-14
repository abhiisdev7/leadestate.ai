import mongoose from "mongoose";
import { Env } from "~configs/env.config";
import { createLogger } from "~configs/logger.config.ts";
import { Job } from "~models/job.model";

/**
 * Scheduler configs for the AI Real Estate Agent (Track 2)
 * - inbound_check: Runs every minute to check for new emails and send AI-generated responses to leads
 */
const JOBS_CONFIGS = [
  { name: "inbound_check", corn: "* * * * *", enabled: true },
  { name: "outbound_campaign", corn: "*/5 * * * *", enabled: true },
] as const;

const logger = createLogger("create-scheduler-config");

async function createJobsConfigs() {
  await mongoose.connect(Env.DATABASE_URL);

  for (const config of JOBS_CONFIGS) {
    await Job.findOneAndUpdate(
      { name: config.name },
      { $set: { corn: config.corn, enabled: config.enabled } },
      { upsert: true }
    );
  }

  logger.info("Created/updated scheduler configs");
  await mongoose.disconnect();
}

createJobsConfigs().catch((err: unknown) => {
  logger.error(err as string);
  process.exit(1);
});
