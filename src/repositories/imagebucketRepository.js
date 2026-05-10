import {
  createUploadUrl,
  listImages,
  deleteImage,
  getSignedDownloadUrl,
} from "../providers/imagebucketProvider.js";

/**
 * Generate upload URL
 */
const generateUpload = async ({ filename, type }) => {
  return await createUploadUrl({ filename, type });
};

/**
 * Get all images
 */
const getAllImages = async () => {
  return await listImages();
};

/**
 * Delete image
 */
const removeImage = async (key) => {
  return await deleteImage(key);
};

/**
 * Get signed download URL
 */
const getDownloadUrl = async (key) => {
  return await getSignedDownloadUrl(key);
};

export default {
  generateUpload,
  getAllImages,
  removeImage,
  getDownloadUrl,
};