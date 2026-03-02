import { Request, Response, NextFunction } from "express";
import Review from "../models/Review";
import User from "../models/User";
import { AppError } from "../utils/AppError";
import { notifyAllAdmins } from "../utils/createNotification";
import logger from "../utils/logger";

/**
 * Create a new review (customer)
 */
export const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new AppError("Not authenticated", 401);
    }

    const {
      rating,
      title,
      comment,
      serviceType,
      leadId,
      appointmentId,
      displayOnWebsite,
    } = req.body;

    if (!rating || !comment) {
      throw new AppError("Rating and comment are required", 400);
    }

    const review = await Review.create({
      customerId: userId,
      rating,
      title,
      comment,
      serviceType,
      leadId,
      appointmentId,
      displayOnWebsite: displayOnWebsite !== false, // Default true
    });

    // Notify admins of new review
    try {
      await notifyAllAdmins({
        type: "review",
        title: "New Review Submitted",
        message: `A customer left a ${rating}-star review`,
        relatedEntity: review._id,
      });
    } catch (notifError) {
      logger.error("Failed to notify admins about review:", notifError);
    }

    res.status(201).json({
      success: true,
      message: "Review submitted successfully. It will appear after moderation.",
      review,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get customer's own reviews
 */
export const getMyReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new AppError("Not authenticated", 401);
    }

    const reviews = await Review.find({ customerId: userId })
      .populate("leadId", "damageDescription")
      .populate("appointmentId", "appointmentType")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all reviews (admin, with filtering)
 */
export const getAllReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, rating, search, page = 1, limit = 20 } = req.query;

    const query: any = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (rating) {
      query.rating = parseInt(rating as string);
    }

    const skip = (Number(page) - 1) * Number(limit);

    let reviews;
    let total;

    if (search) {
      // Search in comment and title
      const searchRegex = new RegExp(search as string, "i");
      const allReviews = await Review.find(query)
        .populate("customerId", "name email")
        .populate("moderatedBy", "name")
        .lean();

      reviews = allReviews.filter(
        (review: any) =>
          searchRegex.test(review.comment) ||
          (review.title && searchRegex.test(review.title)) ||
          (review.customerId?.name && searchRegex.test(review.customerId.name))
      );

      total = reviews.length;
      reviews = reviews.slice(skip, skip + Number(limit));
    } else {
      [reviews, total] = await Promise.all([
        Review.find(query)
          .populate("customerId", "name email")
          .populate("moderatedBy", "name")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        Review.countDocuments(query),
      ]);
    }

    res.json({
      success: true,
      reviews,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get approved reviews for public display
 */
export const getPublicReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { featured, limit = 10, rating } = req.query;

    const query: any = {
      status: "approved",
      displayOnWebsite: true,
    };

    if (featured === "true") {
      query.featured = true;
    }

    if (rating) {
      query.rating = { $gte: parseInt(rating as string) };
    }

    const reviews = await Review.find(query)
      .populate("customerId", "name")
      .select("-moderationNote -moderatedBy")
      .sort({ featured: -1, createdAt: -1 })
      .limit(Number(limit))
      .lean();

    res.json({
      success: true,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Moderate review (admin)
 */
export const moderateReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status, moderationNote } = req.body;
    const adminId = (req as any).user?.id;

    if (!["approved", "rejected"].includes(status)) {
      throw new AppError("Invalid status. Must be approved or rejected.", 400);
    }

    const review = await Review.findById(id);

    if (!review) {
      throw new AppError("Review not found", 404);
    }

    review.status = status;
    review.moderatedBy = adminId;
    review.moderatedAt = new Date();
    if (moderationNote) {
      review.moderationNote = moderationNote;
    }

    await review.save();

    res.json({
      success: true,
      message: `Review ${status} successfully`,
      review,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle featured status (admin)
 */
export const toggleFeatured = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);

    if (!review) {
      throw new AppError("Review not found", 404);
    }

    if (review.status !== "approved") {
      throw new AppError("Only approved reviews can be featured", 400);
    }

    review.featured = !review.featured;
    await review.save();

    res.json({
      success: true,
      message: review.featured
        ? "Review featured successfully"
        : "Review unfeatured successfully",
      review,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Respond to review (admin)
 */
export const respondToReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const adminId = (req as any).user?.id;

    if (!text) {
      throw new AppError("Response text is required", 400);
    }

    const review = await Review.findById(id);

    if (!review) {
      throw new AppError("Review not found", 404);
    }

    review.response = {
      text,
      respondedBy: adminId,
      respondedAt: new Date(),
    };

    await review.save();

    res.json({
      success: true,
      message: "Response added successfully",
      review,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete review (admin only)
 */
export const deleteReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const review = await Review.findByIdAndDelete(id);

    if (!review) {
      throw new AppError("Review not found", 404);
    }

    res.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get review statistics (admin)
 */
export const getReviewStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [
      totalReviews,
      pendingReviews,
      approvedReviews,
      averageRating,
      ratingDistribution,
    ] = await Promise.all([
      Review.countDocuments(),
      Review.countDocuments({ status: "pending" }),
      Review.countDocuments({ status: "approved" }),
      Review.aggregate([
        { $match: { status: "approved" } },
        { $group: { _id: null, avgRating: { $avg: "$rating" } } },
      ]),
      Review.aggregate([
        { $match: { status: "approved" } },
        { $group: { _id: "$rating", count: { $sum: 1 } } },
        { $sort: { _id: -1 } },
      ]),
    ]);

    res.json({
      success: true,
      stats: {
        totalReviews,
        pendingReviews,
        approvedReviews,
        averageRating: averageRating[0]?.avgRating || 0,
        ratingDistribution: ratingDistribution.reduce(
          (acc: any, item: any) => {
            acc[item._id] = item.count;
            return acc;
          },
          {}
        ),
      },
    });
  } catch (error) {
    next(error);
  }
};
