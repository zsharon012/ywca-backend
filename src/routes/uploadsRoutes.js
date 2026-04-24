import express from 'express';
import multer from 'multer';
import uploadsController from '../controllers/uploadsController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import s3Provider from '../providers/s3Provider.js';

// In-memory storage — we stream the buffer straight to S3, no local disk.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: s3Provider.MAX_BYTES },
  fileFilter: (_req, file, cb) => {
    if (s3Provider.isAllowed(file.mimetype)) return cb(null, true);
    const err = new Error(`Unsupported file type: ${file.mimetype}`);
    err.status = 400;
    cb(err);
  },
});

const router = express.Router();

/**
 * @swagger
 * /uploads:
 *   post:
 *     summary: Upload an image or PDF to S3 and record it in imagebucket
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: File stored, returns imageid and imageurl
 *       400:
 *         description: Missing or unsupported file
 *       413:
 *         description: File too large
 */
router.post('/', authMiddleware, upload.single('file'), uploadsController.createUpload);

/**
 * @swagger
 * /uploads:
 *   get:
 *     summary: List uploaded images/PDFs
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50, maximum: 200 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *     responses:
 *       200:
 *         description: Array of imagebucket rows
 */
router.get('/', authMiddleware, uploadsController.listUploads);

/**
 * @swagger
 * /uploads/{imageid}:
 *   get:
 *     summary: Get a single image row
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: imageid
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Image row }
 *       404: { description: Not found }
 */
router.get('/:imageid', authMiddleware, uploadsController.getUpload);

/**
 * @swagger
 * /uploads/{imageid}:
 *   delete:
 *     summary: Delete an image (S3 object + imagebucket row)
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: imageid
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Deleted }
 *       404: { description: Not found }
 */
router.delete('/:imageid', authMiddleware, uploadsController.deleteUpload);

export default router;
