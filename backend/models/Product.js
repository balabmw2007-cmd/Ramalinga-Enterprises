const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true }, // model code, e.g. RE-4500
    name: { type: String, required: true },
    category: { type: String, required: true, index: true },
    price: { type: Number, required: false, default: null },
    currency: { type: String, default: "" },
    rating: { type: Number, default: 0 },
    stock: { type: mongoose.Schema.Types.Mixed, default: "Available" },
    specs: { type: mongoose.Schema.Types.Mixed, default: {} },
    description: { type: String, default: "" },
    reviews: { type: [reviewSchema], default: [] },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text" });

module.exports = mongoose.model("Product", productSchema);
