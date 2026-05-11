import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import imageRepo from "../repositories/imagebucketRepository.js";

const router = express.Router();

/**
 * Upload URL (Uppy)
 */
router.post("/s3-sign", async (req, res) => {
  try {
    const { filename, type } = req.body;

    if (!filename || !type) {
      return res.status(400).json({
        error: "filename and type required",
      });
    }

    const result = await imageRepo.generateUpload({
      filename,
      type,
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

/**
 * List images
 */
router.get("/", async (req, res) => {
  try {
    const files = await imageRepo.getAllImages();
    res.json(files);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "List failed" });
  }
});

/**
 * Delete image
 */
router.delete("/", authMiddleware, async (req, res) => {
  try {
    const { key } = req.body;

    if (!key) {
      return res.status(400).json({ error: "key required" });
    }

    await imageRepo.removeImage(key);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
});

/**
 * Signed download URL (optional)
 */
router.get("/signed", async (req, res) => {
  try {
    const { key } = req.query;

    if (!key) {
      return res.status(400).json({ error: "key required" });
    }

    const url = await imageRepo.getDownloadUrl(key);

    res.json({ url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Signed URL failed" });
  }
});

export default router;