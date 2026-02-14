import { Cron } from "croner";
import { connectDatabase, disconnectDatabase } from "~/configs/db.config.ts";
import { createLogger } from "~/configs/logger.config.ts";
import { jobsRepo } from "~/repos/jobs.repo.ts";
import { JOBS, type JobHandler } from "~/types/job.types.ts";

import inBoundCheckJob from "~/jobs/inbound-check.job.ts";
import outboundCampaignJob from "~/jobs/outbound-campaign.job.ts";

const logger = createLogger("jobs");

const JOB_HANDLERS: Record<string, JobHandler> = {
  [JOBS.INBOUND_CHECK]: inBoundCheckJob,
  [JOBS.OUTBOUND_CAMPAIGN]: outboundCampaignJob,
};

const activeCrons: Cron[] = [];

// --- Job execution ---

async function executeJob(ctx: { name: string; corn: string; cron: Cron }) {
  const handler = JOB_HANDLERS[ctx.name];
  if (!handler) {
    logger.warn(`No handler for job: ${ctx.name}`);
    return;
  }

  const acquired = await jobsRepo.tryAcquireLock(ctx.name);
  if (!acquired) {
    logger.warn(`Job ${ctx.name} already running, skipping (prevent collision)`);
    return;
  }

  try {
    logger.info(`Running job: ${ctx.name}`);
    await handler();

    const nextRun = ctx.cron.nextRun()?.toISOString();
    await jobsRepo.setRunComplete(ctx.name, new Date().toISOString(), nextRun);
  } catch (err) {
    logger.error(`Job ${ctx.name} failed`, { message: err instanceof Error ? err.message : String(err) });
    await jobsRepo.setStatus(ctx.name, false);
  }
}

// --- Scheduling ---

async function scheduleJobs() {
  const jobs = await jobsRepo.findEnabled();

  if (jobs.length === 0) {
    logger.info("No enabled jobs found");
    await disconnectDatabase();
    process.exit(0);
  }

  for (const job of jobs) {
    const name = job.name;
    const corn = job.corn;

    const cron = new Cron(corn, async (self) => {
      await executeJob({ name, corn, cron: self });
    });

    activeCrons.push(cron);

    const nextRun = cron.nextRun()?.toISOString();
    if (nextRun) await jobsRepo.setNextRun(name, nextRun);

    logger.info(`Scheduled: ${name} (${corn})`);
  }

  logger.info(`Jobs server running (${activeCrons.length} jobs)`);
}

async function shutdown() {
  logger.info("Shutting down...");
  activeCrons.forEach((c) => c.stop());

  await disconnectDatabase().catch(() => { });
  logger.info("Stopped");

  process.exit(0);
}

// --- Entry ---

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

connectDatabase()
  .then(scheduleJobs)
  .catch((err) => {
    logger.error("Failed to start", { message: err instanceof Error ? err.message : String(err) });
    process.exit(1);
  });
