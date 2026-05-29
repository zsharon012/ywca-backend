import 'dotenv/config';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import authRoutes from './routes/authRoutes.js';
import contactsRoutes from './routes/Contacts.js';
import mailobjectRoutes from './routes/mailobjectRoutes.js';
import schedulesendsRoutes from './routes/schedulesendsRoutes.js';
import signupLinksRoutes from './routes/signupLinksRoutes.js';
import templatesRoutes from './routes/templatesRoutes.js';
import sendmailRoutes from './routes/sendmailRoutes.js';
import { processScheduledSends } from './scripts/processScheduledSends.js';
// import authMiddleware from './middleware/authMiddleware.js';
// import recipientRepository from './repositories/recipientRepository.js';
import swaggerOptions from './config/swaggerConfig.js';
// import { pgPool } from './config/database.js';
import uploadRoutes from './routes/imagebucketRoutes.js';

const app = express();

const corsOptions = {
  origin: 'https://ywca-disc.web.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
  console.log('HIT:', req.method, req.path);
  next();
});

app.use(cookieParser());
app.use(express.json());

app.use((req, res, next) => {
  req.url = req.url.replace(/\/+/g, '/');
  next();
});

// Swagger UI
const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  swaggerOptions: {
    persistAuthorization: true,
  },
}));

app.use('/auth', authRoutes);
app.use('/contacts', contactsRoutes);
app.use('/mailobjects', mailobjectRoutes);
app.use('/scheduledsends', schedulesendsRoutes);
app.use('/sendmail', sendmailRoutes);
app.use('/signuplinks', signupLinksRoutes);
app.use('/templates', templatesRoutes);
app.use('/images', uploadRoutes);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server is healthy
 */
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// /**
//  * @swagger
//  * /get-contacts:
//  *   get:
//  *     summary: Get all contacts (legacy endpoint)
//  *     tags: [Contacts]
//  *     responses:
//  *       200:
//  *         description: List of all contacts
//  *       500:
//  *         description: Internal server error
//  */
// app.get('/get-contacts', async (req, res) => {
//   try {
//     console.log('Fetching contacts...');
//     const contacts = await recipientRepository.getRecipients();
//     console.log('Contacts fetched:', contacts.length);
//     res.status(200).json({ data: contacts });
//   } catch (error) {
//     console.error('Get contacts error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// /**
//  * @swagger
//  * /update-contact/{recipientId}:
//  *   put:
//  *     summary: Update a contact (legacy endpoint)
//  *     tags: [Contacts]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - name: recipientId
//  *         in: path
//  *         required: true
//  *         schema:
//  *           type: string
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               name: { type: string }
//  *               email: { type: string }
//  *               phone: { type: string }
//  *     responses:
//  *       200:
//  *         description: Contact updated successfully
//  *       400:
//  *         description: Name and email are required
//  *       404:
//  *         description: Recipient not found
//  */
// app.put('/update-contact/:recipientId', authMiddleware, async (req, res) => {
//   try {
//     const { recipientId } = req.params;
//     const { name, email, phone } = req.body;

//     if (!name || !email) {
//       return res.status(400).json({
//         error: 'Name and email are required',
//       });
//     }

//     const updated = await recipientRepository.updateRecipient(recipientId, {
//       name,
//       email,
//       phone,
//     });

//     if (!updated) {
//       return res.status(404).json({ error: 'Recipient not found' });
//     }

//     res.status(200).json({ data: updated });
//   } catch (error) {
//     console.error('Update contact error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

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

export default app;

const isLambda = Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);

if (!isLambda) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);

    const intervalMs = Number(process.env.SCHEDULED_SEND_INTERVAL_MS) || 60000;
    let processorRunning = false;

    const runScheduler = async () => {
      if (processorRunning) {
        return;
      }

      processorRunning = true;
      try {
        await processScheduledSends();
      } catch (err) {
        console.error('Scheduled send processor error:', err);
      } finally {
        processorRunning = false;
      }
    };

    runScheduler();
    setInterval(runScheduler, intervalMs);
  });
}

app.use('/images', uploadRoutes);