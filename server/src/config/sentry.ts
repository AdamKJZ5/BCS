import * as Sentry from "@sentry/node";
import { Express } from "express";

/**
 * Initialize Sentry error tracking and performance monitoring
 */
export const initSentry = (app: Express) => {
  // Only initialize if DSN is provided
  if (!process.env.SENTRY_DSN) {
    console.log('⚠️  Sentry DSN not configured - skipping error tracking');
    return;
  }

  // Build integrations array
  const integrations: any[] = [
    // Enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),

    // Enable Express middleware tracing
    new Sentry.Integrations.Express({ app }),
  ];

  // Try to enable profiling (optional, may fail on some systems)
  try {
    const { nodeProfilingIntegration } = require("@sentry/profiling-node");
    integrations.push(nodeProfilingIntegration());
    console.log('✅ Sentry profiling enabled');
  } catch (error) {
    console.log('⚠️  Sentry profiling not available (native module not found) - continuing without profiling');
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',

    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0, // 10% in prod, 100% in dev

    // Profiling (only if available)
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    integrations,

    // Set release version from package.json or environment
    release: process.env.npm_package_version,

    // Filter out sensitive data
    beforeSend(event, hint) {
      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
        delete event.request.headers['x-api-key'];
      }

      // Remove password fields from request data
      if (event.request?.data) {
        const data = event.request.data;
        if (typeof data === 'object' && data.password) {
          data.password = '[FILTERED]';
        }
      }

      return event;
    },

    // Ignore certain errors
    ignoreErrors: [
      // Network errors
      'ECONNREFUSED',
      'ECONNRESET',
      'ETIMEDOUT',

      // Client errors that shouldn't be tracked
      'ValidationError',

      // Bot/spam requests
      /.*bot.*/i,
    ],
  });

  console.log('✅ Sentry initialized for error tracking');
};

/**
 * Get Sentry request handler middleware
 */
export const sentryRequestHandler = () => {
  if (!process.env.SENTRY_DSN) {
    return (req: any, res: any, next: any) => next();
  }
  return Sentry.Handlers.requestHandler();
};

/**
 * Get Sentry tracing handler middleware
 */
export const sentryTracingHandler = () => {
  if (!process.env.SENTRY_DSN) {
    return (req: any, res: any, next: any) => next();
  }
  return Sentry.Handlers.tracingHandler();
};

/**
 * Get Sentry error handler middleware
 */
export const sentryErrorHandler = () => {
  if (!process.env.SENTRY_DSN) {
    return (err: any, req: any, res: any, next: any) => next(err);
  }
  return Sentry.Handlers.errorHandler();
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
