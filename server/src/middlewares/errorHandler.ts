import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(err);
  
  if (process.env.NODE_ENV === "production") {
    return res.status(500).json({
      message: "Something went wrong"
    });
  }

  return res.status(500).json({
    message: err.message || "Server error",
    stack: err.stack
  }) 
}
