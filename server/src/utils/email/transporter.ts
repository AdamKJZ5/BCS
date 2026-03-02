/**
 * Nodemailer transporter configuration
 */

import nodemailer from 'nodemailer';
import logger from '../logger';

/**
 * Create and configure the email transporter
 */
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Verify transporter connection (optional, use for debugging)
 */
export async function verifyTransporter(): Promise<boolean> {
  try {
    await transporter.verify();
    logger.info('Email transporter is ready');
    return true;
  } catch (error) {
    logger.error('Email transporter verification failed:', error);
    return false;
  }
}

export default transporter;
