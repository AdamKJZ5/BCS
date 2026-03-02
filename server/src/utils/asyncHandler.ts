import { Request, Response, NextFunction } from 'express';

/**
 * Type definition for async route handlers
 */
type AsyncFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

/**
 * Higher-order function that wraps async route handlers
 * Eliminates the need for try-catch blocks in every controller
 *
 * @param fn - The async route handler function
 * @returns A wrapped function that automatically catches errors and passes them to next()
 *
 * @example
 * // Before (with manual try-catch):
 * export const getUser = async (req: Request, res: Response, next: NextFunction) => {
 *   try {
 *     const user = await User.findById(req.params.id);
 *     res.json(user);
 *   } catch (error) {
 *     next(error);
 *   }
 * };
 *
 * // After (with asyncHandler):
 * export const getUser = asyncHandler(async (req, res) => {
 *   const user = await User.findById(req.params.id);
 *   res.json(user);
 * });
 *
 * Benefits:
 * - Eliminates ~60+ try-catch blocks across all controllers
 * - Cleaner, more readable code
 * - Consistent error handling
 * - Easier to add logging, metrics, or monitoring
 */
export const asyncHandler = (fn: AsyncFunction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
