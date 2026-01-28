import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env";
import { AppError } from "../utils/AppError";

export interface AdminAuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export function adminAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new AppError("No token provided", 401));
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, ENV.JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
    };

    // Check if user is admin
    if (decoded.role !== "admin") {
      return next(new AppError("Access denied. Admin privileges required.", 403));
    }

    (req as AdminAuthRequest).user = decoded;
    next();
  } catch (error) {
    return next(new AppError("Invalid or expired token", 401));
  }
}
