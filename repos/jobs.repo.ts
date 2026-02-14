import type { IJobConfig } from "~/types/job.types.ts";
import { Job } from "~/models/job.model.ts";

export type JobForSchedule = Pick<IJobConfig, "name" | "corn">;

export class JobsRepo {
  async findEnabled(): Promise<JobForSchedule[]> {
    return Job.find({ enabled: true }).select("name corn").lean().exec();
  }

  async setStatus(name: string, status: boolean): Promise<boolean> {
    const result = await Job.updateOne({ name }, { $set: { status } });
    const matched = result.matchedCount ?? (result as { n?: number }).n ?? 0;
    return matched > 0;
  }

  /** Atomically set status to true only if currently false. Returns true if lock acquired. */
  async tryAcquireLock(name: string): Promise<boolean> {
    const result = await Job.findOneAndUpdate(
      { name, status: false },
      { $set: { status: true } },
      { returnDocument: "after" }
    );
    return result !== null;
  }

  async setRunComplete(
    name: string,
    lastRun: string,
    nextRun?: string
  ): Promise<void> {
    await Job.updateOne(
      { name },
      {
        $set: {
          status: false,
          lastRun,
          ...(nextRun && { nextRun }),
        },
      }
    );
  }

  async setNextRun(name: string, nextRun: string): Promise<void> {
    await Job.updateOne({ name }, { $set: { nextRun } });
  }
}

export const jobsRepo = new JobsRepo();
