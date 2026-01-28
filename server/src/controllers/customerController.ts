import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth";
import Lead from "../models/Lead";
import { AppError } from "../utils/AppError";

export const getMyRepairs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Not authenticated", 401);
    }

    // Find leads assigned to this customer
    const repairs = await Lead.find({
      userId: userId,
      archived: false,
    })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      repairs,
    });
  } catch (error) {
    next(error);
  }
};

export const getRepairById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const repairId = req.params.id;

    if (!userId) {
      throw new AppError("Not authenticated", 401);
    }

    const repair = await Lead.findOne({
      _id: repairId,
      userId: userId,
      archived: false,
    }).lean();

    if (!repair) {
      throw new AppError("Repair not found", 404);
    }

    res.status(200).json({
      success: true,
      repair,
    });
  } catch (error) {
    next(error);
  }
};

export const getRepairsByEmail = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const email = req.user?.email;

    if (!email) {
      throw new AppError("Not authenticated", 401);
    }

    // Find repairs by email (for legacy leads without userId)
    const repairs = await Lead.find({
      email: email,
      archived: false,
    })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      repairs,
    });
  } catch (error) {
    next(error);
  }
};
