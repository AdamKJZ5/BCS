import { Request, Response, NextFunction } from "express";
import { ENV } from "../config/env";
import { AppError } from "../utils/AppError";

export function adminAuth(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey || apiKey !== ENV.ADMIN_API_KEY) {
    return next(new AppError("Unauthorized", 401));
  }

  next();
}
