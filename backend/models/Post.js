const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    mediaUrl: { type: String, default: "" },
    mediaType: {
      type: String,
      enum: ["image", "video", "none"],
      default: "none",
    },
    author: { type: String, default: "Ramalinga Enterprises", trim: true },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

postSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Post", postSchema);

 