import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import app from "./app";
import "./config/env";
import { startAppointmentReminderJob, startFollowUpReminderJob } from "./jobs/appointmentReminders";
import logger, { loggers } from "./utils/logger";

const PORT = process.env.PORT || 5000;

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  loggers.error('Uncaught Exception', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any) => {
  loggers.error('Unhandled Rejection', new Error(reason));
  process.exit(1);
});

mongoose.connect(process.env.MONGO_URI!)
  .then(() => {
    logger.info("MongoDB connected successfully");
    loggers.database("connect", "MongoDB", { uri: process.env.MONGO_URI?.replace(/\/\/.*@/, '//<credentials>@') });

    // Start cron jobs
    startAppointmentReminderJob();
    startFollowUpReminderJob();
    logger.info("Cron jobs started successfully");

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch(err => {
    loggers.error('MongoDB connection failed', err);
    process.exit(1);
  });
