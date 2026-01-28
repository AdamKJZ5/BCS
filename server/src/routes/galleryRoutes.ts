import { Router } from "express";
import { adminAuth } from "../middlewares/adminAuth";
import { upload } from "../middlewares/upload";
import {
  getAllPhotos,
  getPhoto,
  uploadPhoto,
  updatePhoto,
  deletePhoto,
} from "../controllers/galleryController";

const router = Router();

// Public routes
router.get("/", getAllPhotos);
router.get("/:id", getPhoto);

// Admin routes
router.post("/", adminAuth, upload.single("photo"), uploadPhoto);
router.patch("/:id", adminAuth, updatePhoto);
router.delete("/:id", adminAuth, deletePhoto);

export default router;
