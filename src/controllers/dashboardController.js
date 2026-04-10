import dashboardProvider from '../providers/dashboardProvider.js';

const dashboardController = {
  async getStatistics(req, res) {
    try {
      const { period } = req.query; // 'daily', 'weekly', 'monthly', or omit for all-time
      const stats = await dashboardProvider.getStatistics(period);
      res.status(200).json(stats);
    } catch (error) {
      console.error('Get dashboard statistics error:', error);
      res.status(500).json({ error: 'Failed to retrieve dashboard statistics' });
    }
  },

  async getOutbox(req, res) {
    try {
      const { sortBy, sortDir, limit, offset } = req.query;

      const outbox = await dashboardProvider.getOutbox({
        sortBy,
        sortDir,
        limit: limit ? parseInt(limit, 10) : undefined,
        offset: offset ? parseInt(offset, 10) : undefined,
      });

      res.status(200).json(outbox);
    } catch (error) {
      console.error('Get dashboard outbox error:', error);
      res.status(500).json({ error: 'Failed to retrieve outbox data' });
    }
  },
};

export default dashboardController;
