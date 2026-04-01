import express from 'express';
import signupLinksController from '../controllers/signupLinksController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Generate a new signup link (requires authentication)
router.post('/', authMiddleware, signupLinksController.generateSignupLink);

// Validate signup token (no auth required)
router.get('/validate/:signuptoken', signupLinksController.validateSignupToken);

// Get signup link details (requires authentication)
router.get('/:linkId', authMiddleware, signupLinksController.getSignupLinkDetails);

export default router;
