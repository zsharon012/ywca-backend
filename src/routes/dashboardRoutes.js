import express from 'express';
import dashboardController from '../controllers/dashboardController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /dashboard/statistics:
 *   get:
 *     summary: Get email summary statistics (pending, sent, overdue counts)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: period
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *         description: Filter statistics by time period
 *     responses:
 *       200:
 *         description: Summary statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pending: { type: integer }
 *                 sent: { type: integer }
 *                 overdue: { type: integer }
 *                 total: { type: integer }
 */
router.get('/statistics', authMiddleware, dashboardController.getStatistics);

/**
 * @swagger
 * /dashboard/outbox:
 *   get:
 *     summary: Get outbox table data (recipient, status, sent date, template)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: sortBy
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [recipient, status, sent_date, template]
 *       - name: sortDir
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *       - name: offset
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of outbox entries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   mailobjectid: { type: string }
 *                   recipient: { type: string }
 *                   status: { type: string }
 *                   sent_date: { type: string, format: date-time }
 *                   sent: { type: boolean }
 *                   template_name: { type: string }
 *                   subject: { type: string }
 */
router.get('/outbox', authMiddleware, dashboardController.getOutbox);

export default router;
