import { pgPool } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid'; // add this import

export default {
  async getRecipients() {
    const { rows } = await pgPool.query(`
      SELECT
             recipientid,
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
                recipientphonenumber AS phone
    `;

    const { rows } = await pgPool.query(sql, [firstName, lastName, email, phone, recipientId]);
    return rows[0] || null;
  },

  async createRecipient(firstName, lastName, email, phone) {
    const sql = `
      INSERT INTO recipients (recipientfirstname, recipientlastname, recipientemail, recipientphonenumber)
      VALUES ($1, $2, $3, $4)
      RETURNING recipientid,
                recipientfirstname || ' ' || recipientlastname AS name,
                recipientemail AS email,
                recipientphonenumber AS phone
    `;
    
    const { rows } = await pgPool.query(sql, [firstName, lastName, email, phone || null]);
    return rows[0] || null;
  },

  async deleteRecipient(recipientId) {
    const sql = `
      DELETE FROM recipients
      WHERE recipientid = $1
      RETURNING recipientid
    `;
    
    const { rows } = await pgPool.query(sql, [recipientId]);
    return rows[0] || null;
  },

  async getRecipientsWithGroups() {
    const sql = `
      SELECT 
             r.recipientid,
             r.recipientfirstname || ' ' || r.recipientlastname AS name,
             r.recipientemail AS email,
             r.recipientphonenumber AS phone,
             COALESCE(json_agg(json_build_object('id', cl.contactgroupid, 'name', cl.name)) FILTER (WHERE cl.contactgroupid IS NOT NULL), '[]'::json) AS groups
      FROM recipients r
      LEFT JOIN contactlists_users cu ON r.recipientid = cu.recipientid
      LEFT JOIN contactlists cl ON cu.contactgroupid = cl.contactgroupid
      GROUP BY r.recipientid
      ORDER BY r.recipientfirstname ASC
    `;
    
    const { rows } = await pgPool.query(sql);
    return rows;
  }
  async bulkInsertRecipients(contacts) {
    if (!Array.isArray(contacts) || contacts.length === 0) {
      throw new Error('No contacts provided');
    }

    // clear existing recipients first
    await pgPool.query('DELETE FROM recipients');

    let insertedCount = 0;

    for (const contact of contacts) {
      const { name, email, phone } = contact;
      const nameParts = name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const sql = `
        INSERT INTO recipients (recipientid, recipientfirstname, recipientlastname, recipientemail, recipientphonenumber)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING recipientid
      `;

      try {
        const { rows } = await pgPool.query(sql, [uuidv4(), firstName, lastName, email, phone]);
        if (rows.length > 0) {
          insertedCount++;
        }
      } catch (error) {
        console.error(`Error inserting contact ${email}:`, error);
        throw error;
      }
    }

    return {
      total: contacts.length,
      inserted: insertedCount,
      skipped: contacts.length - insertedCount,
    };
  },
};
