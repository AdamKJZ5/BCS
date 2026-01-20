import express from "express";
import cors from "cors";
import leadRoutes from "./routes/leadRoutes";
import rateLimit from "express-rate-limit";
import path from "path";
import adminRoutes from "./routes/leadAdminRoutes";
import { notFound } from "./middlewares/notFound";
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

app.use("/api/leads", leadLimiter, leadRoutes);
app.use("/api/admin/leads", adminRoutes);

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use(cors(corsOptions));

app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use(notFound);


export default app;
