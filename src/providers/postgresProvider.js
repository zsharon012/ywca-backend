import { pgPool } from '../config/database.js';

export default {
  async createUser({ uid, username, email, firstname, lastname }) {
    const sql = `INSERT INTO users (firebase_uid, username, email, firstname, lastname) VALUES ($1, $2, $3, $4, $5) RETURNING id`;
    const { rows } = await pgPool.query(sql, [uid, username, email, firstname, lastname]);
    return { id: rows[0].id, uid, username, email };
  },

  async upsertUser({ uid, username, email, firstname, lastname }) {
    const sql = `
      INSERT INTO users (firebase_uid, username, email, firstname, lastname)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (firebase_uid) DO UPDATE SET
        email = EXCLUDED.email,
        firstname = EXCLUDED.firstname,
        lastname = EXCLUDED.lastname;
    `;
    await pgPool.query(sql, [uid, username, email, firstname, lastname]);
    return this.findByUid(uid);
  },

  async findByUid(uid) {
    const sql = `SELECT id, firebase_uid AS "firebaseUid", username, email, firstname, lastname FROM users WHERE firebase_uid = $1`;
    const { rows } = await pgPool.query(sql, [uid]);
    return rows[0] || null;
  },

  async getAll() {
    const { rows } = await pgPool.query(`SELECT username, email, firstname, lastname FROM users ORDER BY username ASC`);
    return rows;
  },

  async getRecipients() {
    const { rows } = await pgPool.query(`SELECT recipientid, recipientfirstname || ' ' || recipientlastname AS name, recipientemail AS email, recipientphonenumber AS phone FROM recipients ORDER BY recipientfirstname ASC`);
    return rows;
  },

  async updateRecipient(recipientId, { name, email, phone }) {
    const nameParts = name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const sql = `
      UPDATE recipients
      SET recipientfirstname = $1, recipientlastname = $2, recipientemail = $3, recipientphonenumber = $4
      WHERE recipientid = $5
      RETURNING recipientid, recipientfirstname || ' ' || recipientlastname AS name, recipientemail AS email, recipientphonenumber AS phone
    `;

    const { rows } = await pgPool.query(sql, [firstName, lastName, email, phone, recipientId]);
    return rows[0] || null;
  }
};