import signupLinksProvider from '../providers/signupLinksProvider.js';

const signupLinksController = {
  async generateSignupLink(req, res) {
    try {
      const { expiryDate } = req.body;
      const createdBy = req.user?.id; // Assuming authMiddleware sets req.user

      if (!expiryDate) {
        return res.status(400).json({
          error: 'expiryDate is required'
        });
      }

      if (!createdBy) {
        return res.status(401).json({
          error: 'User not authenticated'
        });
      }

      // Validate that expiryDate is in the future
      const expiry = new Date(expiryDate);
      if (expiry <= new Date()) {
        return res.status(400).json({
          error: 'expiryDate must be in the future'
        });
      }

      const link = await signupLinksProvider.createSignupLink(createdBy, expiryDate);

      if (!link) {
        return res.status(500).json({
          error: 'Failed to create signup link'
        });
      }

      res.status(201).json({
        message: 'Signup link created successfully',
        data: {
          linkId: link.linkid,
          signupToken: link.signuptoken,
          expiryDate: link.expirydate,
          createdBy: link.createdby
        }
      });
    } catch (error) {
      console.error('Generate signup link error:', error);
      res.status(500).json({ error: 'Failed to generate signup link' });
    }
  },

  async validateSignupToken(req, res) {
    try {
      const { signuptoken } = req.params;

      if (!signuptoken) {
        return res.status(400).json({
          error: 'signuptoken is required'
        });
      }

      const validation = await signupLinksProvider.validateSignupToken(signuptoken);

      if (!validation.valid) {
        return res.status(400).json({
          error: validation.message
        });
      }

      res.status(200).json({
        message: 'Signup token is valid',
        data: {
          linkId: validation.data.linkid,
          expiryDate: validation.data.expirydate
        }
      });
    } catch (error) {
      console.error('Validate signup token error:', error);
      res.status(500).json({ error: 'Failed to validate signup token' });
    }
  },

  async getSignupLinkDetails(req, res) {
    try {
      const { linkId } = req.params;

      if (!linkId) {
        return res.status(400).json({
          error: 'linkId is required'
        });
      }

      const link = await signupLinksProvider.getSignupLink(linkId);

      if (!link) {
        return res.status(404).json({
          error: 'Signup link not found'
        });
      }

      // Check if link is expired
      if (new Date(link.expirydate) < new Date()) {
        return res.status(400).json({
          error: 'Signup link has expired'
        });
      }

      res.status(200).json({
        data: {
          linkId: link.linkid,
          expiryDate: link.expirydate,
          createdBy: link.createdby
        }
      });
    } catch (error) {
      console.error('Get signup link details error:', error);
      res.status(500).json({ error: 'Failed to retrieve signup link details' });
    }
  }
};

export default signupLinksController;
