import schedulesendsProvider from "../providers/schedulesendsProvider.js";
import sendmailProvider from "../providers/sendmailProvider.js";

export async function processScheduledSends() {


  try {
    const pendingSends = await schedulesendsProvider.getPendingScheduledSends();

    if (!pendingSends || pendingSends.length === 0) {
      console.log(" No scheduled sends due.");
      return { processed: 0 };
    }

    console.log(`Found ${pendingSends.length} pending send(s)`);

    let successCount = 0;
    let failCount = 0;
    let skippedCount = 0;

    for (const scheduled of pendingSends) {
      const {
        mailobjectid,
        templateid,
        contactgroupid,
        sendate,
      } = scheduled;

      console.log("------------------------------------");
      console.log("Processing:", mailobjectid);

      // Validate required fields
      if (!templateid) {
        console.error(" Missing templateid, skipping");
        skippedCount++;
        continue;
      }

      if (!contactgroupid) {
        console.error(" Missing contactgroupid, skipping");
        skippedCount++;
        continue;
      }

      if (!sendate) {
        console.error(" Missing sendate, skipping");
        skippedCount++;
        continue;
      }

      const scheduledDate = new Date(sendate);
      const now = new Date();

      if (isNaN(scheduledDate.getTime())) {
        console.error(" Invalid sendate format:", sendate);
        skippedCount++;
        continue;
      }

      if (scheduledDate > now) {
        console.log(" Not due yet, skipping:", sendate);
        skippedCount++;
        continue;
      }

      try {
        console.log(" Sending email for template:", templateid);

        const result = await sendmailProvider.sendMail(
          templateid,
          [],
          [contactgroupid]
        );

        const errors = (result?.sendResults || []).filter(
          (r) => r.error
        );

        if (errors.length === 0) {
          await schedulesendsProvider.markAsSent(mailobjectid);

          console.log(" Sent successfully:", mailobjectid);
          successCount++;
        } else {
          console.error(" Partial/failed send:", errors);
          failCount++;
        }
      } catch (err) {
        console.error(" Send failed for:", mailobjectid);
        console.error(err);
        failCount++;
      }
    }



    return {
      processed: pendingSends.length,
      success: successCount,
      failed: failCount,
      skipped: skippedCount,
    };
  } catch (err) {
    console.error("Fatal scheduler error:", err);
    throw err;
  }
}