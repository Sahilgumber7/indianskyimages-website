import mongoose from 'mongoose';

const ImageSchema = new mongoose.Schema({
  image_url: {
    type: String,
    required: true,
  },
  public_id: {
    type: String,
    required: false,
  },
  image_hash: {
    type: String,
    required: false,
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
  likes: {
    type: Number,
    default: 0,
  },
  report_count: {
    type: Number,
    default: 0,
  },
  is_flagged: {
    type: Boolean,
    default: false,
  },
  moderation_status: {
    type: String,
    enum: ["approved", "pending", "rejected"],
    default: "approved",
  },
});

ImageSchema.index({ uploaded_at: -1 });
ImageSchema.index({ latitude: 1, longitude: 1 });
ImageSchema.index({ image_hash: 1 }, { unique: true, sparse: true });
ImageSchema.index({ moderation_status: 1, uploaded_at: -1 });
ImageSchema.index({ uploaded_by: 1, uploaded_at: -1 });
ImageSchema.index({ location_name: 1 });

export default mongoose.models.Image || mongoose.model('Image', ImageSchema);
