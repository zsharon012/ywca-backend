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
  const template = (templateRes && templateRes.rows && templateRes.rows[0]) || null;

  // Fetch recipients by explicit ids (optional)
  let recipients = [];
  if (recipientids && Array.isArray(recipientids) && recipientids.length > 0) {
    const recipientRes = await pgPool.query(recipientsql, [recipientids]);
    recipients = (recipientRes && recipientRes.rows) || [];
  }

  // Fetch recipients from contact lists (optional)
  let contactlistRecipients = [];
  if (contactgroupids && Array.isArray(contactgroupids) && contactgroupids.length > 0) {
    const contactlistRes = await pgPool.query(contactlistsql, [contactgroupids]);
    contactlistRecipients = (contactlistRes && contactlistRes.rows) || [];
  }

  // Merge recipients from explicit ids and contact lists, remove duplicates
  const mergedMap = new Map();
  const addRecipient = (r) => {
    const key = (r && r.recipientid) || (r && r.recipientemail) || JSON.stringify(r);
    if (!mergedMap.has(key)) mergedMap.set(key, r);
  };

  recipients.forEach(addRecipient);
  contactlistRecipients.forEach(addRecipient);

  const mergedRecipients = Array.from(mergedMap.values());

  const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
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
    // Send one email per recipient
    const sendResults = [];
    for (const r of mergedRecipients) {
      try {
        const to = r.recipientemail;
        const recipientFirstName = (r && r.recipientfirstname) || '';

        const personalizedHtml = template && template.body
          ? template.body.replace(/\{\{\s*first_name\s*\}\}/gi, recipientFirstName)
          : '';

        const textFallback = (personalizedHtml || '').replace(/<[^>]+>/g, '') || '';

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

        const preview = nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) : null;
        console.log(`Message sent to ${to}: ${info.messageId} from ${fromAddress}`);
        if (preview) console.log(`Preview URL: ${preview}`);

        sendResults.push({ to, from: fromAddress, messageId: info.messageId, preview });
      } catch (err) {
        console.error(`Error sending to ${r.recipientemail}:`, err);
        sendResults.push({ to: r.recipientemail, error: err.message || String(err) });
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