import contactlistProviders from '../providers/contactlistProviders.js';
import recipientProvider from '../providers/recipientProvider.js';

const contactsController = {
  async getAllRecipients(req, res) {
    try {
      const recipients = await recipientProvider.getRecipients();
      res.status(200).json(recipients);
    } catch (error) {
      console.error('Get all recipients error:', error);
      res.status(500).json({ error: 'Failed to retrieve recipients' });
    }
  },

  async getRecipientById(req, res) {
    try {
      const { recipientId } = req.params;

      if (!recipientId) {
        return res.status(400).json({
          error: 'recipientId is required'
        });
      }

      const recipient = await recipientProvider.getRecipientById(recipientId);

      if (!recipient) {
        return res.status(404).json({ error: 'Recipient not found' });
      }

      res.status(200).json(recipient);
    } catch (error) {
      console.error('Get recipient by id error:', error);
      res.status(500).json({ error: 'Failed to retrieve recipient' });
    }
  },

  async getRecipientsWithGroups(req, res) {
    try {
      const recipients = await recipientProvider.getRecipientsWithGroups();
      res.status(200).json(recipients);
    } catch (error) {
      console.error('Get recipients with groups error:', error);
      res.status(500).json({ error: 'Failed to retrieve recipients with groups' });
    }
  },

  async createRecipient(req, res) {
    try {
      const { firstName, lastName, email, phone } = req.body;

      if (!firstName || !email) {
        return res.status(400).json({
          error: 'firstName and email are required'
        });
      }

      const recipient = await recipientProvider.createRecipient(firstName, lastName || '', email, phone || null);

      res.status(201).json({
        message: 'Recipient created successfully',
        data: recipient
      });
    } catch (error) {
      console.error('Create recipient error:', error);
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Recipient with this email already exists' });
      }
      res.status(500).json({ error: 'Failed to create recipient' });
    }
  },

  async deleteRecipient(req, res) {
    try {
      const { recipientId } = req.params;

      if (!recipientId) {
        return res.status(400).json({
          error: 'recipientId is required'
        });
      }

      const result = await recipientProvider.deleteRecipient(recipientId);

      if (!result) {
        return res.status(404).json({ error: 'Recipient not found' });
      }

      res.status(200).json({
        message: 'Recipient deleted successfully',
        data: result
      });
    } catch (error) {
      console.error('Delete recipient error:', error);
      res.status(500).json({ error: 'Failed to delete recipient' });
    }
  },

  async getContactListMembers(req, res) {
    try {
      const { listname } = req.params;

      if (!listname) {
        return res.status(400).json({
          error: 'Contact list name is required'
        });
      }

      const members = await contactlistProviders.getcontactlistmembers(listname);
      res.status(200).json(members);
    } catch (error) {
      console.error('Get contact list members error:', error);
      res.status(500).json({ error: 'Failed to retrieve contact list members' });
    }
  },

  async getAllContactLists(req, res) {
    try {
      const lists = await contactlistProviders.getAllContactLists();
      res.status(200).json(lists);
    } catch (error) {
      console.error('Get all contact lists error:', error);
      res.status(500).json({ error: 'Failed to retrieve contact lists' });
    }
  },

  async createContactList(req, res) {
    try {
      const { name, description } = req.body;
      if (!name) {
        return res.status(400).json({
          error: 'Contact list name is required'
        });
      }

      const list = await contactlistProviders.createContactList(name, description || null);

      res.status(201).json({
        message: 'Contact list created successfully',
        data: list
      });
    } catch (error) {
      console.error('Create contact list error:', error);
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Contact list with this name already exists' });
      }
      res.status(500).json({ error: 'Failed to create contact list' });
    }
  },

  async deleteContactList(req, res) {
    try {
      const { contactListId } = req.params;

      if (!contactListId) {
        return res.status(400).json({
          error: 'contactListId is required'
        });
      }

      const result = await contactlistProviders.deleteContactList(contactListId);

      if (!result) {
        return res.status(404).json({ error: 'Contact list not found' });
      }

      res.status(200).json({
        message: 'Contact list deleted successfully',
        data: result
      });
    } catch (error) {
      console.error('Delete contact list error:', error);
      res.status(500).json({ error: 'Failed to delete contact list' });
    }
  },

  async addToContactList(req, res) {
    try {
      const { recipientId, contactlistID } = req.body;

      if (!recipientId || !contactlistID) {
        return res.status(400).json({
          error: 'recipientId and contactlistID are required'
        });
      }

      const result = await contactlistProviders.addtocontactlist(recipientId, contactlistID);
      res.status(201).json({
        message: 'Member added to contact list successfully',
        data: result
      });
    } catch (error) {
      console.error('Add to contact list error:', error);
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Member already exists in this contact list' });
      }
      res.status(500).json({ error: 'Failed to add member to contact list' });
    }
  },

  async updateContactListMember(req, res) {
    try {
      const { recipientId } = req.params;
      const { firstName, lastName, email, phone } = req.body;

      if (!recipientId) {
        return res.status(400).json({
          error: 'recipientId is required'
        });
      }

      if (!firstName || !lastName || !email) {
        return res.status(400).json({
          error: 'firstName, lastName, and email are required'
        });
      }

      const updatedMember = await contactlistProviders.updateContactListMember(
        recipientId,
        firstName,
        lastName,
        email,
        phone || null
      );

      if (!updatedMember) {
        return res.status(404).json({ error: 'Contact member not found' });
      }

      res.status(200).json({
        message: 'Contact member updated successfully',
        data: updatedMember
      });
    } catch (error) {
      console.error('Update contact list member error:', error);
      res.status(500).json({ error: 'Failed to update contact member' });
    }
  },

  async deleteFromContactList(req, res) {
    try {
      const { contactGroupId, recipientId } = req.params;

      if (!contactGroupId || !recipientId) {
        return res.status(400).json({
          error: 'contactGroupId and recipientId are required'
        });
      }

      const result = await contactlistProviders.deleteFromContactList(contactGroupId, recipientId);

      if (!result) {
        return res.status(404).json({ error: 'Member not found in this contact list' });
      }

      res.status(200).json({
        message: 'Member removed from contact list successfully',
        data: result
      });
    } catch (error) {
      console.error('Delete from contact list error:', error);
      res.status(500).json({ error: 'Failed to remove member from contact list' });
    }
  },

  async bulkInsertRecipients(req, res) {
    try {
      const { contacts } = req.body;

      if (!Array.isArray(contacts) || contacts.length === 0) {
        return res.status(400).json({ error: 'No contacts provided' });
      }

      const result = await recipientProvider.bulkInsertRecipients(contacts);

      res.status(201).json({
        message: 'Contacts bulk uploaded successfully',
        ...result
      });
    } catch (error) {
      console.error('Bulk insert recipients error:', error);
      res.status(500).json({ error: 'Failed to insert contacts' });
    }
  }
};

export default contactsController;

