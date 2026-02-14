import mongoose from "mongoose";
import type { IJobConfig } from "~types/job.types";

const JobSchema = new mongoose.Schema<IJobConfig>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    corn: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: Boolean,
      default: false,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    lastRun: {
      type: String,
      default: null,
    },
    nextRun: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Job = mongoose.model<IJobConfig>(
  "jobs",
  JobSchema
);
