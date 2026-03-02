import rateLimit from 'express-rate-limit';

/**
 * Centralized rate limiter configurations
 * Adjust these values based on your needs
 */

// Strict limit for lead submissions to prevent spam
export const leadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window
  message: 'Too many lead submissions from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Very strict for authentication to prevent brute force attacks
// DEVELOPMENT: Increased limit for testing (change to 5 for production)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 50 : 5, // 50 in dev, 5 in production
  message: 'Too many login attempts from this IP, please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count both failed and successful
});

// Moderate limit for password reset to prevent abuse
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 reset requests per hour
  message: 'Too many password reset requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Lenient limit for general API usage
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limit for file uploads
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 uploads per window
  message: 'Too many file uploads, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

export default {
  lead: leadLimiter,
  auth: authLimiter,
  passwordReset: passwordResetLimiter,
  api: apiLimiter,
  upload: uploadLimiter,
};
