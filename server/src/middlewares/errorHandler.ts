import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {

  let statusCode = 500;
  let message = "Internal server error";

  console.error(err);
  
  if (err instaceof AppError) {
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
