import express from 'express';
import mailobjectController from '../controllers/mailobjectController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /mailobjects:
 *   get:
 *     summary: Get all mail objects
 *     tags: [Mail Objects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all mail objects
 */
router.get('/', authMiddleware, mailobjectController.getAllMailObjects);

/**
 * @swagger
 * /mailobjects:
 *   post:
 *     summary: Create a new mail object
 *     tags: [Mail Objects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               templateid: { type: string }
 *               contactgroupid: { type: string }
 *     responses:
 *       201:
 *         description: Mail object created
 */
router.post('/', authMiddleware, mailobjectController.createMailObject);

/**
 * @swagger
 * /mailobjects/{mailobjectid}:
 *   get:
 *     summary: Get a specific mail object
 *     tags: [Mail Objects]
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
 *         description: Mail object details
 *       404:
 *         description: Mail object not found
 */
router.get('/:mailobjectid', authMiddleware, mailobjectController.getMailObjectById);

/**
 * @swagger
 * /mailobjects/{mailobjectid}:
 *   delete:
 *     summary: Delete a mail object
 *     tags: [Mail Objects]
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
 *         description: Mail object deleted
 */
router.delete('/:mailobjectid', authMiddleware, mailobjectController.deleteMailObject);

export default router;
