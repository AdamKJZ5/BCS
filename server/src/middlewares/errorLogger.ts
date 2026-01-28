import { Request, Response, NextFunction } from 'express';
import { loggers } from '../utils/logger';

/**
 * Middleware to log errors before they are handled
 */
export const errorLogger = (
  err: Error | any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error with context
  loggers.error('Request Error', err, {
    method: req.method,
    url: req.url,
    query: req.query,
    body: req.body,
    userId: (req as any).user?.id,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Pass error to the next error handler
  next(err);
};
