import { Request, Response, NextFunction } from "express";
import Vehicle from "../models/Vehicle";
import { AppError } from "../utils/AppError";

/**
 * Get all vehicles for the authenticated customer
 */
export const getMyVehicles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.id;

    const vehicles = await Vehicle.find({ userId }).sort({ isPrimary: -1, createdAt: -1 });

    res.json(vehicles);
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single vehicle by ID
 */
export const getVehicle = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;

    const vehicle = await Vehicle.findOne({ _id: id, userId });

    if (!vehicle) {
      throw new AppError("Vehicle not found", 404);
    }

    res.json(vehicle);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new vehicle
 */
export const createVehicle = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
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
  } catch (error) {
    next(error);
  }
};

/**
 * Update a vehicle
 */
export const updateVehicle = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
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
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a vehicle
 */
export const deleteVehicle = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
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

    res.json({ success: true, message: "Vehicle deleted" });
  } catch (error) {
    next(error);
  }
};

/**
 * Set a vehicle as primary
 */
export const setPrimaryVehicle = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;

    const vehicle = await Vehicle.findOne({ _id: id, userId });

    if (!vehicle) {
      throw new AppError("Vehicle not found", 404);
    }

    vehicle.isPrimary = true;
    await vehicle.save(); // Pre-save hook will unset others

    res.json(vehicle);
  } catch (error) {
    next(error);
  }
};
