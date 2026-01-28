import { Router } from "express";
import { adminAuth } from "../middlewares/adminAuth";
import { getSettings, updateSettings, initializeReminderSettings } from "../controllers/settingsController";

const router = Router();

// All settings routes require admin authentication
router.get("/", adminAuth, getSettings);
router.put("/", adminAuth, updateSettings);
router.post("/initialize-reminders", adminAuth, initializeReminderSettings);

export default router;
