// lib/db.js
import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    if (!process.env.MONGO_URI) {
      throw new Error("❌ MONGO_URI is not defined in environment variables");
    }

    cached.promise = mongoose
      .connect(process.env.MONGO_URI, {
        dbName: "indianskyimages",
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
