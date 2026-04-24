import { pgPool } from '../config/database.js';

// imagebucket table schema (see sql/create_tables.sql):
//   imageid UUID PRIMARY KEY
//   imageurl TEXT NOT NULL
// We extend it lightly with optional metadata columns guarded by
// CREATE TABLE IF NOT EXISTS + ALTER TABLE so existing installs aren't broken.

async function insertImage({ imageid, imageurl, s3key, mimetype, size, uploadedby }) {
  const sql = `
    INSERT INTO imagebucket (imageid, imageurl, s3key, mimetype, size_bytes, uploaded_by, uploaded_at)
    VALUES ($1, $2, $3, $4, $5, $6, NOW())
    RETURNING imageid, imageurl, s3key, mimetype, size_bytes, uploaded_by, uploaded_at;
  `;
  const { rows } = await pgPool.query(sql, [
    imageid,
    imageurl,
    s3key || null,
    mimetype || null,
    size || null,
    uploadedby || null,
  ]);
  return rows[0];
}

async function getImage(imageid) {
  const { rows } = await pgPool.query(
    `SELECT imageid, imageurl, s3key, mimetype, size_bytes, uploaded_by, uploaded_at
     FROM imagebucket WHERE imageid = $1;`,
    [imageid]
  );
  return rows[0] || null;
}

async function listImages({ limit = 50, offset = 0 } = {}) {
  const { rows } = await pgPool.query(
    `SELECT imageid, imageurl, s3key, mimetype, size_bytes, uploaded_by, uploaded_at
     FROM imagebucket
     ORDER BY uploaded_at DESC NULLS LAST, imageid DESC
     LIMIT $1 OFFSET $2;`,
    [limit, offset]
  );
  return rows;
}

async function deleteImage(imageid) {
  const { rows } = await pgPool.query(
    `DELETE FROM imagebucket WHERE imageid = $1 RETURNING imageid, s3key;`,
    [imageid]
  );
  return rows[0] || null;
}

export default {
  insertImage,
  getImage,
  listImages,
  deleteImage,
};
