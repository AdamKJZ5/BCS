import * as Sentry from "@sentry/node";
import { Express } from "express";
import logger from "../utils/logger";

/**
 * Initialize Sentry error tracking and performance monitoring
 */
export const initSentry = (app: Express) => {
  // Only initialize if DSN is provided
  if (!process.env.SENTRY_DSN) {
    logger.warn('Sentry DSN not configured - skipping error tracking');
    return;
  }

  // Sentry temporarily disabled due to API compatibility issues
  logger.warn('Sentry temporarily disabled - will be re-enabled after fixing API compatibility');
  return;

  // NOTE: Sentry initialization code removed - to be re-implemented when upgrading to compatible version
};

/**
 * Get Sentry request handler middleware
 */
export const sentryRequestHandler = () => {
  // Sentry disabled - return no-op middleware
  return (req: any, res: any, next: any) => next();
};

/**
 * Get Sentry tracing handler middleware
 */
export const sentryTracingHandler = () => {
  // Sentry disabled - return no-op middleware
  return (req: any, res: any, next: any) => next();
};

/**
 * Get Sentry error handler middleware
 */
export const sentryErrorHandler = () => {
  // Sentry disabled - return no-op middleware
  return (err: any, req: any, res: any, next: any) => next(err);
};

/**
 * Capture exception manually
 */
export const captureException = (error: Error, context?: any) => {
  if (!process.env.SENTRY_DSN) return;

  Sentry.captureException(error, {
    extra: context,
  });
};

/**
 * Capture custom message
 */
export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
  if (!process.env.SENTRY_DSN) return;

  Sentry.captureMessage(message, level);
};

/**
 * Set user context
 */
export const setUserContext = (user: { id: string; email: string; role?: string }) => {
  if (!process.env.SENTRY_DSN) return;

  Sentry.setUser({
    id: user.id,
    email: user.email,
    role: user.role,
  });
};

export default Sentry;
