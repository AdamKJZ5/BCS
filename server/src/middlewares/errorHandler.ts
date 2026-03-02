import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import logger from "../utils/logger";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {

  let statusCode = 500;
  let message = "Internal server error";

  logger.error(err);

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
}

  if (process.env.NODE_ENV === "production") {
    return res.status(statusCode).json({
      message
    });
  }

  return res.status(statusCode).json({
    message,
    stack: err.stack
  }) 
}
