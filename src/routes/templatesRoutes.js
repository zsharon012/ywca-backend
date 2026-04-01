import express from 'express';
import templatesController from '../controllers/templatesController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all templates
router.get('/', authMiddleware, templatesController.getAllTemplates);

// Get templates created by current user
router.get('/user/templates', authMiddleware, templatesController.getTemplatesByUser);

// Create a new template
router.post('/', authMiddleware, templatesController.createTemplate);

// Get a specific template
router.get('/:templateid', authMiddleware, templatesController.getTemplateById);

// Update a template
router.put('/:templateid', authMiddleware, templatesController.updateTemplate);

// Delete a template
router.delete('/:templateid', authMiddleware, templatesController.deleteTemplate);

export default router;
