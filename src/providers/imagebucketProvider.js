import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// AWS_S3_BUCKET = "bucket-name/folder"
const bucketEnv = process.env.AWS_S3_BUCKET;
const accessKeyId = process.env.AWS_BUCKET_ACCESS_KEY;
const secretAccessKey = process.env.APP_AWS_SECRET_KEY || process.env.AWS_SECRET_KEY;
const region = process.env.AWS_REGION_IMAGEBUCKET || process.env.AWS_REGION || process.env.APP_AWS_REGION || "us-east-1";

if (!bucketEnv) {
  throw new Error(
    "Missing required AWS image bucket env vars: AWS_S3_BUCKET"
  );
}

if (!accessKeyId) {
  throw new Error(
    "Missing required AWS image bucket env vars: AWS_BUCKET_ACCESS_KEY"
  );
}

if (!secretAccessKey) {
  throw new Error(
    "Missing required AWS image bucket env vars: AWS_SECRET_KEY"
  );
}

const [BUCKET, ...PREFIX_PARTS] = bucketEnv.split("/");
const PREFIX = PREFIX_PARTS.length ? PREFIX_PARTS.join("/") + "/" : "";

const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

/**
 * Upload (pre-signed URL)
 */
export const createUploadUrl = async ({ filename, type }) => {
  const key = `${PREFIX}${Date.now()}-${filename}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: type,
  });

  const url = await getSignedUrl(s3, command, {
    expiresIn: 60,
  });

  return {
    url,
    method: "PUT",
    key,
  };
};

/**
 * List images
 */
export const listImages = async () => {
  const command = new ListObjectsV2Command({
    Bucket: BUCKET,
    Prefix: PREFIX,
  });

  const data = await s3.send(command);

  return (data.Contents || [])
    .filter(item => item.Key && !item.Key.endsWith("/"))
    .map((item) => ({
      key: item.Key,
      url: `https://${BUCKET}.s3.${process.env.AWS_REGION_IMAGEBUCKET}.amazonaws.com/${item.Key}`,
      size: item.Size,
      lastModified: item.LastModified,
    }));
};
/**
 * Delete image
 */
export const deleteImage = async (key) => {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  await s3.send(command);

  return { success: true };
};

/**
 * Signed download URL (optional)
 */
export const getSignedDownloadUrl = async (key) => {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  const url = await getSignedUrl(s3, command, {
    expiresIn: 60,
  });

  return url;
};