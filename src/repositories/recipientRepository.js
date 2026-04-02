import recipientProvider from '../providers/recipientProvider.js';

const recipientRepository = {
  getRecipients: () => recipientProvider.getRecipients(),
  updateRecipient: (recipientId, data) => recipientProvider.updateRecipient(recipientId, data),
  getRecipientById: (recipientId) => recipientProvider.getRecipientById(recipientId)
};

export default recipientRepository;
