import { pool } from '../config/database.js';

export default {
  async createUser({ uid, username, email, firstname, lastname }) {
    const sql = `INSERT INTO users (firebase_uid, username, email, firstname, lastname) VALUES (?, ?, ?, ?, ?)`;
    const [result] = await pool.execute(sql, [uid, username, email, firstname, lastname]);
    return { id: result.insertId, uid, username, email };
  },

  async upsertUser({ uid, username, email, firstname, lastname }) {
    const sql = `
      INSERT INTO users (firebase_uid, username, email, firstname, lastname)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        email = VALUES(email),
        firstname = VALUES(firstname),
        lastname = VALUES(lastname);
    `;
    await pool.execute(sql, [uid, username, email, firstname, lastname]);
    return this.findByUid(uid);
  },

  async findByUid(uid) {
    const sql = `SELECT id, firebase_uid AS firebaseUid, username, email, firstname, lastname FROM users WHERE firebase_uid = ?`;
    const [rows] = await pool.execute(sql, [uid]);
    return rows[0] || null;
  },

  async getAll() {
    const [rows] = await pool.execute(`SELECT username, email, firstname, lastname FROM users ORDER BY username ASC`);
    return rows;
  },

  async getRecipients() {
    const [rows] = await pool.execute(`SELECT recipientid, CONCAT(recipientfirstname, ' ', recipientlastname) AS name, recipientemail AS email, recipientphonenumber AS phone FROM recipients ORDER BY recipientfirstname ASC`);
    return rows;
  },

  async updateRecipient(recipientId, { name, email, phone }) {
    const nameParts = name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const sql = `
      UPDATE recipients
      SET recipientfirstname = ?, recipientlastname = ?, recipientemail = ?, recipientphonenumber = ?
      WHERE recipientid = ?
    `;

    await pool.execute(sql, [firstName, lastName, email, phone, recipientId]);

    // Return updated recipient
    const [rows] = await pool.execute(`SELECT recipientid, CONCAT(recipientfirstname, ' ', recipientlastname) AS name, recipientemail AS email, recipientphonenumber AS phone FROM recipients WHERE recipientid = ?`, [recipientId]);
    return rows[0] || null;
  }
};