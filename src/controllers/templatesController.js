import templatesProvider from '../providers/templatesProvider.js';

const templatesController = {
  async getAllTemplates(req, res) {
    try {
      const templates = await templatesProvider.getAllTemplates();

      res.status(200).json({
        data: templates,
      });
    } catch (error) {
      console.error('Get all templates error:', error);
      res.status(500).json({ error: 'Failed to retrieve templates' });
    }
  },

  async getTemplateById(req, res) {
    try {
      const { templateid } = req.params;

      if (!templateid) {
        return res.status(400).json({ error: 'templateid is required' });
      }

      const template = await templatesProvider.getTemplateById(templateid);

      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      res.status(200).json({
        data: template,
      });
    } catch (error) {
      console.error('Get template by id error:', error);
      res.status(500).json({ error: 'Failed to retrieve template' });
    }
  },

  async createTemplate(req, res) {
    try {
      const { name, subject, body, customname } = req.body;

      const createdby = req.user?.id || null;

      if (!name || !subject || !body) {
        return res.status(400).json({
          error: 'name, subject, and body are required',
        });
      }

      const template = await templatesProvider.createTemplate(
        name,
        subject,
        body,
        createdby,
        Boolean(customname)
      );

      res.status(201).json({
        message: 'Template created successfully',
        data: template,
      });
    } catch (error) {
      console.error('Create template error:', error);
      res.status(500).json({
        error: 'Failed to create template',
      });
    }
  },

  async updateTemplate(req, res) {
    try {
      const { templateid } = req.params;
      const { name, subject, body, customname } = req.body;

      if (!templateid) {
        return res.status(400).json({ error: 'templateid is required' });
      }

      const updatedTemplate = await templatesProvider.updateTemplate(
        templateid,
        name,
        subject,
        body,
        customname
      );

      if (!updatedTemplate) {
        return res.status(404).json({ error: 'Template not found' });
      }

      res.status(200).json({
        message: 'Template updated successfully',
        data: updatedTemplate,
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
        return res.status(400).json({ error: 'templateid is required' });
      }

      const result = await templatesProvider.deleteTemplate(templateid);

      if (!result) {
        return res.status(404).json({ error: 'Template not found' });
      }

      res.status(200).json({
        message: 'Template deleted successfully',
        data: result,
      });
    } catch (error) {
      console.error('Delete template error:', error);

      if (error.code === '23503') {
        return res.status(400).json({
          error: 'Cannot delete template: it is still in use',
        });
      }

      res.status(500).json({
        error: 'Failed to delete template',
      });
    }
  },
};

export default templatesController;