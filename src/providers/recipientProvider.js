import { pgPool } from '../config/database.js';

export default {
  async getRecipients() {
    const { rows } = await pgPool.query(`
      SELECT recipientid,
             recipientfirstname || ' ' || recipientlastname AS name,
             recipientemail AS email,
             recipientphonenumber AS phone
      FROM recipients
      ORDER BY recipientfirstname ASC
    `);
    return rows;
  },

  async getRecipientById(recipientId) {
    const sql = `
      SELECT recipientid,
             recipientfirstname || ' ' || recipientlastname AS name,
             recipientemail AS email,
             recipientphonenumber AS phone
      FROM recipients
      WHERE recipientid = $1
    `;
    const { rows } = await pgPool.query(sql, [recipientId]);
    return rows[0] || null;
  },

  async updateRecipient(recipientId, { name, email, phone }) {
    const nameParts = name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const sql = `
      UPDATE recipients
      SET recipientfirstname = $1,
          recipientlastname = $2,
          recipientemail = $3,
          recipientphonenumber = $4
      WHERE recipientid = $5
      RETURNING recipientid,
                recipientfirstname || ' ' || recipientlastname AS name,
                recipientemail AS email,
                recipientphonenumber AS phone,
    `;

    const { rows } = await pgPool.query(sql, [firstName, lastName, email, phone, recipientId]);
    return rows[0] || null;
  },
};
