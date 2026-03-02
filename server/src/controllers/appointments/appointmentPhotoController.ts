/**
 * Appointment Photo Controller
 * Handles photo uploads and management for appointments
 */

import { Request, Response, NextFunction } from "express";
import Appointment from "../../models/Appointment";
import { AppError } from "../../utils/AppError";

/**
 * Upload photos to an appointment
 */
export const uploadAppointmentPhotos = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      throw new AppError("Appointment not found", 404);
    }

    // Check authorization: customer must own the appointment, or user must be admin
    if (userRole !== "admin" && appointment.customerId.toString() !== userId) {
      throw new AppError("Not authorized to upload photos to this appointment", 403);
    }

    // Get uploaded files from multer
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      throw new AppError("No files uploaded", 400);
    }

    // Generate URLs for the uploaded files
    const photoUrls = files.map((file) => {
      return `/uploads/appointments/${file.filename}`;
    });

    // Add photos to appointment
    if (!appointment.photos) {
      appointment.photos = [];
    }
    appointment.photos.push(...photoUrls);
    await appointment.save();

    res.json({
      success: true,
      message: `${files.length} photo(s) uploaded successfully`,
      photos: photoUrls,
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a photo from an appointment
 */
export const deleteAppointmentPhoto = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, photoIndex } = req.params;
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      throw new AppError("Appointment not found", 404);
    }

    // Check authorization
    if (userRole !== "admin" && appointment.customerId.toString() !== userId) {
      throw new AppError("Not authorized to delete photos from this appointment", 403);
    }

    if (!appointment.photos || appointment.photos.length === 0) {
      throw new AppError("No photos found for this appointment", 404);
    }

    if (!photoIndex || typeof photoIndex !== "string") {
      throw new AppError("Photo index is required", 400);
    }

    const index = parseInt(photoIndex as string);
    if (isNaN(index) || index < 0 || index >= appointment.photos.length) {
      throw new AppError("Invalid photo index", 400);
    }

    // Remove photo URL from array
    const [removedPhoto] = appointment.photos.splice(index, 1);
    await appointment.save();

    // Optionally delete the file from disk
    // Note: We keep the file on disk in case other records reference it
    // If you want to delete: fs.unlinkSync(path.join(__dirname, '../../', removedPhoto));

    res.json({
      success: true,
      message: "Photo deleted successfully",
      appointment,
    });
  } catch (error) {
    next(error);
  }
};
