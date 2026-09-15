const express = require("express");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const User = require("../models/User");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

function signToken(user) {
  return jwt.sign({ id: user._id.toString(), email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Name is required." });
    }
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ error: "A valid email is required." });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters." });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const user = await User.createUser({ name: name.trim(), email, password });
    const token = signToken(user);

    res.status(201).json({ token, user: user.toPublicUser() });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }
    console.error("Register error:", err);
    res.status(500).json({ error: "Could not create account. Please try again." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const valid = await user.verifyPassword(password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = signToken(user);
    res.json({ token, user: user.toPublicUser() });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Could not log in. Please try again." });
  }
});

// GET /api/auth/me — requires a valid token
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json({ user: user.toPublicUser() });
  } catch (err) {
    console.error("Fetch profile error:", err);
    res.status(500).json({ error: "Could not load profile." });
  }
});

module.exports = router;
