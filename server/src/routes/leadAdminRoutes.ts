import { Router } from "express";
import { adminAuth } from "../middlewares/adminAuth";
import { getAllLeads, archiveLead, updateLeadStatus } from "../controllers/leadAdminController";

const router = Router();


router.get("/", adminAuth, getAllLeads);

router.delete("/:id", adminAuth, archiveLead);

router.patch("/:id/status", adminAuth, updateLeadStatus);

export default router;
