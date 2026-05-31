import serverless from "serverless-http";
import app from "./server.js";
import { processScheduledSends } from "./scripts/scheduledsender.js";

const serverlessHandler = serverless(app);

export const handler = async (event, context) => {
  // Catch the EventBridge automated timer event
  if (event['detail-type'] === 'Scheduled Event' || event.source === 'aws.events') {
    console.log("EventBridge Timer Triggered: Processing scheduled sends...");
    try {
      await processScheduledSends();
      return {
        statusCode: 200,
        body: JSON.stringify({ ok: true, message: "Cron processed successfully." }),
      };
    } catch (err) {
      console.error("Cron processing failed:", err);
      return {
        statusCode: 500,
        body: JSON.stringify({ ok: false, error: err.message }),
      };
    }
  }

  // Otherwise, route standard web traffic to your Express application
  return await serverlessHandler(event, context);
};