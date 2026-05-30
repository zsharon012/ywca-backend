import { processScheduledSends } from "./scripts/processScheduledSends.js";

export const handler = async () => {
  console.log("Scheduler Lambda triggered");

  try {
    await processScheduledSends();

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    console.error("Scheduler failed:", err);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};