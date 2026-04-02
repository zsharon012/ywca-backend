import signupLinksProvider from '../providers/signupLinksProvider.js';

const signupLinksRepository = {
  generateSignupToken: () => signupLinksProvider.generateSignupToken(),
  createSignupLink: (createdBy, expiryDate) => signupLinksProvider.createSignupLink(createdBy, expiryDate),
  validateSignupToken: (signuptoken) => signupLinksProvider.validateSignupToken(signuptoken),
  deleteSignupLink: (signuptoken) => signupLinksProvider.deleteSignupLink(signuptoken),
};

export default signupLinksRepository;
