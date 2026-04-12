import { pgPool } from '../config/database.js';

export default {
  async getAllTemplates() {
    const sql = `
      SELECT templateid,
             name,
             subject,
             body,
             customname,
             createdby,
             createdon,
             editedon
      FROM templates
      ORDER BY createdon DESC
    `;

    const { rows } = await pgPool.query(sql);
    return rows;
  },

  async getTemplateById(templateid) {
    const sql = `
      SELECT templateid,
             name,
             subject,
             body,
             customname,
             createdby,
             createdon,
             editedon
      FROM templates
      WHERE templateid = $1
    `;

    const { rows } = await pgPool.query(sql, [templateid]);
    return rows[0] || null;
  },

  async createTemplate(name, subject, body, createdby, customname = false) {
    const sql = `
      INSERT INTO templates (templateid, name, subject, body, customname, createdby, createdon)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())
      RETURNING templateid, name, subject, body, customname, createdby, createdon, editedon
    `;
    
    const { rows } = await pgPool.query(sql, [name, subject, body, customname, createdby]);
    return rows[0] || null;
  },

  async updateTemplate(templateid, name, subject, body, customname) {
    const sql = `
      UPDATE templates
      SET name = COALESCE($1, name),
          subject = COALESCE($2, subject),
          body = COALESCE($3, body),
          customname = COALESCE($4, customname),
          editedon = NOW()
      WHERE templateid = $5
      RETURNING templateid, name, subject, body, customname, createdby, createdon, editedon
    `;

    const { rows } = await pgPool.query(sql, [name, subject, body, customname, templateid]);
    return rows[0] || null;
  },

  async deleteTemplate(templateid) {
    const sql = `
      DELETE FROM templates
      WHERE templateid = $1
      RETURNING templateid, name, subject, body
    `;

    const { rows } = await pgPool.query(sql, [templateid]);
    return rows[0] || null;
  }
};
