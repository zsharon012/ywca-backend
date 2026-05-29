import { pgPool } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

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
  },

  async bulkInsertRecipients(contacts) {
    if (!Array.isArray(contacts) || contacts.length === 0) {
      throw new Error('No contacts provided');
    }

    // 1. Collect all unique group names across all contacts
    const allGroupNames = [
      ...new Set(
        contacts.flatMap(c => [
          ...(c.groupNames || []),
        ]).filter(Boolean)
      )
    ];

    // 2. Resolve group names → IDs, creating groups that don't exist yet
    const groupNameToId = {};
    for (const name of allGroupNames) {
      // Check if group already exists
      const { rows: existing } = await pgPool.query(
        `SELECT contactgroupid FROM contactlists WHERE name = $1`,
        [name]
      );

      if (existing.length > 0) {
        groupNameToId[name] = existing[0].contactgroupid;
      } else {
        // Create it with required created_at
        const { rows: created } = await pgPool.query(
          `INSERT INTO contactlists (name, created_at) VALUES ($1, NOW()) RETURNING contactgroupid`,
          [name]
        );
        groupNameToId[name] = created[0].contactgroupid;
      }
    }

    // 3. Merge groupNames → groupIds on each contact
    const resolvedContacts = contacts.map(c => ({
      ...c,
      groupIds: [
        ...new Set([
          ...(c.groupIds || []),
          ...(c.groupNames || []).map(n => groupNameToId[n]).filter(Boolean),
        ])
      ],
    }));

    // clear existing recipients and group assignments first
    await pgPool.query('DELETE FROM contactlists_users');
    await pgPool.query('DELETE FROM recipients');

    let insertedCount = 0;

    for (const contact of resolvedContacts) {
      const { name, email, phone, groupIds } = contact;
      const nameParts = name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      const recipientId = uuidv4();

      const sql = `
        INSERT INTO recipients (recipientid, recipientfirstname, recipientlastname, recipientemail, recipientphonenumber)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING recipientid
      `;

      try {
        const { rows } = await pgPool.query(sql, [recipientId, firstName, lastName, email, phone]);
        if (rows.length > 0) {
          insertedCount++;

          // Assign to groups if any
          if (groupIds && groupIds.length > 0) {
            for (const groupId of groupIds) {
              await pgPool.query(
                `INSERT INTO contactlists_users (contactgroupid, recipientid)
                 VALUES ($1, $2)
                 ON CONFLICT DO NOTHING`,
                [groupId, recipientId]
              );
            }
          }
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
