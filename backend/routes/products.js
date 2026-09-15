const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

// GET /api/products?category=Fans&search=tower
router.get("/", async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = {};

    if (category && category !== "All") {
      query.category = new RegExp(`^${category}$`, "i");
    }
    if (search) {
      query.$or = [
        { name: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
      ];
    }

    const products = await Product.find(query).sort({ category: 1, price: 1 });
    res.json({ count: products.length, products });
  } catch (err) {
    console.error("List products error:", err);
    res.status(500).json({ error: "Could not load products." });
  }
});

// GET /api/products/:id  (product model code, e.g. RE-4500)
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) return res.status(404).json({ error: "Product not found." });
    res.json({ product });
  } catch (err) {
    console.error("Get product error:", err);
    res.status(500).json({ error: "Could not load product." });
  }
});

// POST /api/products/:id/reviews  (Add user review for product)
router.post("/:id/reviews", async (req, res) => {
  try {
    const { name, rating, comment } = req.body;
    if (!name || !rating || !comment) {
      return res.status(400).json({ error: "Name, rating, and review comment are required." });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: "Rating must be a number between 1 and 5." });
    }

    const product = await Product.findOne({ id: req.params.id });
    if (!product) return res.status(404).json({ error: "Product not found." });

    const existingReviews = Array.isArray(product.reviews) ? product.reviews : [];
    const allRatings = [numRating, ...existingReviews.map((r) => Number(r.rating) || 5)];
    const newRating = Number((allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length).toFixed(1));

    const newReview = {
      name: name.trim(),
      rating: numRating,
      comment: comment.trim(),
      createdAt: new Date(),
    };

    const updatedProduct = await Product.findByIdAndUpdate(
      product._id,
      {
        $push: {
          reviews: {
            $each: [newReview],
            $position: 0,
          },
        },
        $set: { rating: newRating },
      },
      { new: true }
    );

    res.status(201).json({
      message: "Review submitted successfully!",
      review: newReview,
      reviews: updatedProduct.reviews,
      rating: updatedProduct.rating,
    });
  } catch (err) {
    console.error("Add review error:", err);
    res.status(500).json({ error: err.message || "Could not submit review." });
  }
});

module.exports = router;
