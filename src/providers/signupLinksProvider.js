import { pgPool } from '../config/database.js';
import crypto from 'crypto';

export default {
  generateSignupToken() {
    return crypto.randomBytes(32).toString('hex');
  },

  async createSignupLink(createdBy, expiryDate) {
    const signuptoken = this.generateSignupToken();
    
    const sql = `
      INSERT INTO signuplinks (signuptoken, expirydate, createdby)
      VALUES ($1, $2, $3)
      RETURNING linkid, signuptoken, expirydate, createdby
    `;

    const { rows } = await pgPool.query(sql, [signuptoken, expiryDate, createdBy]);
    return rows[0] || null;
  },

  async validateSignupToken(signuptoken) {
    const sql = `
      SELECT linkid, signuptoken, expirydate, createdby
      FROM signuplinks
      WHERE signuptoken = $1
    `;

    const { rows } = await pgPool.query(sql, [signuptoken]);
    
    if (rows.length === 0) {
      return { valid: false, message: 'Invalid signup token' };
    }

    const link = rows[0];
    const currentDate = new Date();
    
    if (new Date(link.expirydate) < currentDate) {
      return { valid: false, message: 'Signup token has expired' };
    }

    return { valid: true, data: link };
  },

  async deleteSignupLink(signuptoken) {
    const sql = `
      DELETE FROM signuplinks
      WHERE signuptoken = $1
      RETURNING linkid, signuptoken
    `;

    const { rows } = await pgPool.query(sql, [signuptoken]);
    return rows[0] || null;
  },

  async getSignupLink(linkId) {
    const sql = `
      SELECT linkid, signuptoken, expirydate, createdby
      FROM signuplinks
      WHERE linkid = $1
    `;

    const { rows } = await pgPool.query(sql, [linkId]);
    return rows[0] || null;
  }
};
