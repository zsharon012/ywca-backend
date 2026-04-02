import express from 'express';
import schedulesendsController from '../controllers/schedulesendsController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /scheduledsends:
 *   get:
 *     summary: Get all scheduled sends
 *     tags: [Scheduled Sends]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all scheduled sends
 */
router.get('/', authMiddleware, schedulesendsController.getAllScheduledSends);

/**
 * @swagger
 * /scheduledsends/pending:
 *   get:
 *     summary: Get pending scheduled sends (not yet sent)
 *     tags: [Scheduled Sends]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending scheduled sends
 */
router.get('/pending', authMiddleware, schedulesendsController.getPendingScheduledSends);

/**
 * @swagger
 * /scheduledsends:
 *   post:
 *     summary: Create a new scheduled send
 *     tags: [Scheduled Sends]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mailobjectid: { type: string }
 *               sendate: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Scheduled send created
 */
router.post('/', authMiddleware, schedulesendsController.createScheduledSend);

/**
 * @swagger
 * /scheduledsends/{mailobjectid}:
 *   get:
 *     summary: Get a specific scheduled send
 *     tags: [Scheduled Sends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: mailobjectid
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Scheduled send details
 *       404:
 *         description: Scheduled send not found
 */
router.get('/:mailobjectid', authMiddleware, schedulesendsController.getScheduledSendById);

/**
 * @swagger
 * /scheduledsends/{mailobjectid}:
 *   put:
 *     summary: Update a scheduled send
 *     tags: [Scheduled Sends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: mailobjectid
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sendate: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Scheduled send updated
 */
router.put('/:mailobjectid', authMiddleware, schedulesendsController.updateScheduledSend);

/**
 * @swagger
 * /scheduledsends/{mailobjectid}/mark-sent:
 *   patch:
 *     summary: Mark scheduled send as sent
 *     tags: [Scheduled Sends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: mailobjectid
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Scheduled send marked as sent
 */
router.patch('/:mailobjectid/mark-sent', authMiddleware, schedulesendsController.markAsSent);

/**
 * @swagger
 * /scheduledsends/{mailobjectid}:
 *   delete:
 *     summary: Delete a scheduled send
 *     tags: [Scheduled Sends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: mailobjectid
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Scheduled send deleted
 */
router.delete('/:mailobjectid', authMiddleware, schedulesendsController.deleteScheduledSend);

export default router;
