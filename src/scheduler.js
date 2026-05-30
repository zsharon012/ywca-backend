
import { processScheduledSends } from "./scheduler/handler.js";

export const runScheduler = async () => {
  console.log("Scheduler triggered");
  await processScheduledSends();
};

export const handler = async () => {
  return runScheduler();
};