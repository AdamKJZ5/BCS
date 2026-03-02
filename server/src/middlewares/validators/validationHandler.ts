/**
 * Validation Handler Middleware
 * Processes validation results from express-validator
 */

import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { AppError } from "../../utils/AppError";

/**
 * Middleware to handle validation errors
 * Should be used after validation chains
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => {
      // Handle different error types from express-validator
      if ('msg' in error) {
        return error.msg;
      }
      return 'Validation error';
    });

    // Return first error message or combined message
    const message = errorMessages.length === 1
      ? errorMessages[0]
      : `Validation failed: ${errorMessages.join(", ")}`;

    return next(new AppError(message, 400));
  }

  next();
};

/**
 * Combine validation chain with error handler
 * Usage: validate(validationChain)
 */
export const validate = (validations: any[]) => {
  return [...validations, handleValidationErrors];
};
