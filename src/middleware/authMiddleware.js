import admin from '../config/firebase.js';
import userRepository from '../repositories/userRepository.js';

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token =
      authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : null;

    if (!token) {
      return res.status(401).json({ error: 'No Firebase ID token provided' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);

    // Ensure user exists in database (upsert will create if not exists)
    const dbUser = await userRepository.upsertUser({
      uid: decodedToken.uid,
      username: decodedToken.email?.split('@')[0] || decodedToken.uid.substring(0, 20),
      email: decodedToken.email || '',
      firstname: decodedToken.name?.split(' ')[0] || '',
      lastname: decodedToken.name?.split(' ').slice(1).join(' ') || '',
    });

    // Merge database user info with Firebase token info
    req.user = {
      ...decodedToken,
      id: dbUser?.id,  // Add database ID
      username: dbUser?.username,
    };
    next();
  } catch (error) {
    console.error('Firebase Auth middleware error:', error);
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ error: 'Firebase ID token expired' });
    }
    if (error.code === 'auth/invalid-id-token') {
      return res.status(401).json({ error: 'Invalid Firebase ID token' });
    }
    res
      .status(500)
      .json({ error: 'Internal server error during authentication' });
  }
};

export default authMiddleware;