/**
 * Appointment Validation Middleware
 * Express-validator rules for appointment operations
 */

import { body, param, query } from "express-validator";

/**
 * Validation for creating an appointment
 */
export const validateCreateAppointment = [
  body("startTime")
    .notEmpty()
    .withMessage("Start time is required")
    .isISO8601()
    .withMessage("Start time must be a valid date"),
  body("duration")
    .notEmpty()
    .withMessage("Duration is required")
    .isInt({ min: 15, max: 480 })
    .withMessage("Duration must be between 15 and 480 minutes"),
  body("appointmentType")
    .notEmpty()
    .withMessage("Appointment type is required")
    .isIn(["drop_off", "pickup", "consultation", "estimate", "inspection"])
    .withMessage("Invalid appointment type"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string")
    .isLength({ max: 1000 })
    .withMessage("Description must not exceed 1000 characters"),
  body("vehicleInfo")
    .optional()
    .isObject()
    .withMessage("Vehicle info must be an object"),
  body("vehicleInfo.make")
    .optional()
    .isString()
    .withMessage("Vehicle make must be a string"),
  body("vehicleInfo.model")
    .optional()
    .isString()
    .withMessage("Vehicle model must be a string"),
  body("vehicleInfo.year")
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage("Vehicle year must be valid"),
  body("leadId")
    .optional()
    .isMongoId()
    .withMessage("Lead ID must be a valid MongoDB ID"),
];

/**
 * Validation for updating appointment status
 */
export const validateUpdateAppointmentStatus = [
  param("id")
    .isMongoId()
    .withMessage("Appointment ID must be a valid MongoDB ID"),
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show"])
    .withMessage("Invalid appointment status"),
  body("notes")
    .optional()
    .isString()
    .withMessage("Notes must be a string")
    .isLength({ max: 1000 })
    .withMessage("Notes must not exceed 1000 characters"),
];

/**
 * Validation for assigning appointment
 */
export const validateAssignAppointment = [
  param("id")
    .isMongoId()
    .withMessage("Appointment ID must be a valid MongoDB ID"),
  body("assignedTo")
    .notEmpty()
    .withMessage("Assigned user ID is required")
    .isMongoId()
    .withMessage("Assigned user ID must be a valid MongoDB ID"),
];

/**
 * Validation for cancelling appointment
 */
export const validateCancelAppointment = [
  param("id")
    .isMongoId()
    .withMessage("Appointment ID must be a valid MongoDB ID"),
  body("reason")
    .optional()
    .isString()
    .withMessage("Cancellation reason must be a string")
    .isLength({ max: 500 })
    .withMessage("Cancellation reason must not exceed 500 characters"),
];

/**
 * Validation for getting availability
 */
export const validateGetAvailability = [
  query("date")
    .notEmpty()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("Date must be a valid ISO 8601 date"),
  query("duration")
    .optional()
    .isInt({ min: 15, max: 480 })
    .withMessage("Duration must be between 15 and 480 minutes"),
  query("employeeId")
    .optional()
    .isMongoId()
    .withMessage("Employee ID must be a valid MongoDB ID"),
];

/**
 * Validation for creating invoice from appointment
 */
export const validateCreateInvoiceFromAppointment = [
  param("id")
    .isMongoId()
    .withMessage("Appointment ID must be a valid MongoDB ID"),
  body("lineItems")
    .isArray({ min: 1 })
    .withMessage("At least one line item is required"),
  body("lineItems.*.description")
    .notEmpty()
    .withMessage("Line item description is required")
    .isString()
    .withMessage("Line item description must be a string")
    .isLength({ max: 200 })
    .withMessage("Line item description must not exceed 200 characters"),
  body("lineItems.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Line item quantity must be a positive integer"),
  body("lineItems.*.unitPrice")
    .isFloat({ min: 0 })
    .withMessage("Line item unit price must be a positive number"),
  body("taxRate")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Tax rate must be between 0 and 100"),
  body("dueInDays")
    .optional()
    .isInt({ min: 0, max: 365 })
    .withMessage("Due in days must be between 0 and 365"),
  body("notes")
    .optional()
    .isString()
    .withMessage("Notes must be a string")
    .isLength({ max: 1000 })
    .withMessage("Notes must not exceed 1000 characters"),
];

/**
 * Validation for photo upload
 */
export const validatePhotoUpload = [
  param("id")
    .isMongoId()
    .withMessage("Appointment ID must be a valid MongoDB ID"),
];

/**
 * Validation for deleting photo
 */
export const validateDeletePhoto = [
  param("id")
    .isMongoId()
    .withMessage("Appointment ID must be a valid MongoDB ID"),
  param("photoIndex")
    .isInt({ min: 0 })
    .withMessage("Photo index must be a non-negative integer"),
];
