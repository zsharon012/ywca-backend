import templatesProvider from '../providers/templatesProvider.js';

const templatesRepository = {
  getAllTemplates: () => templatesProvider.getAllTemplates(),
  getTemplateById: (templateid) => templatesProvider.getTemplateById(templateid),
  createTemplate: (name, subject, body, createdby, customname) => templatesProvider.createTemplate(name, subject, body, createdby, customname),
};

export default templatesRepository;
