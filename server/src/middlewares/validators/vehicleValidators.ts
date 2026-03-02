/**
 * Vehicle Validation Middleware
 * Express-validator rules for vehicle operations
 */

import { body, param } from "express-validator";

const currentYear = new Date().getFullYear();

/**
 * Validation for creating a vehicle
 */
export const validateCreateVehicle = [
  body("make")
    .notEmpty()
    .withMessage("Vehicle make is required")
    .isString()
    .withMessage("Vehicle make must be a string")
    .isLength({ min: 1, max: 50 })
    .withMessage("Vehicle make must be between 1 and 50 characters")
    .trim(),
  body("model")
    .notEmpty()
    .withMessage("Vehicle model is required")
    .isString()
    .withMessage("Vehicle model must be a string")
    .isLength({ min: 1, max: 50 })
    .withMessage("Vehicle model must be between 1 and 50 characters")
    .trim(),
  body("year")
    .notEmpty()
    .withMessage("Vehicle year is required")
    .isInt({ min: 1900, max: currentYear + 1 })
    .withMessage(`Vehicle year must be between 1900 and ${currentYear + 1}`),
  body("color")
    .optional()
    .isString()
    .withMessage("Vehicle color must be a string")
    .isLength({ max: 30 })
    .withMessage("Vehicle color must not exceed 30 characters")
    .trim(),
  body("vin")
    .optional()
    .isString()
    .withMessage("VIN must be a string")
    .matches(/^[A-HJ-NPR-Z0-9]{17}$/)
    .withMessage("VIN must be exactly 17 characters and contain only valid VIN characters")
    .toUpperCase(),
  body("licensePlate")
    .optional()
    .isString()
    .withMessage("License plate must be a string")
    .isLength({ max: 20 })
    .withMessage("License plate must not exceed 20 characters")
    .trim()
    .toUpperCase(),
  body("mileage")
    .optional()
    .isInt({ min: 0, max: 9999999 })
    .withMessage("Mileage must be a non-negative integer less than 10 million"),
  body("notes")
    .optional()
    .isString()
    .withMessage("Notes must be a string")
    .isLength({ max: 1000 })
    .withMessage("Notes must not exceed 1000 characters"),
];

/**
 * Validation for updating a vehicle
 */
export const validateUpdateVehicle = [
  param("id")
    .isMongoId()
    .withMessage("Vehicle ID must be a valid MongoDB ID"),
  body("make")
    .optional()
    .isString()
    .withMessage("Vehicle make must be a string")
    .isLength({ min: 1, max: 50 })
    .withMessage("Vehicle make must be between 1 and 50 characters")
    .trim(),
  body("model")
    .optional()
    .isString()
    .withMessage("Vehicle model must be a string")
    .isLength({ min: 1, max: 50 })
    .withMessage("Vehicle model must be between 1 and 50 characters")
    .trim(),
  body("year")
    .optional()
    .isInt({ min: 1900, max: currentYear + 1 })
    .withMessage(`Vehicle year must be between 1900 and ${currentYear + 1}`),
  body("color")
    .optional()
    .isString()
    .withMessage("Vehicle color must be a string")
    .isLength({ max: 30 })
    .withMessage("Vehicle color must not exceed 30 characters")
    .trim(),
  body("vin")
    .optional()
    .isString()
    .withMessage("VIN must be a string")
    .matches(/^[A-HJ-NPR-Z0-9]{17}$/)
    .withMessage("VIN must be exactly 17 characters and contain only valid VIN characters")
    .toUpperCase(),
  body("licensePlate")
    .optional()
    .isString()
    .withMessage("License plate must be a string")
    .isLength({ max: 20 })
    .withMessage("License plate must not exceed 20 characters")
    .trim()
    .toUpperCase(),
  body("mileage")
    .optional()
    .isInt({ min: 0, max: 9999999 })
    .withMessage("Mileage must be a non-negative integer less than 10 million"),
  body("notes")
    .optional()
    .isString()
    .withMessage("Notes must be a string")
    .isLength({ max: 1000 })
    .withMessage("Notes must not exceed 1000 characters"),
];

/**
 * Validation for vehicle ID parameter
 */
export const validateVehicleId = [
  param("id")
    .isMongoId()
    .withMessage("Vehicle ID must be a valid MongoDB ID"),
];
