import mongoose from 'mongoose';

const ImageSchema = new mongoose.Schema({
  image_url: {
    type: String,
    required: true,
  },
  uploaded_at: {
    type: Date,
    default: Date.now,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
});

export default mongoose.models.Image || mongoose.model('Image', ImageSchema);
