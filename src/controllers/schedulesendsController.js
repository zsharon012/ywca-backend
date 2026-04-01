import schedulesendsProvider from '../providers/schedulesendsProvider.js';

const schedulesendsController = {
  async getAllScheduledSends(req, res) {
    try {
      const scheduledSends = await schedulesendsProvider.getAllScheduledSends();
      res.status(200).json(scheduledSends);
    } catch (error) {
      console.error('Get all scheduled sends error:', error);
      res.status(500).json({ error: 'Failed to retrieve scheduled sends' });
    }
  },

  async getScheduledSendById(req, res) {
    try {
      const { mailobjectid } = req.params;

      if (!mailobjectid) {
        return res.status(400).json({
          error: 'mailobjectid is required'
        });
      }

      const scheduledSend = await schedulesendsProvider.getScheduledSendById(mailobjectid);

      if (!scheduledSend) {
        return res.status(404).json({
          error: 'Scheduled send not found'
        });
      }

      res.status(200).json(scheduledSend);
    } catch (error) {
      console.error('Get scheduled send by id error:', error);
      res.status(500).json({ error: 'Failed to retrieve scheduled send' });
    }
  },

  async createScheduledSend(req, res) {
    try {
      const { mailobjectid, sendate } = req.body;

      if (!mailobjectid || !sendate) {
        return res.status(400).json({
          error: 'mailobjectid and sendate are required'
        });
      }

      // Validate that sendate is in the future
      const sendDate = new Date(sendate);
      if (sendDate <= new Date()) {
        return res.status(400).json({
          error: 'sendate must be in the future'
        });
      }

      const scheduledSend = await schedulesendsProvider.createScheduledSend(mailobjectid, sendate);

      if (!scheduledSend) {
        return res.status(500).json({
          error: 'Failed to create scheduled send'
        });
      }

      res.status(201).json({
        message: 'Scheduled send created successfully',
        data: scheduledSend
      });
    } catch (error) {
      console.error('Create scheduled send error:', error);
      if (error.code === '23503') {
        return res.status(400).json({ error: 'Invalid mailobjectid' });
      }
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Scheduled send already exists for this mail object' });
      }
      res.status(500).json({ error: 'Failed to create scheduled send' });
    }
  },

  async updateScheduledSend(req, res) {
    try {
      const { mailobjectid } = req.params;
      const { sendate, sent } = req.body;

      if (!mailobjectid) {
        return res.status(400).json({
          error: 'mailobjectid is required'
        });
      }

      // At least one field must be provided for update
      if (sendate === undefined && sent === undefined) {
        return res.status(400).json({
          error: 'At least one field (sendate or sent) is required'
        });
      }

      // Validate sendate if provided
      if (sendate) {
        const sendDate = new Date(sendate);
        if (sendDate <= new Date()) {
          return res.status(400).json({
            error: 'sendate must be in the future'
          });
        }
      }

      const existingScheduledSend = await schedulesendsProvider.getScheduledSendById(mailobjectid);
      
      if (!existingScheduledSend) {
        return res.status(404).json({
          error: 'Scheduled send not found'
        });
      }

      const updatedScheduledSend = await schedulesendsProvider.updateScheduledSend(
        mailobjectid,
        sendate,
        sent
      );

      res.status(200).json({
        message: 'Scheduled send updated successfully',
        data: updatedScheduledSend
      });
    } catch (error) {
      console.error('Update scheduled send error:', error);
      res.status(500).json({ error: 'Failed to update scheduled send' });
    }
  },

  async deleteScheduledSend(req, res) {
    try {
      const { mailobjectid } = req.params;

      if (!mailobjectid) {
        return res.status(400).json({
          error: 'mailobjectid is required'
        });
      }

      const result = await schedulesendsProvider.deleteScheduledSend(mailobjectid);

      if (!result) {
        return res.status(404).json({
          error: 'Scheduled send not found'
        });
      }

      res.status(200).json({
        message: 'Scheduled send deleted successfully',
        data: result
      });
    } catch (error) {
      console.error('Delete scheduled send error:', error);
      res.status(500).json({ error: 'Failed to delete scheduled send' });
    }
  },

  async getPendingScheduledSends(req, res) {
    try {
      const pendingSends = await schedulesendsProvider.getPendingScheduledSends();
      res.status(200).json(pendingSends);
    } catch (error) {
      console.error('Get pending scheduled sends error:', error);
      res.status(500).json({ error: 'Failed to retrieve pending scheduled sends' });
    }
  },

  async markAsSent(req, res) {
    try {
      const { mailobjectid } = req.params;

      if (!mailobjectid) {
        return res.status(400).json({
          error: 'mailobjectid is required'
        });
      }

      const result = await schedulesendsProvider.markAsSent(mailobjectid);

      if (!result) {
        return res.status(404).json({
          error: 'Scheduled send not found'
        });
      }

      res.status(200).json({
        message: 'Scheduled send marked as sent',
        data: result
      });
    } catch (error) {
      console.error('Mark as sent error:', error);
      res.status(500).json({ error: 'Failed to mark scheduled send as sent' });
    }
  }
};

export default schedulesendsController;
