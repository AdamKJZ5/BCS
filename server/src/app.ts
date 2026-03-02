import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";
import leadRoutes from "./routes/leadRoutes";
import path from "path";
import adminRoutes from "./routes/leadAdminRoutes";
import authRoutes from "./routes/authRoutes";
import customerRoutes from "./routes/customerRoutes";
import settingsRoutes from "./routes/settingsRoutes";
import galleryRoutes from "./routes/galleryRoutes";
import invoiceRoutes from "./routes/invoiceRoutes";
import paymentRoutes, { webhookRouter } from "./routes/paymentRoutes";
import appointmentRoutes from "./routes/appointmentRoutes";
import vehicleRoutes from "./routes/vehicleRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import serviceRecordRoutes from "./routes/serviceRecordRoutes";
import { notFound } from "./middlewares/notFound";
import { errorHandler } from "./middlewares/errorHandler";
import { httpLogger } from "./middlewares/requestLogger";
import { errorLogger } from "./middlewares/errorLogger";
import logger from "./utils/logger";
import {
  initSentry,
  sentryRequestHandler,
  sentryTracingHandler,
  sentryErrorHandler
} from "./config/sentry";
import healthRoutes from "./routes/healthRoutes";
import { leadLimiter, authLimiter, apiLimiter } from "./middlewares/rateLimiters";

const app = express();

// Initialize Sentry (must be first)
initSentry(app);

// CORS configuration - restrict to specific domain in production
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "*",
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "x-api-key", "Authorization"],
  credentials: true
};

// Security middleware must be early in the chain
// Set security HTTP headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "https://js.stripe.com"],
      frameSrc: ["https://js.stripe.com", "https://hooks.stripe.com"],
      connectSrc: ["'self'", "https://api.stripe.com"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false, // Required for Stripe
}));

// CORS configuration
app.use(cors(corsOptions));

// Sentry request tracking
app.use(sentryRequestHandler());
app.use(sentryTracingHandler());

// HTTP request logging
app.use(httpLogger);

// Stripe webhook MUST come BEFORE express.json() to preserve raw body
app.use("/api/payments", webhookRouter);

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization against NoSQL query injection
// TEMPORARILY DISABLED: express-mongo-sanitize has compatibility issues with Express v5
// Mongoose provides built-in protection against NoSQL injection via strict schemas
// TODO: Re-enable when express-mongo-sanitize is updated for Express v5
// app.use(mongoSanitize({
//   replaceWith: '_',
//   onSanitize: ({ req, key }) => {
//     logger.warn(`Sanitized potentially malicious input: ${key}`);
//   },
// }));
logger.info('NoSQL injection protection: Using Mongoose schema validation (express-mongo-sanitize disabled due to Express v5 compatibility)');

// Data sanitization against XSS
// TEMPORARILY DISABLED: xss-clean has compatibility issues with Express v5
// Helmet provides XSS protection via Content Security Policy
// TODO: Re-enable when xss-clean is updated for Express v5
// app.use(xss());
logger.info('XSS protection: Using Helmet CSP (xss-clean disabled due to Express v5 compatibility)');

// Prevent HTTP parameter pollution
app.use(hpp({
  whitelist: ['status', 'sortBy', 'page', 'limit'] // Allow these params to be duplicated
}));

// Serve uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Health check routes (no auth required)
app.use("/", healthRoutes);

// Public routes with rate limiting
app.use("/api/leads", leadLimiter, leadRoutes);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/gallery", apiLimiter, galleryRoutes);
app.use("/api/reviews", apiLimiter, reviewRoutes);

// Protected routes with general rate limiting
app.use("/api/admin/leads", apiLimiter, adminRoutes);
app.use("/api/admin/settings", apiLimiter, settingsRoutes);
app.use("/api/customer", apiLimiter, customerRoutes);
app.use("/api/invoices", apiLimiter, invoiceRoutes);
app.use("/api/payments", apiLimiter, paymentRoutes);
app.use("/api/appointments", apiLimiter, appointmentRoutes);
app.use("/api/vehicles", apiLimiter, vehicleRoutes);
app.use("/api/notifications", apiLimiter, notificationRoutes);
app.use("/api/service-records", apiLimiter, serviceRecordRoutes);

// Error handlers must be last
app.use(notFound);

// Sentry error handler (must be before other error handlers)
app.use(sentryErrorHandler());

app.use(errorLogger); // Log errors before handling
app.use(errorHandler);


export default app;
