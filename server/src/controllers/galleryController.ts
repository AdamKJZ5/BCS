import { Request, Response } from "express";
import GalleryPhoto from "../models/GalleryPhoto";
import { AppError } from "../utils/AppError";
import asyncHandler from "../utils/asyncHandler";
import fs from "fs";
import path from "path";

/**
 * Get all gallery photos
 */
export const getAllPhotos = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const { category } = req.query;

  const filter: any = {};
  if (category && category !== "all") {
    filter.category = category;
  }

  const photos = await GalleryPhoto.find(filter).sort({ order: 1, createdAt: -1 });

  res.status(200).json({
    success: true,
    photos,
  });
});

/**
 * Get single gallery photo
 */
export const getPhoto = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;

  const photo = await GalleryPhoto.findById(id);

  if (!photo) {
    throw new AppError("Photo not found", 404);
  }

  res.status(200).json({
    success: true,
    photo,
  });
});

/**
 * Upload gallery photo (admin only)
 */
export const uploadPhoto = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const { title, description, category } = req.body;
  const file = req.file;

  if (!file) {
    throw new AppError("Please upload an image", 400);
  }

  if (!title || !description || !category) {
    throw new AppError("Title, description, and category are required", 400);
  }

  const baseUrl = process.env.BASE_URL || "http://localhost:5000";
  const photoUrl = `${baseUrl}/uploads/${file.filename}`;

  const photo = await GalleryPhoto.create({
    title,
    description,
    category,
    filename: file.filename,
    url: photoUrl,
  });

  res.status(201).json({
    success: true,
    message: "Photo uploaded successfully",
    photo,
  });
});

/**
 * Update gallery photo (admin only)
 */
export const updatePhoto = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;
  const { title, description, category, order } = req.body;

  const photo = await GalleryPhoto.findById(id);

  if (!photo) {
    throw new AppError("Photo not found", 404);
  }

  if (title) photo.title = title;
  if (description) photo.description = description;
  if (category) photo.category = category;
  if (order !== undefined) photo.order = order;

  await photo.save();

  res.status(200).json({
    success: true,
    message: "Photo updated successfully",
    photo,
  });
});

/**
 * Delete gallery photo (admin only)
 */
export const deletePhoto = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;

  const photo = await GalleryPhoto.findById(id);

  if (!photo) {
    throw new AppError("Photo not found", 404);
  }

  // Delete the file from filesystem
  const filePath = path.join(__dirname, "../../uploads", photo.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  await GalleryPhoto.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Photo deleted successfully",
  });
});
