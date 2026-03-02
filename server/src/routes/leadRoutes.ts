import { Router } from "express";
import { createLead } from "../controllers/leadController";
import { upload } from "../middlewares/upload";
import { leadLimiter, uploadLimiter } from "../middlewares/rateLimiters";

const router = Router();

router.post("/", leadLimiter, uploadLimiter, upload.array("photos", 3), createLead);

export default router;
