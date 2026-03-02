import { Router } from "express";
import { authMiddleware, customerOnly } from "../middlewares/auth";
import {
  getMyVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  setPrimaryVehicle,
  setSecondaryVehicle,
} from "../controllers/vehicleController";

const router = Router();

// All routes require customer authentication
router.use(authMiddleware, customerOnly);

router.get("/", getMyVehicles);
router.get("/:id", getVehicle);
router.post("/", createVehicle);
router.patch("/:id", updateVehicle);
router.delete("/:id", deleteVehicle);
router.post("/:id/set-primary", setPrimaryVehicle);
router.post("/:id/set-secondary", setSecondaryVehicle);

export default router;
