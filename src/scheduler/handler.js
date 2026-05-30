import { processScheduledSends } from "../scripts/processScheduledSends.js";

export const handler = async () => {


  try {
    const result = await processScheduledSends();


    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        result,
      }),
    };
  } catch (err) {
    console.error(" Scheduler failed:", err);

    return {
      statusCode: 500,
      body: JSON.stringify({
        ok: false,
        error: err.message,
      }),
    };
  }
};