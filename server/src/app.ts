import express from "express";
import cors from "cors";
import leadRoutes from "./routes/leadRoutes";
import errorHandler from "./middleware/errorhandler";

const app = express();

app.use(cors());
app.use(express.json());

app.use(errorHandler);

app.use("/api/leads", leadRoutes);

app.get("/health", (req, res) => res.json({ status: "ok" }));

export default app;
