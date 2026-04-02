import contactlistProvider from '../providers/contactlistProviders.js';

const contactlistRepository = {
  getcontactlistmembers: (listname) => contactlistProvider.getcontactlistmembers(listname),
  addtocontactlist: (recipientId, contactlistID) => contactlistProvider.addtocontactlist(recipientId, contactlistID),
  updateContactListMember: (recipientId, firstName, lastName, email, phone) => contactlistProvider.updateContactListMember(recipientId, firstName, lastName, email, phone),
};

export default contactlistRepository;
