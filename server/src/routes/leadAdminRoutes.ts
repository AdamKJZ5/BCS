import { Router } from "express";
import { adminAuth } from "../middlewares/adminAuth";
import {
  getAllLeads,
  archiveLead,
  updateLeadStatus,
  updateRepairTracking,
  addProgressNote,
  assignCustomer,
  resendSignupEmail,
} from "../controllers/leadAdminController";

const router = Router();

router.get("/", adminAuth, getAllLeads);

router.delete("/:id", adminAuth, archiveLead);

router.patch("/:id/status", adminAuth, updateLeadStatus);

// New repair tracking endpoints
router.patch("/:id/tracking", adminAuth, updateRepairTracking);
router.post("/:id/notes", adminAuth, addProgressNote);
router.patch("/:id/assign", adminAuth, assignCustomer);
router.post("/:id/resend-signup", adminAuth, resendSignupEmail);

export default router;
