import mongoose from 'mongoose';

const ImageSchema = new mongoose.Schema({
  image_url: {
    type: String,
    required: true,
  },
  uploaded_by: {
    type: String,
    default: "Anonymous",
  },
  uploaded_at: {
    type: Date,
    default: Date.now,
  },
  latitude: {
    type: Number,
    required: false,
  },
  longitude: {
    type: Number,
    required: false,
  },
  location_name: {
    type: String,
    required: false,
  },
});

ImageSchema.index({ uploaded_at: -1 });
ImageSchema.index({ latitude: 1, longitude: 1 });

export default mongoose.models.Image || mongoose.model('Image', ImageSchema);
