/**
 * Authentication Validation Middleware
 * Express-validator rules for authentication operations
 */

import { body } from "express-validator";

/**
 * Validation for user registration
 */
export const validateRegister = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters")
    .trim(),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email address")
    .normalizeEmail()
    .toLowerCase(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  body("phone")
    .optional()
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage("Phone number must contain only digits, spaces, and valid phone characters")
    .isLength({ min: 10, max: 20 })
    .withMessage("Phone number must be between 10 and 20 characters"),
];

/**
 * Validation for user login
 */
export const validateLogin = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email address")
    .normalizeEmail()
    .toLowerCase(),
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

/**
 * Validation for password reset request
 */
export const validateForgotPassword = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email address")
    .normalizeEmail()
    .toLowerCase(),
];

/**
 * Validation for password reset
 */
export const validateResetPassword = [
  body("token")
    .notEmpty()
    .withMessage("Reset token is required"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),
];

/**
 * Validation for completing signup
 */
export const validateCompleteSignup = [
  body("token")
    .notEmpty()
    .withMessage("Signup token is required"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),
];

/**
 * Validation for password change
 */
export const validateChangePassword = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("New password must contain at least one uppercase letter, one lowercase letter, and one number")
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error("New password must be different from current password");
      }
      return true;
    }),
];

/**
 * Validation for updating profile
 */
export const validateUpdateProfile = [
  body("name")
    .optional()
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters")
    .trim(),
  body("phone")
    .optional()
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage("Phone number must contain only digits, spaces, and valid phone characters")
    .isLength({ min: 10, max: 20 })
    .withMessage("Phone number must be between 10 and 20 characters"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Must be a valid email address")
    .normalizeEmail()
    .toLowerCase(),
];
