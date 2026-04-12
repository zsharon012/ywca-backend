import express from 'express';
import sendmailController from '../controllers/sendmailController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /sendmail:
 *   post:
 *     summary: Send an email using a template to recipients
 *     tags: [Send Mail]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               templateid:
 *                 type: string
 *               recipientids:
 *                 type: array
 *                 items:
 *                   type: string
 *               contactgroupids:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Email send result
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/', authMiddleware, sendmailController.sendMail);

export default router;
