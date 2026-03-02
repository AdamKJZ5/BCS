import { Response } from "express";
import { AuthRequest } from "../middlewares/auth";
import Lead from "../models/Lead";
import { AppError } from "../utils/AppError";
import asyncHandler from "../utils/asyncHandler";

export const getMyRepairs = asyncHandler(async (
  req: AuthRequest,
  res: Response
) => {
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
});

export const getRepairById = asyncHandler(async (
  req: AuthRequest,
  res: Response
) => {
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
});

export const getRepairsByEmail = asyncHandler(async (
  req: AuthRequest,
  res: Response
) => {
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
});
