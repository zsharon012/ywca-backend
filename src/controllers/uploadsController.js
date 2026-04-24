import crypto from 'crypto';
import s3Provider from '../providers/s3Provider.js';
import imagebucketRepository from '../repositories/imagebucketRepository.js';

// POST /uploads  (multipart/form-data, field name "file")
// Uploads a single image or PDF to S3 and persists a row in imagebucket.
const createUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ error: 'No file provided. Send multipart/form-data with field "file".' });
    }

    const uploaded = await s3Provider.uploadBuffer({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
    });

    // req.user is set by authMiddleware (Firebase token → database user row)
    const uploadedBy =
      (req.user && (req.user.id || req.user.uid || req.user.firebase_uid)) || null;

    const row = await imagebucketRepository.insertImage({
      imageid: crypto.randomUUID(),
      imageurl: uploaded.url,
      s3key: uploaded.key,
      mimetype: uploaded.mimetype,
      size: uploaded.size,
      uploadedby: uploadedBy,
    });

    res.status(201).json({ data: row });
  } catch (err) {
    next(err);
  }
};

// GET /uploads/:imageid
const getUpload = async (req, res, next) => {
  try {
    const { imageid } = req.params;
    const row = await imagebucketRepository.getImage(imageid);
    if (!row) return res.status(404).json({ error: 'Image not found' });
    res.status(200).json({ data: row });
  } catch (err) {
    next(err);
  }
};

// GET /uploads
const listUploads = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    const offset = parseInt(req.query.offset, 10) || 0;
    const rows = await imagebucketRepository.listImages({ limit, offset });
    res.status(200).json({ data: rows });
  } catch (err) {
    next(err);
  }
};

// DELETE /uploads/:imageid
const deleteUpload = async (req, res, next) => {
  try {
    const { imageid } = req.params;
    const existing = await imagebucketRepository.getImage(imageid);
    if (!existing) return res.status(404).json({ error: 'Image not found' });

    if (existing.s3key) {
      try {
        await s3Provider.deleteObject(existing.s3key);
      } catch (s3err) {
        // Surface a warning but still remove DB row so we don't leak orphans
        console.warn('S3 delete failed for', existing.s3key, s3err.message);
      }
    }

    await imagebucketRepository.deleteImage(imageid);
    res.status(200).json({ data: { imageid, deleted: true } });
  } catch (err) {
    next(err);
  }
};

export default {
  createUpload,
  getUpload,
  listUploads,
  deleteUpload,
};
