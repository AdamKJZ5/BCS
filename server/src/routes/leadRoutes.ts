import { Router } from "express";
import { createLead } from "../controllers/leadController";
import { upload } from "../middlewares/upload";

const router = Router();

router.post("/", upload.array("photos", 3), createLead);

export default router;
