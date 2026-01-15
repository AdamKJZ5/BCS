import express from "express";
import cors from "cors";
import leadRoutes from "./routes/leadRoutes";
import rateLimit from "express-rate-limit";

import { errorHandler } from "./middlewares/errorHandler"
const LeadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000
  max: 20,
  message: "Too many requests, please try again later"
});

const app = express();

app.use(cors());

app.use(express.json());

app.use(errorHandler);

app.use("/api/leads", leadRoutes);
app.use("/api/leads", leadLimiter);

app.get("/health", (req, res) => res.json({ status: "ok" }));

export default app;
