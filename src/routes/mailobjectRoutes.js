import express from 'express';
import mailobjectController from '../controllers/mailobjectController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all mail objects
router.get('/', authMiddleware, mailobjectController.getAllMailObjects);

// Create a new mail object
router.post('/', authMiddleware, mailobjectController.createMailObject);

// Get a specific mail object
router.get('/:mailobjectid', authMiddleware, mailobjectController.getMailObjectById);

// Delete a mail object
router.delete('/:mailobjectid', authMiddleware, mailobjectController.deleteMailObject);

export default router;
