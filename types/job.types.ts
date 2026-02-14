export interface IJobConfig {
  name: string; // name of the scheduler
  corn: string; // corn express to when to run the scheduler
  status: boolean; // if the script is running then it is kept as the true default is false
  enabled: boolean; // weather that scheduler is enabled or not
  lastRun: string; // last run time of the scheduler
  nextRun: string; // next run of the scheduler
  createdAt: string;
  updatedAt: string;
}

export type JobHandler = () => void | Promise<void>;

export enum JOBS {
  FOLLOW_UP = "follow_up",
  NURTURE = "nurture",
  RE_ENGAGEMENT = "re_engagement",
  INBOUND_CHECK = "inbound_check"
}