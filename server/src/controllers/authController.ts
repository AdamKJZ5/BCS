import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User";
import Lead from "../models/Lead";
import { ENV } from "../config/env";
import { AppError } from "../utils/AppError";
import { sendWelcomeEmail, sendPasswordResetEmail } from "../utils/email";
import { validatePassword } from "../utils/passwordValidator";
import { loggers } from "../utils/logger";
import asyncHandler from "../utils/asyncHandler";

const generateToken = (userId: string, email: string, role: string) => {
  return jwt.sign({ id: userId, email, role }, ENV.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export const register = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const { email, password, name, phone } = req.body;

  // Validate password strength
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    throw new AppError(passwordValidation.errors.join('. '), 400);
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    loggers.security('registration_attempt_existing_email', 'low', {
      email,
      ip: req.ip
    });
    throw new AppError("Email already registered", 400);
  }

  // Create new user
  const user = await User.create({
    email,
    password,
    name,
    phone,
    role: "customer",
    needsPasswordSetup: false,
  });

  // Link any existing leads with this email to the new user account
  await Lead.updateMany(
    { email: email.toLowerCase(), userId: null },
    { $set: { userId: user._id } }
  );

  // Generate token
  const token = generateToken(user._id.toString(), user.email, user.role);

  // Send welcome email
  void sendWelcomeEmail(user.email, user.name);

  // Log successful registration
  loggers.auth('register', user.email, true, {
    userId: user._id.toString(),
    ip: req.ip
  });

  res.status(201).json({
    success: true,
    message: "Registration successful",
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
    },
  });
});

export const login = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const { email, password } = req.body;

  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    loggers.auth('login', email, false, {
      reason: 'user_not_found',
      ip: req.ip
    });
    throw new AppError("Invalid email or password", 401);
  }

  // Check password
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    loggers.auth('login', email, false, {
      reason: 'invalid_password',
      ip: req.ip,
      userId: user._id.toString()
    });
    loggers.security('failed_login_attempt', 'medium', {
      email,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
    throw new AppError("Invalid email or password", 401);
  }

  // Generate token
  const token = generateToken(user._id.toString(), user.email, user.role);

  // Log successful login
  loggers.auth('login', email, true, {
    userId: user._id.toString(),
    ip: req.ip
  });

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
    },
  });
});

export const getMe = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const userId = (req as any).user?.id;

  if (!userId) {
    throw new AppError("Not authenticated", 401);
  }

  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
    },
  });
});

export const completeSignup = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const { token, password } = req.body;

  if (!token || !password) {
    throw new AppError("Token and password are required", 400);
  }

  // Find user by signup token
  const user = await User.findOne({
    signupToken: token,
    signupTokenExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new AppError("Invalid or expired signup token", 400);
  }

  // Update user with new password and clear signup flags
  user.password = password;
  user.needsPasswordSetup = false;
  await user.save();

  // Remove signup token fields
  await User.updateOne(
    { _id: user._id },
    { $unset: { signupToken: "", signupTokenExpires: "" } }
  );

  // Generate token
  const authToken = generateToken(user._id.toString(), user.email, user.role);

  res.status(200).json({
    success: true,
    message: "Account setup complete",
    token: authToken,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
    },
  });
});

export const requestPasswordReset = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError("Email is required", 400);
  }

  // Find user by email
  const user = await User.findOne({ email: email.toLowerCase() });

  // Always return success message even if user not found (security best practice)
  if (!user) {
    return res.status(200).json({
      success: true,
      message: "If an account exists with that email, a password reset link has been sent.",
    });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.passwordResetToken = resetToken;
  user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour
  await user.save();

  // Send password reset email
  const frontendUrl = ENV.FRONTEND_URL || "http://localhost:5173";
  await sendPasswordResetEmail(user.email, user.name, resetToken, frontendUrl);

  res.status(200).json({
    success: true,
    message: "If an account exists with that email, a password reset link has been sent.",
  });
});

export const resetPassword = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const { token, password } = req.body;

  if (!token || !password) {
    throw new AppError("Token and password are required", 400);
  }

  // Find user by reset token and check expiration
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new AppError("Invalid or expired password reset token", 400);
  }

  // Update password and clear reset token fields
  user.password = password;
  await user.save();

  // Remove password reset token fields
  await User.updateOne(
    { _id: user._id },
    { $unset: { passwordResetToken: "", passwordResetExpires: "" } }
  );

  // Generate auth token for automatic login
  const authToken = generateToken(user._id.toString(), user.email, user.role);

  res.status(200).json({
    success: true,
    message: "Password reset successful",
    token: authToken,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
    },
  });
});
