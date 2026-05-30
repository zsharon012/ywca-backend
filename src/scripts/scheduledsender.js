import { pgPool } from '../config/database.js';
import nodemailer from 'nodemailer';

async function sendMail(templateid, recipientids = [], contactgroupids = []) {
  const templatesql = `
    SELECT subject, body
    FROM templates
    WHERE templateid = $1;
  `;

  const recipientsql = `
    SELECT recipientid, recipientfirstname, recipientlastname, recipientemail
    FROM recipients
    WHERE recipientid = ANY($1::uuid[]);
  `;

  const contactlistsql = `
    SELECT r.recipientid, r.recipientfirstname, r.recipientlastname, r.recipientemail
    FROM contactlists_users clu
    JOIN recipients r ON clu.recipientid = r.recipientid
    WHERE clu.contactgroupid = ANY($1::uuid[]);
  `;

  // Fetch template
  const templateRes = await pgPool.query(templatesql, [templateid]);
  const template = templateRes?.rows?.[0] || null;

  // Fetch recipients by explicit IDs
  let recipients = [];
  if (recipientids?.length > 0) {
    const recipientRes = await pgPool.query(recipientsql, [recipientids]);
    recipients = recipientRes?.rows || [];
  }

  // Fetch recipients from contact groups
  let contactlistRecipients = [];
  if (contactgroupids?.length > 0) {
    const contactlistRes = await pgPool.query(contactlistsql, [contactgroupids]);
    contactlistRecipients = contactlistRes?.rows || [];
  }

  // Merge + dedupe recipients
  const mergedMap = new Map();

  const addRecipient = (r) => {
    const key = r?.recipientid || r?.recipientemail || JSON.stringify(r);
    if (!mergedMap.has(key)) mergedMap.set(key, r);
  };

  recipients.forEach(addRecipient);
  contactlistRecipients.forEach(addRecipient);

  const mergedRecipients = Array.from(mergedMap.values());

  // SMTP transporter
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.verify();
    console.log("Server is ready to take our messages");
  } catch (err) {
    console.error("Verification failed:", err);
  }

  const sendResults = [];

  for (const r of mergedRecipients) {
    try {
      const to = r.recipientemail;
      const recipientFirstName = r?.recipientfirstname || '';
      const recipientLastName = r?.recipientlastname || '';

      const personalizedHtml = template?.body
        ? template.body
            .replaceAll(
              `<span label="first_name" data-variable="first_name" style="background: rgb(238, 242, 255); color: rgb(55, 48, 163); padding: 2px 6px; border-radius: 6px; font-size: 12px; font-weight: 500;">{{first_name}}</span>`,
              recipientFirstName
            )
            .replaceAll(
              `<span label="last_name" data-variable="last_name" style="background: rgb(238, 242, 255); color: rgb(55, 48, 163); padding: 2px 6px; border-radius: 6px; font-size: 12px; font-weight: 500;">{{last_name}}</span>`,
              recipientLastName
            )
        : '';

      const textFallback = (personalizedHtml || '').replace(/<[^>]+>/g, '');

      const fromAddress = (process.env.SMTP_FROM || 'ywca.disc@gmail.com').trim();
      const fromName = process.env.SMTP_FROM_NAME || 'Example Team';
      const fromHeader = `"${fromName}" <${fromAddress}>`;

      const info = await transporter.sendMail({
        from: fromHeader,
        to,
        subject: template ? template.subject : 'No subject',
        text: textFallback,
        html: personalizedHtml,
        envelope: { from: fromAddress, to },
      });

      console.log(`Message sent to ${to}: ${info.messageId}`);

      sendResults.push({
        to,
        messageId: info.messageId,
      });

    } catch (err) {
      console.error(`Error sending to ${r.recipientemail}:`, err);

      sendResults.push({
        to: r.recipientemail,
        error: err.message || String(err),
      });
    }
  }

  return {
    template,
    recipients: mergedRecipients,
    sendResults,
  };
}

export default {
  sendMail,
};