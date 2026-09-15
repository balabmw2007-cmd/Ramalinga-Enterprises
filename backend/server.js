const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const { connectDB } = require("./config/db");
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const postRoutes = require("./routes/posts");

const app = express();
const PORT = process.env.PORT || 5000;

// --- Security / sanity checks ---
if (!process.env.JWT_SECRET) {
  console.warn(
    "⚠️  JWT_SECRET is not set. Copy .env.example to .env and set a real secret before deploying."
  );
}

// --- Core middleware ---
const allowedOrigins = (process.env.CORS_ORIGIN || "*")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: allowedOrigins.includes("*") ? true : allowedOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
const uploadStaticDir = process.env.VERCEL
  ? path.join("/tmp", "uploads")
  : path.join(__dirname, "uploads");
app.use("/uploads", express.static(uploadStaticDir));
app.use(express.static(path.join(__dirname, "../frontend")));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Basic rate limiting on auth endpoints to slow down brute-force attempts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts. Please try again later." },
});
app.use("/api/auth", authLimiter);

// Ensure MongoDB connection for API requests
app.use(async (req, res, next) => {
  if (req.path === "/api/health") return next();
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Database connection error:", err.message);
    res.status(500).json({
      error: "Database connection failed. Please ensure MONGODB_URI is configured correctly in environment variables.",
    });
  }
});

// --- Routes ---
app.get("/api/health", (req, res) => {
  const mongoose = require("mongoose");
  const dbStates = ["disconnected", "connected", "connecting", "disconnecting"];
  res.json({
    status: "ok",
    service: "ramalinga-enterprises-backend",
    db: dbStates[mongoose.connection.readyState] || "unknown",
    time: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/posts", postRoutes);

// --- 404 handler ---
app.use((req, res) => {
  res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` });
});

// --- Central error handler ---
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Something went wrong on the server." });
});

async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Ramalinga Enterprises API running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
}

// Start HTTP server locally, or export app for Vercel serverless
if (!process.env.VERCEL) {
  start();
}

module.exports = app;
