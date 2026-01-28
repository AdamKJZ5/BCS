import express from "express";
import {
  getVehicleServiceRecords,
  getMyServiceRecords,
  getServiceRecord,
  createServiceRecord,
  updateServiceRecord,
  deleteServiceRecord,
  getVehicleServiceStats,
  adminGetAllServiceRecords,
  adminCreateServiceRecord,
  adminUpdateServiceRecord,
  adminDeleteServiceRecord,
  adminGetServiceStats,
} from "../controllers/serviceRecordController";
import { authMiddleware, customerOnly } from "../middlewares/auth";
import { adminAuth } from "../middlewares/adminAuth";

const router = express.Router();

// ==================== CUSTOMER ROUTES ====================

// Get all service records for authenticated customer
router.get("/my-records", authMiddleware, customerOnly, getMyServiceRecords);

// Get service records for a specific vehicle
router.get("/vehicle/:vehicleId", authMiddleware, customerOnly, getVehicleServiceRecords);

// Get vehicle service statistics
router.get("/vehicle/:vehicleId/stats", authMiddleware, customerOnly, getVehicleServiceStats);

// Get a single service record
router.get("/:id", authMiddleware, customerOnly, getServiceRecord);

// Create a new service record
router.post("/", authMiddleware, customerOnly, createServiceRecord);

// Update a service record
router.patch("/:id", authMiddleware, customerOnly, updateServiceRecord);

// Delete a service record
router.delete("/:id", authMiddleware, customerOnly, deleteServiceRecord);

// ==================== ADMIN ROUTES ====================

// Get all service records with filtering
router.get("/admin/all", adminAuth, adminGetAllServiceRecords);

// Get service statistics
router.get("/admin/stats", adminAuth, adminGetServiceStats);

// Create service record for any vehicle
router.post("/admin", adminAuth, adminCreateServiceRecord);

// Update any service record
router.patch("/admin/:id", adminAuth, adminUpdateServiceRecord);

// Delete any service record
router.delete("/admin/:id", adminAuth, adminDeleteServiceRecord);

export default router;
