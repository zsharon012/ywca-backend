import express from 'express';
import signupLinksController from '../controllers/signupLinksController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /signuplinks:
 *   post:
 *     summary: Generate a new signup link
 *     tags: [Signup Links]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               expiryDate: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Signup link generated
 */
router.post('/', authMiddleware, signupLinksController.generateSignupLink);

/**
 * @swagger
 * /signuplinks/validate/{signuptoken}:
 *   get:
 *     summary: Validate signup token
 *     tags: [Signup Links]
 *     parameters:
 *       - name: signuptoken
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Token validation result
 *       400:
 *         description: Invalid or expired token
 */
router.get('/validate/:signuptoken', signupLinksController.validateSignupToken);

/**
 * @swagger
 * /signuplinks/{linkId}:
 *   get:
 *     summary: Get signup link details
 *     tags: [Signup Links]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: linkId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Signup link details
 *       404:
 *         description: Link not found
 */
router.get('/:linkId', authMiddleware, signupLinksController.getSignupLinkDetails);

export default router;
