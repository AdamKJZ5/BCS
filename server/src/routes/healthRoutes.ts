import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import { version } from "../../package.json";

const router = Router();

/**
 * Basic health check
 * Returns 200 if server is running
 */
router.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * Detailed health check
 * Checks all service dependencies
 */
router.get("/health/detailed", async (req: Request, res: Response) => {
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    version: version || "unknown",
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    services: {
      database: "unknown",
      memory: "unknown",
      stripe: "unknown",
    },
    memory: {
      used: 0,
      total: 0,
      percentage: 0,
    },
  };

  // Check database connection
  try {
    if (mongoose.connection.readyState === 1) {
      health.services.database = "healthy";
    } else {
      health.services.database = "unhealthy";
      health.status = "degraded";
    }
  } catch (error) {
    health.services.database = "error";
    health.status = "degraded";
  }

  // Check memory usage
  const memUsage = process.memoryUsage();
  health.memory = {
    used: Math.round(memUsage.heapUsed / 1024 / 1024),
    total: Math.round(memUsage.heapTotal / 1024 / 1024),
    percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
  };

  if (health.memory.percentage > 90) {
    health.services.memory = "critical";
    health.status = "degraded";
  } else if (health.memory.percentage > 75) {
    health.services.memory = "warning";
  } else {
    health.services.memory = "healthy";
  }

  // Check Stripe configuration
  if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('replace')) {
    health.services.stripe = "configured";
  } else {
    health.services.stripe = "not_configured";
  }

  // Return appropriate status code
  const statusCode = health.status === "ok" ? 200 : 503;
  res.status(statusCode).json(health);
});

/**
 * Readiness probe
 * Returns 200 when app is ready to serve traffic
 */
router.get("/health/ready", async (req: Request, res: Response) => {
  try {
    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        ready: false,
        reason: "Database not connected",
      });
    }

    // Check if critical environment variables are set
    const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
    const missing = requiredEnvVars.filter(v => !process.env[v]);

    if (missing.length > 0) {
      return res.status(503).json({
        ready: false,
        reason: `Missing environment variables: ${missing.join(', ')}`,
      });
    }

    res.status(200).json({
      ready: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      ready: false,
      reason: "Health check failed",
    });
  }
});

/**
 * Liveness probe
 * Returns 200 if server process is alive
 */
router.get("/health/live", (req: Request, res: Response) => {
  res.status(200).json({
    alive: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * Metrics endpoint (Prometheus-compatible)
 */
router.get("/metrics", (req: Request, res: Response) => {
  const memUsage = process.memoryUsage();

  const metrics = `
# HELP nodejs_memory_heap_used_bytes Node.js heap memory used
# TYPE nodejs_memory_heap_used_bytes gauge
nodejs_memory_heap_used_bytes ${memUsage.heapUsed}

# HELP nodejs_memory_heap_total_bytes Node.js heap memory total
# TYPE nodejs_memory_heap_total_bytes gauge
nodejs_memory_heap_total_bytes ${memUsage.heapTotal}

# HELP nodejs_process_uptime_seconds Process uptime in seconds
# TYPE nodejs_process_uptime_seconds counter
nodejs_process_uptime_seconds ${process.uptime()}

# HELP nodejs_database_status Database connection status (1=connected, 0=disconnected)
# TYPE nodejs_database_status gauge
nodejs_database_status ${mongoose.connection.readyState === 1 ? 1 : 0}
`;

  res.set('Content-Type', 'text/plain');
  res.send(metrics.trim());
});

export default router;
