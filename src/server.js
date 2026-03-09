import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

import authRoutes from './routes/authRoutes.js';
import authMiddleware from './middleware/authMiddleware.js';
import userRepository from './repositories/userRepository.js';
import { pgPool } from './config/database.js';

dotenv.config();

const app = express();

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      process.env.FRONTEND_URL_DEV,
    ];

    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
};

app.use(cors(corsOptions));

app.use(cookieParser());
app.use(express.json());

app.use((req, res, next) => {
  req.url = req.url.replace(/\/+/g, '/');
  next();
});

app.use('/auth', authRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/get-contacts', async (req, res) => {
  try {
    console.log('Fetching contacts...');
    const contacts = await userRepository.getRecipients();
    console.log('Contacts fetched:', contacts.length);
    res.status(200).json({ data: contacts });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/update-contact/:recipientId', authMiddleware, async (req, res) => {
  try {
    const { recipientId } = req.params;
    const { name, email, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        error: 'Name and email are required',
      });
    }

    const updated = await userRepository.updateRecipient(recipientId, {
      name,
      email,
      phone,
    });

    if (!updated) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    res.status(200).json({ data: updated });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    status: err.status || 500,
  });

  res.status(err.status || 500).json({
    error:
      process.env.NODE_ENV === 'production'
        ? 'Internal Server Error'
        : err.message,
  });
});

if (process.env.NODE_ENV !== 'production') {
  console.log('CORS Configuration:', {
    allowedOrigins: [process.env.FRONTEND_URL, process.env.FRONTEND_URL_DEV],
    credentials: true,
  });
}

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
});
