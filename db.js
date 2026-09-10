const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Copy .env.example to .env and set your connection string."
    );
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(uri);

  const { host, name } = mongoose.connection;
  console.log(`MongoDB connected → ${host}/${name}`);

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err);
  });
  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected.");
  });
}

module.exports = { connectDB };
