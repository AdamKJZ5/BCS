import express from "express";
import cors from "cors";
import leadRoutes from "./routes/leadRoutes";
import errorHandler from "./middleware/errorhandler";
import rateLimit from "express-rate-limit";

import { errorHandler } from "./middlewares/errorHandler";

const leadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many requests, please try again later"
});

const app = express();

// CORS configuration - restrict to specific domain in production
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
  credentials: true
};

app.use(errorHandler);

app.use(cors(corsOptions));

app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/leads", leadLimiter, leadRoutes);


export default app;
