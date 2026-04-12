import express from 'express';
import templatesController from '../controllers/templatesController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /templates:
 *   get:
 *     summary: Get all templates
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all templates
 */
router.get('/', authMiddleware, templatesController.getAllTemplates);

/**
 * @swagger
 * /templates/user/templates:
 *   get:
 *     summary: Get templates created by current user
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's templates
 */

router.post('/', authMiddleware, templatesController.createTemplate);

/**
 * @swagger
 * /templates/{templateid}:
 *   get:
 *     summary: Get a specific template
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: templateid
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Template details
 *       404:
 *         description: Template not found
 */
router.get('/:templateid', authMiddleware, templatesController.getTemplateById);

/**
 * @swagger
 * /templates/{templateid}:
 *   put:
 *     summary: Update a template
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: templateid
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
 *               name: { type: string }
 *               subject: { type: string }
 *               body: { type: string }
 *     responses:
 *       200:
 *         description: Template updated
 */
router.put('/:templateid', authMiddleware, templatesController.updateTemplate);

/**
 * @swagger
 * /templates/{templateid}:
 *   delete:
 *     summary: Delete a template
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: templateid
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Template deleted
 */
router.delete('/:templateid', authMiddleware, templatesController.deleteTemplate);

export default router;
