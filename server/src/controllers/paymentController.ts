import { Request, Response, NextFunction } from "express";
import Stripe from "stripe";
import Invoice from "../models/Invoice";
import { AppError } from "../utils/AppError";
import { ENV } from "../config/env";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-12-15.clover"
});

/**
 * Create payment intent for invoice
 */
export const createPaymentIntent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { invoiceId } = req.body;
    const userId = (req as any).user?.id;

    // Get invoice
    const invoice = await Invoice.findById(invoiceId).populate("customerId");
    if (!invoice) {
      throw new AppError("Invoice not found", 404);
    }

    // Verify this invoice belongs to the user
    if (invoice.customerId._id.toString() !== userId) {
      throw new AppError("Not authorized to pay this invoice", 403);
    }

    // Check if already paid
    if (invoice.status === "paid") {
      throw new AppError("Invoice is already paid", 400);
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(invoice.amountDue * 100), // Stripe uses cents
      currency: "usd",
      metadata: {
        invoiceId: invoice._id.toString(),
        customerId: userId,
        invoiceNumber: invoice.invoiceNumber
      },
      automatic_payment_methods: {
        enabled: true
      }
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      amount: invoice.amountDue
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Stripe webhook handler
 */
export const handleStripeWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
      throw new AppError("Missing webhook signature or secret", 400);
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig as string,
        webhookSecret
      );
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      throw new AppError(`Webhook Error: ${err.message}`, 400);
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;

      case "payment_intent.payment_failed":
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.error("Payment failed:", failedPayment);
        // Could send email notification here
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const { invoiceId } = paymentIntent.metadata;

  if (!invoiceId) {
    console.error("No invoiceId in payment intent metadata");
    return;
  }

  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) {
    console.error(`Invoice ${invoiceId} not found`);
    return;
  }

  const amount = paymentIntent.amount / 100; // Convert from cents

  // Add payment to invoice
  invoice.payments.push({
    amount,
    method: "stripe",
    transactionId: paymentIntent.id,
    paidAt: new Date(),
    notes: `Stripe payment: ${paymentIntent.id}`
  });

  // Update payment tracking
  invoice.amountPaid += amount;
  invoice.amountDue -= amount;

  // Update status
  if (invoice.amountDue <= 0) {
    invoice.status = "paid";
    invoice.paidDate = new Date();
  } else if (invoice.amountPaid > 0) {
    invoice.status = "partially_paid";
  }

  await invoice.save();

  console.log(`Payment recorded for invoice ${invoice.invoiceNumber}`);

  // TODO: Send payment confirmation email to customer
}

/**
 * Get Stripe publishable key (for frontend)
 */
export const getStripeConfig = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json({
      success: true,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || ""
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create setup intent for saving card (optional feature)
 */
export const createSetupIntent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.id;

    const setupIntent = await stripe.setupIntents.create({
      metadata: {
        customerId: userId
      }
    });

    res.json({
      success: true,
      clientSecret: setupIntent.client_secret
    });
  } catch (error) {
    next(error);
  }
};
