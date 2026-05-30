import { pgPool } from '../config/database.js';

export default {
async getAllMailObjects() {
  const sql = `
    SELECT mo.mailobjectid,
           mo.templateid,
           mo.contactgroupid,
           mo.recipientid,
           t.name AS templatename,
           t.subject,
           t.body,
           cl.name AS contactlistname,
           r.recipientfirstname,
           r.recipientlastname,
           r.recipientemail,
           t.createdby,
           t.createdon
    FROM mailobject mo
    JOIN templates t ON mo.templateid = t.templateid
    LEFT JOIN contactlists cl ON mo.contactgroupid = cl.contactgroupid
    LEFT JOIN recipients r ON mo.recipientid = r.recipientid
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
           mo.recipientid,
           t.name AS templatename,
           t.subject,
           t.body,
           cl.name AS contactlistname,
           r.recipientfirstname,
           r.recipientlastname,
           r.recipientemail,
           t.createdby,
           t.createdon
    FROM mailobject mo
    JOIN templates t ON mo.templateid = t.templateid
    LEFT JOIN contactlists cl ON mo.contactgroupid = cl.contactgroupid
    LEFT JOIN recipients r ON mo.recipientid = r.recipientid
    WHERE mo.mailobjectid = $1
  `;

  const { rows } = await pgPool.query(sql, [mailobjectid]);
  return rows[0] || null;
},

  async createMailObject(templateid, contactgroupid = null, recipientid = null) {
  const sql = `
    INSERT INTO mailobject (
      mailobjectid,
      templateid,
      contactgroupid,
      recipientid
    )
    VALUES (gen_random_uuid(), $1, $2, $3)
    RETURNING mailobjectid, templateid, contactgroupid, recipientid
  `;

  const { rows } = await pgPool.query(sql, [
    templateid,
    contactgroupid,
    recipientid
  ]);

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
