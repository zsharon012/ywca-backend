import { pgPool } from '../config/database.js';

export default {
  async getcontactlistmembers(listname) {
    const sql = `
       SELECT recipients.recipientid,
             recipients.recipientfirstname || ' ' || recipients.recipientlastname AS name,
             recipients.recipientemail AS email,
             recipients.recipientphonenumber AS phone,
             contactlists.name AS contactname
      FROM contactlists
      JOIN contactlists_users ON contactlists.contactgroupid = contactlists_users.contactgroupid
      JOIN recipients ON contactlists_users.recipientid = recipients.recipientid
      WHERE contactlists.name = $1
      ORDER BY recipientfirstname ASC
    `;
    const { rows } = await pgPool.query(sql, [listname]);
    return rows;
  },

  async addtocontactlist(recipientId, contactlistID) {
    const sql = `
      INSERT INTO contactlists_users (contactgroupid, recipientid)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      RETURNING contactgroupid, recipientid
    `;

    const { rows } = await pgPool.query(sql, [contactlistID, recipientId]);
    return rows[0] || null;
  },

  async updateContactListMember(recipientId, firstName, lastName, email, phone) {
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

  async deleteFromContactList(contactGroupId, recipientId) {
    const sql = `
      DELETE FROM contactlists_users
      WHERE contactgroupid = $1 AND recipientid = $2
      RETURNING contactgroupid, recipientid
    `;

    const { rows } = await pgPool.query(sql, [contactGroupId, recipientId]);
    return rows[0] || null;
  },

  async getAllContactLists() {
  const sql = `
    SELECT contactgroupid AS id,
           name,
           description,
           created_at,
           updated_at,
           (SELECT COUNT(*) FROM contactlists_users WHERE contactgroupid = contactlists.contactgroupid) AS memberCount
    FROM contactlists
    ORDER BY name ASC
  `;
  const { rows } = await pgPool.query(sql);
  return rows;
},

  async createContactList(name, description = null) {
    const sql = `
      INSERT INTO contactlists (name, description, created_at, updated_at)
      VALUES ($1, $2, NOW(), NOW())
      RETURNING contactgroupid AS id,
                name,
                description,
                created_at,
                updated_at
    `;
    const { rows } = await pgPool.query(sql, [name, description]);
    return rows[0] || null;
  },

  async deleteContactList(contactListId) {
    const sql = `
      DELETE FROM contactlists
      WHERE contactgroupid = $1
      RETURNING contactgroupid AS id
    `;
    
    const { rows } = await pgPool.query(sql, [contactListId]);
    return rows[0] || null;
  }
};
