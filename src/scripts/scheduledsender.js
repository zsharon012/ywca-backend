import 'dotenv/config';
import schedulesendsProvider from '../providers/schedulesendsProvider.js';
import sendmailProvider from '../providers/sendmailProvider.js';

export async function processScheduledSends() {
  console.log(`Starting scheduled send processor at ${new Date().toISOString()}`);

  const pendingSends = await schedulesendsProvider.getPendingScheduledSends();

  if (!pendingSends || pendingSends.length === 0) {
    console.log('No scheduled sends are due at this time.');
    return;
  }

  console.log(`Found ${pendingSends.length} scheduled send(s) due for delivery.`);

  for (const scheduled of pendingSends) {
    const { mailobjectid, templateid, contactgroupid, sendate } = scheduled;

    const scheduledDate = new Date(sendate);
    const now = new Date();

    if (scheduledDate > now) {
      console.log(`Skipping ${mailobjectid}: sendate is still in the future.`);
      continue;
    }

    if (!templateid) {
      console.error(`Skipping ${mailobjectid}: missing templateid.`);
      continue;
    }

    if (!contactgroupid) {
      console.error(`Skipping ${mailobjectid}: missing contactgroupid.`);
      continue;
    }

    console.log(
      `Processing scheduled send ${mailobjectid} for template ${templateid} and group ${contactgroupid}.`
    );

    try {
      const result = await sendmailProvider.sendMail(
        templateid,
        [],
        [contactgroupid]
      );

      const errors = (result.sendResults || []).filter((item) => item.error);

      if (errors.length === 0) {
        await schedulesendsProvider.markAsSent(mailobjectid);
        console.log(`Marked as sent: ${mailobjectid}`);
      } else {
        console.error(`Send completed with errors: ${mailobjectid}`);
      }

    } catch (err) {
      console.error(`Failed to process scheduled send ${mailobjectid}:`, err);
    }
  }
}

