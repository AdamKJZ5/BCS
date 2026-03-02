/**
 * Invoice Validation Middleware
 * Express-validator rules for invoice operations
 */

import { body, param, query } from "express-validator";

/**
 * Validation for creating an invoice
 */
export const validateCreateInvoice = [
  body("customerId")
    .notEmpty()
    .withMessage("Customer ID is required")
    .isMongoId()
    .withMessage("Customer ID must be a valid MongoDB ID"),
  body("leadId")
    .optional()
    .isMongoId()
    .withMessage("Lead ID must be a valid MongoDB ID"),
  body("appointmentId")
    .optional()
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
  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("Due date must be a valid date"),
  body("notes")
    .optional()
    .isString()
    .withMessage("Notes must be a string")
    .isLength({ max: 1000 })
    .withMessage("Notes must not exceed 1000 characters"),
];

/**
 * Validation for updating invoice status
 */
export const validateUpdateInvoiceStatus = [
  param("id")
    .isMongoId()
    .withMessage("Invoice ID must be a valid MongoDB ID"),
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["draft", "sent", "paid", "partially_paid", "overdue", "cancelled"])
    .withMessage("Invalid invoice status"),
];

/**
 * Validation for recording payment
 */
export const validateRecordPayment = [
  param("id")
    .isMongoId()
    .withMessage("Invoice ID must be a valid MongoDB ID"),
  body("amount")
    .notEmpty()
    .withMessage("Payment amount is required")
    .isFloat({ min: 0.01 })
    .withMessage("Payment amount must be greater than 0"),
  body("method")
    .notEmpty()
    .withMessage("Payment method is required")
    .isIn(["cash", "check", "credit_card", "debit_card", "bank_transfer", "other"])
    .withMessage("Invalid payment method"),
  body("reference")
    .optional()
    .isString()
    .withMessage("Payment reference must be a string")
    .isLength({ max: 100 })
    .withMessage("Payment reference must not exceed 100 characters"),
  body("notes")
    .optional()
    .isString()
    .withMessage("Notes must be a string")
    .isLength({ max: 500 })
    .withMessage("Notes must not exceed 500 characters"),
];

/**
 * Validation for getting invoices
 */
export const validateGetInvoices = [
  query("status")
    .optional()
    .isIn(["draft", "sent", "paid", "partially_paid", "overdue", "cancelled", "all"])
    .withMessage("Invalid status filter"),
  query("customerId")
    .optional()
    .isMongoId()
    .withMessage("Customer ID must be a valid MongoDB ID"),
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid date"),
  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid date"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
];

/**
 * Validation for invoice ID parameter
 */
export const validateInvoiceId = [
  param("id")
    .isMongoId()
    .withMessage("Invoice ID must be a valid MongoDB ID"),
];
