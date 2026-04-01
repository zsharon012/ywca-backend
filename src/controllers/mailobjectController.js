import mailobjectProvider from '../providers/mailobjectProvider.js';

const mailobjectController = {
  async getAllMailObjects(req, res) {
    try {
      const mailObjects = await mailobjectProvider.getAllMailObjects();
      res.status(200).json(mailObjects);
    } catch (error) {
      console.error('Get all mail objects error:', error);
      res.status(500).json({ error: 'Failed to retrieve mail objects' });
    }
  },

  async getMailObjectById(req, res) {
    try {
      const { mailobjectid } = req.params;

      if (!mailobjectid) {
        return res.status(400).json({
          error: 'mailobjectid is required'
        });
      }

      const mailObject = await mailobjectProvider.getMailObjectById(mailobjectid);

      if (!mailObject) {
        return res.status(404).json({
          error: 'Mail object not found'
        });
      }

      res.status(200).json(mailObject);
    } catch (error) {
      console.error('Get mail object by id error:', error);
      res.status(500).json({ error: 'Failed to retrieve mail object' });
    }
  },

  async createMailObject(req, res) {
    try {
      const { templateid, contactgroupid } = req.body;

      if (!templateid || !contactgroupid) {
        return res.status(400).json({
          error: 'templateid and contactgroupid are required'
        });
      }

      const mailObject = await mailobjectProvider.createMailObject(templateid, contactgroupid);

      if (!mailObject) {
        return res.status(500).json({
          error: 'Failed to create mail object'
        });
      }

      res.status(201).json({
        message: 'Mail object created successfully',
        data: mailObject
      });
    } catch (error) {
      console.error('Create mail object error:', error);
      if (error.code === '23503') {
        return res.status(400).json({ error: 'Invalid templateid or contactgroupid' });
      }
      res.status(500).json({ error: 'Failed to create mail object' });
    }
  },

  async deleteMailObject(req, res) {
    try {
      const { mailobjectid } = req.params;

      if (!mailobjectid) {
        return res.status(400).json({
          error: 'mailobjectid is required'
        });
      }

      const result = await mailobjectProvider.deleteMailObject(mailobjectid);

      if (!result) {
        return res.status(404).json({
          error: 'Mail object not found'
        });
      }

      res.status(200).json({
        message: 'Mail object deleted successfully',
        data: result
      });
    } catch (error) {
      console.error('Delete mail object error:', error);
      res.status(500).json({ error: 'Failed to delete mail object' });
    }
  }
};

export default mailobjectController;
