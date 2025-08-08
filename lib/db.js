// lib/db.js
import mongoose from 'mongoose'

export const connectDB = async () => {
  if (mongoose.connections[0].readyState) return

  await mongoose.connect(process.env.MONGO_URI, {
    dbName: 'indianskyimages',
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
}

