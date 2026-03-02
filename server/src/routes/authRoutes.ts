import { Router } from "express";
import { register, login, getMe, completeSignup, requestPasswordReset, resetPassword } from "../controllers/authController";
import { authMiddleware } from "../middlewares/auth";
import { authLimiter, passwordResetLimiter } from "../middlewares/rateLimiters";

const router = Router();

// Public routes
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/complete-signup", authLimiter, completeSignup);
router.post("/forgot-password", passwordResetLimiter, requestPasswordReset);
router.post("/reset-password", passwordResetLimiter, resetPassword);

// Protected routes
router.get("/me", authMiddleware, getMe);

export default router;
