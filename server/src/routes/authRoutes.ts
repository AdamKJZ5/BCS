import { Router } from "express";
import { register, login, getMe, completeSignup, requestPasswordReset, resetPassword } from "../controllers/authController";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/complete-signup", completeSignup);
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPassword);

// Protected routes
router.get("/me", authMiddleware, getMe);

export default router;
