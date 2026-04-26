import express from 'express';
import contactsController from '../controllers/contactsController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /contacts/recipients:
 *   get:
 *     summary: Get all recipients
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all recipients
 */
router.get('/recipients', authMiddleware, contactsController.getAllRecipients);

/**
 * @swagger
 * /contacts/recipients/{recipientId}:
 *   get:
 *     summary: Get a specific recipient
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: recipientId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recipient details
 *       404:
 *         description: Recipient not found
 */
router.get('/recipients/:recipientId', authMiddleware, contactsController.getRecipientById);

/**
 * @swagger
 * /contacts/lists/{listname}:
 *   get:
 *     summary: Get all members in a contact list
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: listname
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of members
 */
router.get('/lists/:listname', authMiddleware, contactsController.getContactListMembers);

/**
 * @swagger
 * /contacts/members/add:
 *   post:
 *     summary: Add a member to a contact list
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipientId: { type: string }
 *               contactlistID: { type: string }
 *     responses:
 *       201:
 *         description: Member added successfully
 */
router.post('/members/add', authMiddleware, contactsController.addToContactList);

/**
 * @swagger
 * /contacts/members/{recipientId}:
 *   put:
 *     summary: Update a member in contact list
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: recipientId
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
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *     responses:
 *       200:
 *         description: Member updated successfully
 */
router.put('/members/:recipientId', authMiddleware, contactsController.updateContactListMember);

/**
 * @swagger
 * /contacts/lists/{contactGroupId}/members/{recipientId}:
 *   delete:
 *     summary: Delete a member from contact list
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: contactGroupId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: recipientId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Member deleted successfully
 */
router.delete('/lists/:contactGroupId/members/:recipientId', authMiddleware, contactsController.deleteFromContactList);

/**
 * @swagger
 * /contacts/bulk:
 *   post:
 *     summary: Bulk insert recipients from CSV, clears previous recipients
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contacts:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name: { type: string }
 *                     email: { type: string }
 *                     phone: { type: string }
 *                 description: Array of contact objects with name, email, and phone
 *     responses:
 *       201:
 *         description: Contacts bulk uploaded successfully
 *       400:
 *         description: No contacts provided or invalid format
 *       500:
 *         description: Failed to insert contacts
 */
router.post('/bulk', authMiddleware, contactsController.bulkInsertRecipients);

export default router;
