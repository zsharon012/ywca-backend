import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import crypto from 'crypto';
import path from 'path';

// Bucket + credentials come from .env
// AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME
const region = process.env.AWS_REGION;
const bucket = process.env.S3_BUCKET_NAME;

// Lazy client — avoids crashing the server at import time if AWS env vars
// are not yet configured in .env.
let _client = null;
function getClient() {
  if (_client) return _client;
  if (!region) {
    throw new Error('AWS_REGION not set in .env');
  }
  _client = new S3Client({
    region,
    credentials:
      process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          }
        : undefined, // fall back to AWS default credential chain
  });
  return _client;
}

if (!bucket || !region) {
  console.warn(
    '[s3Provider] AWS_REGION or S3_BUCKET_NAME not set — uploads will 500 until .env is configured'
  );
}

// Allow images and PDFs only (matches our task scope)
const ALLOWED_MIME_PREFIXES = ['image/'];
const ALLOWED_MIME_TYPES = ['application/pdf'];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

function isAllowed(mimetype) {
  if (!mimetype) return false;
  if (ALLOWED_MIME_TYPES.includes(mimetype)) return true;
  return ALLOWED_MIME_PREFIXES.some((p) => mimetype.startsWith(p));
}

function buildKey(originalName) {
  const ext = path.extname(originalName || '').toLowerCase();
  const id = crypto.randomUUID();
  // Keep originals organized by month so the bucket doesn't become a flat pile
  const d = new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `uploads/${yyyy}/${mm}/${id}${ext}`;
}

function publicUrl(key) {
  return `https://${bucket}.s3.${region}.amazonaws.com/${encodeURI(key)}`;
}

async function uploadBuffer({ buffer, originalName, mimetype }) {
  if (!bucket || !region) {
    throw new Error(
      'S3 not configured. Set S3_BUCKET_NAME and AWS_REGION in .env'
    );
  }
  if (!isAllowed(mimetype)) {
    const err = new Error(`Unsupported file type: ${mimetype}`);
    err.status = 400;
    throw err;
  }
  if (!buffer || buffer.length === 0) {
    const err = new Error('Empty file');
    err.status = 400;
    throw err;
  }
  if (buffer.length > MAX_BYTES) {
    const err = new Error(
      `File too large (${buffer.length} bytes, max ${MAX_BYTES})`
    );
    err.status = 413;
    throw err;
  }

  const key = buildKey(originalName);

  await getClient().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
      // Bucket is public-read per task spec; object-level ACL reinforces that
      ACL: 'public-read',
      CacheControl: 'public, max-age=31536000, immutable',
    })
  );

  return {
    key,
    url: publicUrl(key),
    bucket,
    region,
    size: buffer.length,
    mimetype,
    originalName,
  };
}

async function deleteObject(key) {
  if (!bucket) throw new Error('S3 not configured');
  await getClient().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

async function objectExists(key) {
  if (!bucket) return false;
  try {
    const client = getClient();
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch (err) {
    if (err.$metadata && err.$metadata.httpStatusCode === 404) return false;
    throw err;
  }
}

export default {
  uploadBuffer,
  deleteObject,
  objectExists,
  publicUrl,
  isAllowed,
  MAX_BYTES,
};
