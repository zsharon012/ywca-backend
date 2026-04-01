import { pgPool } from '../config/database.js';

export default {
  async getAllMailObjects() {
    const sql = `
      SELECT mo.mailobjectid,
             mo.templateid,
             mo.contactgroupid,
             t.name AS templatename,
             t.subject,
             t.body,
             cl.name AS contactlistname,
             t.createdby,
             t.createdon
      FROM mailobject mo
      JOIN templates t ON mo.templateid = t.templateid
      JOIN contactlists cl ON mo.contactgroupid = cl.contactgroupid
      ORDER BY t.createdon DESC
    `;

    const { rows } = await pgPool.query(sql);
    return rows;
  },

  async getMailObjectById(mailobjectid) {
    const sql = `
      SELECT mo.mailobjectid,
             mo.templateid,
             mo.contactgroupid,
             t.name AS templatename,
             t.subject,
             t.body,
             cl.name AS contactlistname,
             t.createdby,
             t.createdon
      FROM mailobject mo
      JOIN templates t ON mo.templateid = t.templateid
      JOIN contactlists cl ON mo.contactgroupid = cl.contactgroupid
      WHERE mo.mailobjectid = $1
    `;

    const { rows } = await pgPool.query(sql, [mailobjectid]);
    return rows[0] || null;
  },

  async createMailObject(templateid, contactgroupid) {
    const sql = `
      INSERT INTO mailobject (mailobjectid, templateid, contactgroupid)
      VALUES (gen_random_uuid(), $1, $2)
      RETURNING mailobjectid, templateid, contactgroupid
    `;

    const { rows } = await pgPool.query(sql, [templateid, contactgroupid]);
    return rows[0] || null;
  },

  async deleteMailObject(mailobjectid) {
    const sql = `
      DELETE FROM mailobject
      WHERE mailobjectid = $1
      RETURNING mailobjectid, templateid, contactgroupid
    `;

    const { rows } = await pgPool.query(sql, [mailobjectid]);
    return rows[0] || null;
  }
};
