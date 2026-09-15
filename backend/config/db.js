const mongoose = require("mongoose");

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Please set MONGODB_URI in your environment variables."
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    mongoose.set("strictQuery", true);
    cached.promise = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      })
      .then((mongooseInstance) => {
        const { host, name } = mongooseInstance.connection;
        console.log(`MongoDB connected → ${host}/${name}`);
        return mongooseInstance;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}

module.exports = { connectDB };
