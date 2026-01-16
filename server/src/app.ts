import express from "express";
import cors from "cors";
import leadRoutes from "./routes/leadRoutes";
<<<<<<< HEAD
import errorHandler from "./middleware/errorhandler";
=======
import rateLimit from "express-rate-limit";

import { errorHandler } from "./middlewares/errorHandler";

const leadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many requests, please try again later"
});
>>>>>>> 87418e13f8b3b03ba567bd3339fb0fb1c2500d21

const app = express();

// CORS configuration - restrict to specific domain in production
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
  credentials: true
};

<<<<<<< HEAD
app.use(errorHandler);

app.use("/api/leads", leadRoutes);
=======
app.use(cors(corsOptions));

app.use(express.json());
>>>>>>> 87418e13f8b3b03ba567bd3339fb0fb1c2500d21

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/leads", leadLimiter, leadRoutes);

app.use(errorHandler);

export default app;
