import { pgPool } from '../config/database.js';

export default {
  /**
   * Get summary statistics: counts of pending, sent (unread), and read emails.
   * Supports optional period filter: 'daily', 'weekly', 'monthly'.
   */
  async getStatistics(period) {
    let dateFilter = '';
    if (period === 'daily') {
      dateFilter = `AND ss.sendate >= NOW() - INTERVAL '1 day'`;
    } else if (period === 'weekly') {
      dateFilter = `AND ss.sendate >= NOW() - INTERVAL '7 days'`;
    } else if (period === 'monthly') {
      dateFilter = `AND ss.sendate >= NOW() - INTERVAL '30 days'`;
    }

    const sql = `
      SELECT
        COUNT(*) FILTER (WHERE ss.sent = FALSE AND ss.sendate > NOW()) AS pending,
        COUNT(*) FILTER (WHERE ss.sent = TRUE) AS sent,
        COUNT(*) FILTER (WHERE ss.sent = FALSE AND ss.sendate <= NOW()) AS overdue,
        COUNT(*) AS total
      FROM scheduledsends ss
      WHERE 1=1 ${dateFilter}
    `;

    const { rows } = await pgPool.query(sql);
    return rows[0];
  },

  /**
   * Get outbox data: each scheduled email with recipient (contact list name),
   * status (draft/scheduled/sent), sent date, and template info.
   * Supports sorting by column and direction.
   */
  async getOutbox({ sortBy, sortDir, limit, offset }) {
    const allowedSortColumns = {
      recipient: 'cl.name',
      status: 'status',
      sent_date: 'ss.sendate',
      template: 't.name',
    };

    const sortColumn = allowedSortColumns[sortBy] || 'ss.sendate';
    const direction = sortDir === 'asc' ? 'ASC' : 'DESC';

    const sql = `
      SELECT ss.mailobjectid,
             cl.name AS recipient,
             CASE
               WHEN ss.sent = TRUE THEN 'sent'
               WHEN ss.sent = FALSE AND ss.sendate <= NOW() THEN 'overdue'
               ELSE 'scheduled'
             END AS status,
             ss.sendate AS sent_date,
             ss.sent,
             t.name AS template_name,
             t.subject
      FROM scheduledsends ss
      JOIN mailobject mo ON ss.mailobjectid = mo.mailobjectid
      JOIN templates t ON mo.templateid = t.templateid
      JOIN contactlists cl ON mo.contactgroupid = cl.contactgroupid
      ORDER BY ${sortColumn} ${direction}
      LIMIT $1 OFFSET $2
    `;

    const queryLimit = limit || 50;
    const queryOffset = offset || 0;

    const { rows } = await pgPool.query(sql, [queryLimit, queryOffset]);
    return rows;
  },
};
