import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Tell winston about our colors
winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Define console format (pretty print for development)
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    (info) => `${info.timestamp} [${info.level}]: ${info.message}${info.stack ? '\n' + info.stack : ''}`
  )
);

// Determine log level based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'info';
};

// Create transports
const transports: winston.transport[] = [];

// Console transport (always enabled)
if (process.env.NODE_ENV !== 'test') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

// File transport for errors (daily rotation)
transports.push(
  new DailyRotateFile({
    filename: path.join('logs', 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxFiles: '30d', // Keep logs for 30 days
    maxSize: '20m', // Rotate if file exceeds 20MB
    format: format,
  })
);

// File transport for all logs (daily rotation)
transports.push(
  new DailyRotateFile({
    filename: path.join('logs', 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxFiles: '14d', // Keep logs for 14 days
    maxSize: '20m',
    format: format,
  })
);

// File transport for HTTP requests (daily rotation)
transports.push(
  new DailyRotateFile({
    filename: path.join('logs', 'http-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'http',
    maxFiles: '7d', // Keep HTTP logs for 7 days
    maxSize: '20m',
    format: format,
  })
);

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  // Don't exit on uncaught exceptions
  exitOnError: false,
});

// Helper functions for common logging patterns
export const loggers = {
  /**
   * Log API requests
   */
  apiRequest: (method: string, url: string, userId?: string, data?: any) => {
    logger.http('API Request', {
      method,
      url,
      userId,
      data: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * Log API responses
   */
  apiResponse: (method: string, url: string, statusCode: number, duration?: number) => {
    logger.http('API Response', {
      method,
      url,
      statusCode,
      duration: duration ? `${duration}ms` : undefined,
    });
  },

  /**
   * Log authentication events
   */
  auth: (event: string, email: string, success: boolean, details?: any) => {
    logger.info('Authentication Event', {
      event,
      email,
      success,
      ...details,
    });
  },

  /**
   * Log database operations
   */
  database: (operation: string, collection: string, details?: any) => {
    logger.debug('Database Operation', {
      operation,
      collection,
      ...details,
    });
  },

  /**
   * Log payment events
   */
  payment: (event: string, amount: number, invoiceId?: string, details?: any) => {
    logger.info('Payment Event', {
      event,
      amount,
      invoiceId,
      ...details,
    });
  },

  /**
   * Log email events
   */
  email: (to: string, subject: string, success: boolean, error?: string) => {
    if (success) {
      logger.info('Email Sent', { to, subject });
    } else {
      logger.error('Email Failed', { to, subject, error });
    }
  },

  /**
   * Log errors with context
   */
  error: (message: string, error: Error, context?: any) => {
    logger.error(message, {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      ...context,
    });
  },

  /**
   * Log security events
   */
  security: (event: string, severity: 'low' | 'medium' | 'high' | 'critical', details?: any) => {
    const level = severity === 'critical' || severity === 'high' ? 'error' : 'warn';
    logger[level]('Security Event', {
      event,
      severity,
      ...details,
    });
  },

  /**
   * Log audit trail for admin actions
   */
  audit: (action: string, adminId: string, resourceType: string, resourceId: string, changes?: any) => {
    logger.info('Audit Trail', {
      action,
      adminId,
      resourceType,
      resourceId,
      changes: changes ? JSON.stringify(changes) : undefined,
      timestamp: new Date().toISOString(),
    });
  },
};

export default logger;
