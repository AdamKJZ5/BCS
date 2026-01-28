import { Router } from "express";
import { authMiddleware, customerOnly } from "../middlewares/auth";
import { adminAuth } from "../middlewares/adminAuth";
import { appointmentUpload } from "../middlewares/appointmentUpload";
import {
  getAvailability,
  createAppointment,
  getMyAppointments,
  updateAppointment,
  cancelAppointment,
  getAllAppointments,
  getCalendarView,
  getAppointmentsByEmployee,
  createAdminAppointment,
  assignAppointment,
  updateAppointmentStatus,
  getAppointmentStats,
  createInvoiceFromAppointment,
  uploadAppointmentPhotos,
  deleteAppointmentPhoto,
  exportAppointmentICalendSingle,
  exportMyAppointmentsICal,
  exportAllAppointmentsICal,
} from "../controllers/appointmentController";

const router = Router();

// Public route - no auth required for checking availability
router.get("/availability", getAvailability);

// Customer routes (authenticated customers)
router.get("/my-appointments", authMiddleware, customerOnly, getMyAppointments);
router.get("/my-appointments/export", authMiddleware, customerOnly, exportMyAppointmentsICal);
router.post("/", authMiddleware, customerOnly, createAppointment);
router.patch("/:id", authMiddleware, customerOnly, updateAppointment);
router.delete("/:id", authMiddleware, customerOnly, cancelAppointment);
router.get("/:id/export", authMiddleware, exportAppointmentICalendSingle);

// Photo upload routes (both customers and admins can upload)
router.post("/:id/photos", authMiddleware, appointmentUpload.array("photos", 10), uploadAppointmentPhotos);
router.delete("/:id/photos/:photoIndex", authMiddleware, deleteAppointmentPhoto);

// Admin routes
router.get("/", adminAuth, getAllAppointments);
router.get("/calendar", adminAuth, getCalendarView);
router.get("/export-all", adminAuth, exportAllAppointmentsICal);
router.get("/by-employee/:employeeId", adminAuth, getAppointmentsByEmployee);
router.post("/admin", adminAuth, createAdminAppointment);
router.patch("/:id/assign", adminAuth, assignAppointment);
router.patch("/:id/status", adminAuth, updateAppointmentStatus);
router.get("/stats", adminAuth, getAppointmentStats);
router.post("/:id/create-invoice", adminAuth, createInvoiceFromAppointment);

export default router;
