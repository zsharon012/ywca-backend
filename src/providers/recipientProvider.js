import { pgPool } from '../config/database.js';

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
};
