import templatesProvider from '../providers/templatesProvider.js';

const templatesController = {
  async getAllTemplates(req, res) {
    try {
      const templates = await templatesProvider.getAllTemplates();
      res.status(200).json(templates);
    } catch (error) {
      console.error('Get all templates error:', error);
      res.status(500).json({ error: 'Failed to retrieve templates' });
    }
  },

  async getTemplateById(req, res) {
    try {
      const { templateid } = req.params;

      if (!templateid) {
        return res.status(400).json({
          error: 'templateid is required'
        });
      }

      const template = await templatesProvider.getTemplateById(templateid);

      if (!template) {
        return res.status(404).json({
          error: 'Template not found'
        });
      }

      res.status(200).json(template);
    } catch (error) {
      console.error('Get template by id error:', error);
      res.status(500).json({ error: 'Failed to retrieve template' });
    }
  },

  async createTemplate(req, res) {
    try {
      const { name, subject, body, customname } = req.body;
      const createdby = req.user?.id; // Assuming authMiddleware sets req.user

      if (!name || !subject || !body) {
        return res.status(400).json({
          error: 'name, subject, and body are required'
        });
      }

      if (!createdby) {
        return res.status(401).json({
          error: 'User not authenticated'
        });
      }

      const template = await templatesProvider.createTemplate(
        name,
        subject,
        body,
        createdby,
        customname || false
      );

      if (!template) {
        return res.status(500).json({
          error: 'Failed to create template'
        });
      }

      res.status(201).json({
        message: 'Template created successfully',
        data: template
      });
    } catch (error) {
      console.error('Create template error:', error);
      res.status(500).json({ error: 'Failed to create template' });
    }
  },

  async updateTemplate(req, res) {
    try {
      const { templateid } = req.params;
      const { name, subject, body, customname } = req.body;

      if (!templateid) {
        return res.status(400).json({
          error: 'templateid is required'
        });
      }

      // At least one field must be provided for update
      if (!name && !subject && !body && customname === undefined) {
        return res.status(400).json({
          error: 'At least one field (name, subject, body, or customname) is required'
        });
      }

      const existingTemplate = await templatesProvider.getTemplateById(templateid);
      
      if (!existingTemplate) {
        return res.status(404).json({
          error: 'Template not found'
        });
      }

      const updatedTemplate = await templatesProvider.updateTemplate(
        templateid,
        name,
        subject,
        body,
        customname
      );

      res.status(200).json({
        message: 'Template updated successfully',
        data: updatedTemplate
      });
    } catch (error) {
      console.error('Update template error:', error);
      res.status(500).json({ error: 'Failed to update template' });
    }
  },

  async deleteTemplate(req, res) {
    try {
      const { templateid } = req.params;

      if (!templateid) {
        return res.status(400).json({
          error: 'templateid is required'
        });
      }

      const result = await templatesProvider.deleteTemplate(templateid);

      if (!result) {
        return res.status(404).json({
          error: 'Template not found'
        });
      }

      res.status(200).json({
        message: 'Template deleted successfully',
        data: result
      });
    } catch (error) {
      console.error('Delete template error:', error);
      if (error.code === '23503') {
        return res.status(400).json({ error: 'Cannot delete template: it is still in use' });
      }
      res.status(500).json({ error: 'Failed to delete template' });
    }
  },

  async getTemplatesByUser(req, res) {
    try {
      const userid = req.user?.id;

      if (!userid) {
        return res.status(401).json({
          error: 'User not authenticated'
        });
      }

      const templates = await templatesProvider.getTemplatesByUser(userid);
      res.status(200).json(templates);
    } catch (error) {
      console.error('Get templates by user error:', error);
      res.status(500).json({ error: 'Failed to retrieve templates' });
    }
  }
};

export default templatesController;
