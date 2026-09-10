const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Post = require("../models/Post");

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 30);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${cleanBase}-${uniqueSuffix}${ext}`);
  },
});

// Allowed file types: images and videos
const fileFilter = (req, file, cb) => {
  const isImage = file.mimetype.startsWith("image/");
  const isVideo = file.mimetype.startsWith("video/");

  if (isImage || isVideo) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only images (JPEG, PNG, WEBP, GIF) and videos (MP4, WEBM, MOV) are allowed."
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB max limit for videos/images
  },
});

// GET /api/posts - Get all posts (newest first)
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json({ count: posts.length, posts });
  } catch (err) {
    console.error("List posts error:", err);
    res.status(500).json({ error: "Could not load posts." });
  }
});

// GET /api/posts/:id - Single post
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }
    res.json({ post });
  } catch (err) {
    console.error("Get post error:", err);
    res.status(500).json({ error: "Could not load post." });
  }
});

// POST /api/posts - Create post with optional media upload
router.post("/", (req, res) => {
  upload.single("media")(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ error: "File too large. Maximum size is 100 MB." });
      }
      return res.status(400).json({ error: err.message || "File upload failed." });
    }

    try {
      const { title, description, author, tags } = req.body;

      if (!title || !title.trim()) {
        if (req.file) {
          // Clean up uploaded file if validation fails
          try {
            fs.unlinkSync(req.file.path);
          } catch (_) {}
        }
        return res.status(400).json({ error: "Post title is required." });
      }

      let mediaUrl = "";
      let mediaType = "none";

      if (req.file) {
        mediaUrl = `/uploads/${req.file.filename}`;
        if (req.file.mimetype.startsWith("video/")) {
          mediaType = "video";
        } else if (req.file.mimetype.startsWith("image/")) {
          mediaType = "image";
        }
      } else if (req.body.mediaUrl) {
        mediaUrl = req.body.mediaUrl.trim();
        mediaType = req.body.mediaType || "image";
      }

      // Parse tags
      let parsedTags = [];
      if (typeof tags === "string") {
        parsedTags = tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      } else if (Array.isArray(tags)) {
        parsedTags = tags.map((t) => String(t).trim()).filter(Boolean);
      }

      const post = await Post.create({
        title: title.trim(),
        description: description ? description.trim() : "",
        mediaUrl,
        mediaType,
        author: author && author.trim() ? author.trim() : "Ramalinga Enterprises",
        tags: parsedTags,
      });

      res.status(201).json({
        message: "Post created successfully!",
        post,
      });
    } catch (createErr) {
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (_) {}
      }
      console.error("Create post error:", createErr);
      res.status(500).json({ error: createErr.message || "Could not create post." });
    }
  });
});

// DELETE /api/posts/:id - Delete a post
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    // Delete local media file if exists
    if (post.mediaUrl && post.mediaUrl.startsWith("/uploads/")) {
      const filename = post.mediaUrl.replace("/uploads/", "");
      const filePath = path.join(uploadDir, filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (unlinkErr) {
          console.warn("Could not delete file from disk:", unlinkErr.message);
        }
      }
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted successfully." });
  } catch (err) {
    console.error("Delete post error:", err);
    res.status(500).json({ error: "Could not delete post." });
  }
});

module.exports = router;

