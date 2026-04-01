import express from 'express';
import schedulesendsController from '../controllers/schedulesendsController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all scheduled sends
router.get('/', authMiddleware, schedulesendsController.getAllScheduledSends);

// Get pending scheduled sends (not yet sent)
router.get('/pending', authMiddleware, schedulesendsController.getPendingScheduledSends);

// Create a new scheduled send
router.post('/', authMiddleware, schedulesendsController.createScheduledSend);

// Get a specific scheduled send
router.get('/:mailobjectid', authMiddleware, schedulesendsController.getScheduledSendById);

// Update a scheduled send
router.put('/:mailobjectid', authMiddleware, schedulesendsController.updateScheduledSend);

// Mark scheduled send as sent
router.patch('/:mailobjectid/mark-sent', authMiddleware, schedulesendsController.markAsSent);

// Delete a scheduled send
router.delete('/:mailobjectid', authMiddleware, schedulesendsController.deleteScheduledSend);

export default router;
