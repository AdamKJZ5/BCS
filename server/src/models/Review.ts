import { Schema, model, Types } from "mongoose";

interface IReview {
  customerId: Types.ObjectId;
  leadId?: Types.ObjectId;
  appointmentId?: Types.ObjectId;

  rating: number; // 1-5 stars
  title?: string;
  comment: string;

  serviceType?: string; // Type of service reviewed
  photos?: string[]; // URLs to uploaded photos

  status: "pending" | "approved" | "rejected";
  moderatedBy?: Types.ObjectId; // Admin who moderated
  moderatedAt?: Date;
  moderationNote?: string; // Internal note about why approved/rejected

  featured: boolean; // Show on homepage
  displayOnWebsite: boolean; // Customer opted in to display publicly

  helpfulCount: number; // Number of people who found this helpful

  response?: {
    text: string;
    respondedBy: Types.ObjectId;
    respondedAt: Date;
  };

  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
    },
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    serviceType: {
      type: String,
      trim: true,
    },
    photos: [String],

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    moderatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    moderatedAt: Date,
    moderationNote: {
      type: String,
      trim: true,
    },

    featured: {
      type: Boolean,
      default: false,
    },
    displayOnWebsite: {
      type: Boolean,
      default: true, // Customer can opt-out
    },

    helpfulCount: {
      type: Number,
      default: 0,
    },

    response: {
      text: String,
      respondedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      respondedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
reviewSchema.index({ customerId: 1, createdAt: -1 });
reviewSchema.index({ status: 1, createdAt: -1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ featured: 1, status: 1 });

const Review = model<IReview>("Review", reviewSchema);

export default Review;
