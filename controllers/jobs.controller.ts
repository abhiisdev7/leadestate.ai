import type { Request, Response } from "express";
import { Job } from "~/models/job.model.ts";

export async function list(req: Request, res: Response) {
  const jobs = await Job.find().sort({ name: 1 }).lean().exec();
  res.json(jobs);
}
