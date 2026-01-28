import { Router } from "express";
import {
  getMyRepairs,
  getRepairById,
  getRepairsByEmail,
} from "../controllers/customerController";
import { authMiddleware, customerOnly } from "../middlewares/auth";

const router = Router();

// All routes require authentication
router.use(authMiddleware, customerOnly);

router.get("/repairs", getMyRepairs);
router.get("/repairs/by-email", getRepairsByEmail);
router.get("/repairs/:id", getRepairById);

export default router;
