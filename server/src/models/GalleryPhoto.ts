import mongoose, { Document, Schema } from "mongoose";

export interface IGalleryPhoto extends Document {
  title: string;
  description: string;
  category: "collision" | "painting" | "dent";
  filename: string;
  url: string;
  createdAt: Date;
  order: number;
}

const galleryPhotoSchema = new Schema<IGalleryPhoto>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ["collision", "painting", "dent"],
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const GalleryPhoto = mongoose.model<IGalleryPhoto>("GalleryPhoto", galleryPhotoSchema);

export default GalleryPhoto;
