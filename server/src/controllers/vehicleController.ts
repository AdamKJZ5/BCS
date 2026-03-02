import { Request, Response } from "express";
import Vehicle from "../models/Vehicle";
import { AppError } from "../utils/AppError";
import asyncHandler from "../utils/asyncHandler";

/**
 * Get all vehicles for the authenticated customer
 */
export const getMyVehicles = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const userId = (req as any).user?.id;

  const vehicles = await Vehicle.find({ userId }).sort({ isPrimary: -1, createdAt: -1 });

  res.json(vehicles);
});

/**
 * Get a single vehicle by ID
 */
export const getVehicle = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const userId = (req as any).user?.id;
  const { id } = req.params;

  const vehicle = await Vehicle.findOne({ _id: id, userId });

  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }

  res.json(vehicle);
});

/**
 * Create a new vehicle
 */
export const createVehicle = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const userId = (req as any).user?.id;
  const { make, model, year, color, vin, licensePlate, nickname, mileage, notes } = req.body;

  if (!make || !model || !year) {
    throw new AppError("Make, model, and year are required", 400);
  }

  // Check if this is the first vehicle - make it primary
  const vehicleCount = await Vehicle.countDocuments({ userId });
  const isPrimary = vehicleCount === 0;

  const vehicle = await Vehicle.create({
    userId,
    make,
    model,
    year,
    color,
    vin,
    licensePlate,
    nickname,
    mileage,
    notes,
    isPrimary,
  });

  res.status(201).json(vehicle);
});

/**
 * Update a vehicle
 */
export const updateVehicle = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const userId = (req as any).user?.id;
  const { id } = req.params;
  const updates = req.body;

  const vehicle = await Vehicle.findOne({ _id: id, userId });

  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }

  // Update fields
  Object.assign(vehicle, updates);
  await vehicle.save();

  res.json(vehicle);
});

/**
 * Delete a vehicle
 */
export const deleteVehicle = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const userId = (req as any).user?.id;
  const { id } = req.params;

  const vehicle = await Vehicle.findOne({ _id: id, userId });

  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }

  await vehicle.deleteOne();

  // If this was primary, make another vehicle primary
  if (vehicle.isPrimary) {
    const nextVehicle = await Vehicle.findOne({ userId }).sort({ createdAt: -1 });
    if (nextVehicle) {
      nextVehicle.isPrimary = true;
      await nextVehicle.save();
    }
  }

  // If this was secondary, make another vehicle secondary (if there's more than one vehicle left)
  if (vehicle.isSecondary) {
    const vehiclesLeft = await Vehicle.find({ userId }).sort({ createdAt: -1 });
    if (vehiclesLeft.length > 1) {
      // Set the second vehicle (after primary) as secondary
      const secondaryCandidate = vehiclesLeft.find(v => !v.isPrimary);
      if (secondaryCandidate) {
        secondaryCandidate.isSecondary = true;
        await secondaryCandidate.save();
      }
    }
  }

  res.json({ success: true, message: "Vehicle deleted" });
});

/**
 * Set a vehicle as primary
 */
export const setPrimaryVehicle = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const userId = (req as any).user?.id;
  const { id } = req.params;

  const vehicle = await Vehicle.findOne({ _id: id, userId });

  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }

  vehicle.isPrimary = true;
  await vehicle.save(); // Pre-save hook will unset others

  res.json(vehicle);
});

/**
 * Set a vehicle as secondary
 */
export const setSecondaryVehicle = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const userId = (req as any).user?.id;
  const { id } = req.params;

  const vehicle = await Vehicle.findOne({ _id: id, userId });

  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }

  vehicle.isSecondary = true;
  await vehicle.save(); // Pre-save hook will unset others

  res.json(vehicle);
});
