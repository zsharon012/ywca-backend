import 'dotenv/config';
import path from 'path';
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
    const {
      mailobjectid,
      templateid,
      contactgroupid,
      sendate,
    } = scheduled;

    const scheduledDate = new Date(sendate);
    const now = new Date();

    if (scheduledDate > now) {
      console.log(`Skipping ${mailobjectid}: sendate is still in the future (${sendate}).`);
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

    console.log(`Processing scheduled send ${mailobjectid} for template ${templateid} and group ${contactgroupid}.`);

    try {
      const result = await sendmailProvider.sendMail(templateid, [], [contactgroupid]);

      const errors = (result.sendResults || []).filter((item) => item.error);

      if (errors.length === 0) {
        await schedulesendsProvider.markAsSent(mailobjectid);
        console.log(`Scheduled send ${mailobjectid} completed successfully and marked as sent.`);
      } else {
        console.error(`Scheduled send ${mailobjectid} completed with ${errors.length} error(s). Remaining unsent.`);
        errors.forEach((errorItem) => {
          console.error(` - ${errorItem.to}: ${errorItem.error}`);
        });
      }
    } catch (err) {
      console.error(`Failed to process scheduled send ${mailobjectid}:`, err);
    }
  }
}

const scriptName = path.basename(process.argv[1] || '');
if (scriptName === 'processScheduledSends.js') {
  processScheduledSends()
    .then(() => {
      console.log('Scheduled send processor finished.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Scheduled send processor failed:', err);
      process.exit(1);
    });
}
