import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import {
  createPaymentIntent,
  handleStripeWebhook,
  getStripeConfig,
  createSetupIntent
} from "../controllers/paymentController";
import express from "express";

// Webhook router - MUST be registered BEFORE express.json() in app.ts
export const webhookRouter = Router();
webhookRouter.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

// Payment router - Can be registered after express.json()
const paymentRouter = Router();
paymentRouter.post("/create-payment-intent", authMiddleware, createPaymentIntent);
paymentRouter.post("/create-setup-intent", authMiddleware, createSetupIntent);
paymentRouter.get("/config", getStripeConfig);

export default paymentRouter;
