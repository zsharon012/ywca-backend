import { pgPool } from '../config/database.js';

export default {
  async getAllScheduledSends() {
    const sql = `
      SELECT ss.mailobjectid,
             ss.sendate,
             ss.sent,
             mo.templateid,
             mo.contactgroupid,
             t.name AS templatename,
             t.subject,
             cl.name AS contactlistname
      FROM scheduledsends ss
      JOIN mailobject mo ON ss.mailobjectid = mo.mailobjectid
      JOIN templates t ON mo.templateid = t.templateid
      JOIN contactlists cl ON mo.contactgroupid = cl.contactgroupid
      ORDER BY ss.sendate DESC
    `;

    const { rows } = await pgPool.query(sql);
    return rows;
  },

  async getScheduledSendById(mailobjectid) {
    const sql = `
      SELECT ss.mailobjectid,
             ss.sendate,
             ss.sent,
             mo.templateid,
             mo.contactgroupid,
             t.name AS templatename,
             t.subject,
             cl.name AS contactlistname
      FROM scheduledsends ss
      JOIN mailobject mo ON ss.mailobjectid = mo.mailobjectid
      JOIN templates t ON mo.templateid = t.templateid
      JOIN contactlists cl ON mo.contactgroupid = cl.contactgroupid
      WHERE ss.mailobjectid = $1
    `;

    const { rows } = await pgPool.query(sql, [mailobjectid]);
    return rows[0] || null;
  },

  async createScheduledSend(mailobjectid, sendate) {
    const sql = `
      INSERT INTO scheduledsends (mailobjectid, sendate, sent)
      VALUES ($1, $2, FALSE)
      RETURNING mailobjectid, sendate, sent
    `;

    const { rows } = await pgPool.query(sql, [mailobjectid, sendate]);
    return rows[0] || null;
  },

  async updateScheduledSend(mailobjectid, sendate, sent) {
    const sql = `
      UPDATE scheduledsends
      SET sendate = COALESCE($1, sendate),
          sent = COALESCE($2, sent)
      WHERE mailobjectid = $3
      RETURNING mailobjectid, sendate, sent
    `;

    const { rows } = await pgPool.query(sql, [sendate, sent, mailobjectid]);
    return rows[0] || null;
  },

  async deleteScheduledSend(mailobjectid) {
    const sql = `
      DELETE FROM scheduledsends
      WHERE mailobjectid = $1
      RETURNING mailobjectid, sendate, sent
    `;

    const { rows } = await pgPool.query(sql, [mailobjectid]);
    return rows[0] || null;
  },

  async getPendingScheduledSends() {
    const sql = `
      SELECT ss.mailobjectid,
             ss.sendate,
             ss.sent,
             mo.templateid,
             mo.contactgroupid,
             t.name AS templatename,
             t.subject,
             cl.name AS contactlistname
      FROM scheduledsends ss
      JOIN mailobject mo ON ss.mailobjectid = mo.mailobjectid
      JOIN templates t ON mo.templateid = t.templateid
      JOIN contactlists cl ON mo.contactgroupid = cl.contactgroupid
      WHERE ss.sent = FALSE AND ss.sendate <= NOW()
      ORDER BY ss.sendate ASC
    `;

    const { rows } = await pgPool.query(sql);
    return rows;
  },

  async markAsSent(mailobjectid) {
    const sql = `
      UPDATE scheduledsends
      SET sent = TRUE
      WHERE mailobjectid = $1
      RETURNING mailobjectid, sendate, sent
    `;

    const { rows } = await pgPool.query(sql, [mailobjectid]);
    return rows[0] || null;
  }
};
