import { Router } from "express";
import { authMiddleware, customerOnly } from "../middlewares/auth";
import { adminAuth } from "../middlewares/adminAuth";
import {
  createReview,
  getMyReviews,
  getAllReviews,
  getPublicReviews,
  moderateReview,
  toggleFeatured,
  respondToReview,
  deleteReview,
  getReviewStats,
} from "../controllers/reviewController";

const router = Router();

// Public routes
router.get("/public", getPublicReviews);

// Customer routes (authenticated customers)
router.post("/", authMiddleware, customerOnly, createReview);
router.get("/my-reviews", authMiddleware, customerOnly, getMyReviews);

// Admin routes
router.get("/", adminAuth, getAllReviews);
router.get("/stats", adminAuth, getReviewStats);
router.patch("/:id/moderate", adminAuth, moderateReview);
router.patch("/:id/featured", adminAuth, toggleFeatured);
router.post("/:id/respond", adminAuth, respondToReview);
router.delete("/:id", adminAuth, deleteReview);

export default router;
