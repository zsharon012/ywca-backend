import mailobjectProvider from '../providers/mailobjectProvider.js';

const mailobjectRepository = {
  getAllMailObjects: () => mailobjectProvider.getAllMailObjects(),
  getMailObjectById: (mailobjectid) => mailobjectProvider.getMailObjectById(mailobjectid),
  createMailObject: (templateid, contactgroupid) => mailobjectProvider.createMailObject(templateid, contactgroupid),
};

export default mailobjectRepository;
