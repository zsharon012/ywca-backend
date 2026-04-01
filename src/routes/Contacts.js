import express from 'express';
import contactsController from '../controllers/contactsController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all recipients
router.get('/recipients', authMiddleware, contactsController.getAllRecipients);

// Get specific recipient
router.get('/recipients/:recipientId', authMiddleware, contactsController.getRecipientById);

// Get all members in a contact list
router.get('/lists/:listname', authMiddleware, contactsController.getContactListMembers);

// Add a member to a contact list
router.post('/members/add', authMiddleware, contactsController.addToContactList);

// Update a member in contact list
router.put('/members/:recipientId', authMiddleware, contactsController.updateContactListMember);

// Delete a member from contact list
router.delete('/lists/:contactGroupId/members/:recipientId', authMiddleware, contactsController.deleteFromContactList);

export default router;
