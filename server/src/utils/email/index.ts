/**
 * Email utility - modular email service
 *
 * This module provides email functionality with templated HTML/text emails.
 * All email functions are exported for use throughout the application.
 */

import { transporter } from './transporter';
import logger from '../logger';

// Import templates
import { leadNotificationHTML, leadNotificationText, autoReplyHTML, autoReplyText } from './templates/lead';
import { signupInviteHTML, signupInviteText, welcomeEmailHTML, welcomeEmailText, passwordResetHTML, passwordResetText } from './templates/auth';
import { appointmentConfirmationHTML, appointmentConfirmationText, appointmentReminderHTML, appointmentReminderText, appointmentFollowUpHTML, appointmentFollowUpText } from './templates/appointment';
import { statusUpdateHTML, statusUpdateText, repairTrackingUpdateHTML, repairTrackingUpdateText } from './templates/status';

// ============================================================================
// LEAD EMAILS
// ============================================================================

export async function sendLeadEmail({
  name,
  email,
  phone,
  message,
  damageDescription,
  photos,
}: {
  name: string;
  email: string;
  phone: string;
  message: string;
  damageDescription?: string;
  photos?: string[];
}) {
  try {
    await transporter.sendMail({
      from: `"Auto Body Website" <${process.env.SMTP_USER}>`,
      to: process.env.OWNER_EMAIL,
      subject: '🚗 New Lead from Website',
      text: leadNotificationText({ name, email, phone, message, damageDescription, photos }),
      html: leadNotificationHTML({ name, email, phone, message, damageDescription, photos }),
    });
  } catch (err) {
    logger.error('Failed to send owner email:', err);
  }
}

export function sendLeadEmailSafe(data: {
  name: string;
  email: string;
  phone: string;
  message: string;
  damageDescription?: string;
  photos?: string[];
}) {
  void sendLeadEmail(data);
}

export async function sendAutoReplySafe(to: string, name: string) {
  try {
    await transporter.sendMail({
      to,
      from: `"Bellevue Collision Services" <${process.env.SMTP_USER}>`,
      subject: '✅ We received your request',
      text: autoReplyText(name),
      html: autoReplyHTML(name),
    });
  } catch (err) {
    logger.error('Failed to send auto-reply:', err);
  }
}

// ============================================================================
// AUTHENTICATION EMAILS
// ============================================================================

export async function sendSignupInviteEmail(
  to: string,
  name: string,
  signupToken: string,
  frontendUrl: string
) {
  try {
    const signupLink = `${frontendUrl}/customer/complete-signup?token=${signupToken}`;

    await transporter.sendMail({
      to,
      from: `"Bellevue Collision Services" <${process.env.SMTP_USER}>`,
      subject: '🔧 Track Your Repair Progress - Complete Your Account Setup',
      text: signupInviteText({ name, signupLink }),
      html: signupInviteHTML({ name, signupLink }),
    });
  } catch (err) {
    logger.error('Failed to send signup invite email:', err);
  }
}

export async function sendWelcomeEmail(to: string, name: string) {
  try {
    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/customer/login`;

    await transporter.sendMail({
      to,
      from: `"Bellevue Collision Services" <${process.env.SMTP_USER}>`,
      subject: '🎉 Welcome to the BCS Family!',
      text: welcomeEmailText({ name, loginUrl }),
      html: welcomeEmailHTML({ name, loginUrl }),
    });
  } catch (err) {
    logger.error('Failed to send welcome email:', err);
  }
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetToken: string,
  frontendUrl: string
) {
  try {
    const resetLink = `${frontendUrl}/customer/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      to,
      from: `"Bellevue Collision Services" <${process.env.SMTP_USER}>`,
      subject: '🔒 Password Reset Request',
      text: passwordResetText({ name, resetLink }),
      html: passwordResetHTML({ name, resetLink }),
    });
  } catch (err) {
    logger.error('Failed to send password reset email:', err);
  }
}

// ============================================================================
// STATUS UPDATE EMAILS
// ============================================================================

export async function sendStatusUpdateEmail(
  to: string,
  name: string,
  leadDetails: {
    serviceType: string;
    submittedDate: string;
    oldStatus: string;
    newStatus: string;
  }
) {
  try {
    const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/customer/dashboard`;
    const smtpUser = process.env.SMTP_USER || '';

    await transporter.sendMail({
      to,
      from: `"Bellevue Collision Services" <${process.env.SMTP_USER}>`,
      subject: `📋 Update on Your Service Request - ${leadDetails.serviceType}`,
      text: statusUpdateText({
        customerName: name,
        serviceType: leadDetails.serviceType,
        submittedDate: leadDetails.submittedDate,
        oldStatus: leadDetails.oldStatus,
        newStatus: leadDetails.newStatus,
        dashboardUrl,
        smtpUser,
      }),
      html: statusUpdateHTML({
        customerName: name,
        serviceType: leadDetails.serviceType,
        submittedDate: leadDetails.submittedDate,
        oldStatus: leadDetails.oldStatus,
        newStatus: leadDetails.newStatus,
        dashboardUrl,
        smtpUser,
      }),
    });
  } catch (err) {
    logger.error('Failed to send status update email:', err);
  }
}

export async function sendRepairTrackingUpdateEmail(
  to: string,
  name: string,
  leadDetails: {
    serviceType: string;
    currentStep: string;
    estimatedCompletion: string;
    notes: string;
  }
) {
  try {
    const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/customer/dashboard`;
    const smtpUser = process.env.SMTP_USER || '';

    await transporter.sendMail({
      to,
      from: `"Bellevue Collision Services" <${process.env.SMTP_USER}>`,
      subject: `🔧 Repair Progress Update - ${leadDetails.serviceType}`,
      text: repairTrackingUpdateText({
        customerName: name,
        serviceType: leadDetails.serviceType,
        currentStep: leadDetails.currentStep,
        estimatedCompletion: leadDetails.estimatedCompletion,
        notes: leadDetails.notes,
        dashboardUrl,
        smtpUser,
      }),
      html: repairTrackingUpdateHTML({
        customerName: name,
        serviceType: leadDetails.serviceType,
        currentStep: leadDetails.currentStep,
        estimatedCompletion: leadDetails.estimatedCompletion,
        notes: leadDetails.notes,
        dashboardUrl,
        smtpUser,
      }),
    });
  } catch (err) {
    logger.error('Failed to send repair tracking update email:', err);
  }
}

// ============================================================================
// APPOINTMENT EMAILS
// ============================================================================

export async function sendAppointmentConfirmation(appointment: any) {
  try {
    const customer = appointment.customerId;
    const assignedTech = appointment.assignedTo;

    const startTime = new Date(appointment.startTime);
    const dateStr = startTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const timeStr = startTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const appointmentTypeLabels: Record<string, string> = {
      drop_off: 'Vehicle Drop-Off',
      pickup: 'Vehicle Pickup',
      consultation: 'Consultation',
      estimate: 'Estimate',
      inspection: 'Vehicle Inspection',
    };

    const typeLabel = appointmentTypeLabels[appointment.appointmentType] || appointment.appointmentType;
    const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/customer/dashboard`;

    const vehicleInfo = appointment.vehicleInfo?.make
      ? `${appointment.vehicleInfo.year || ''} ${appointment.vehicleInfo.make} ${appointment.vehicleInfo.model || ''}`
      : undefined;

    await transporter.sendMail({
      to: customer.email,
      from: `"Bellevue Collision Services" <${process.env.SMTP_USER}>`,
      subject: `📅 Appointment Confirmed - ${dateStr} at ${timeStr}`,
      text: appointmentConfirmationText({
        customerName: customer.name,
        dateStr,
        timeStr,
        typeLabel,
        techName: assignedTech?.name,
        vehicleInfo,
        description: appointment.description,
        dashboardUrl,
      }),
      html: appointmentConfirmationHTML({
        customerName: customer.name,
        dateStr,
        timeStr,
        typeLabel,
        techName: assignedTech?.name,
        vehicleInfo,
        description: appointment.description,
        dashboardUrl,
      }),
    });
  } catch (err) {
    logger.error('Failed to send appointment confirmation email:', err);
    throw err;
  }
}

export async function sendAppointmentReminder(appointment: any) {
  try {
    const customer = appointment.customerId;
    if (!customer || !customer.email) {
      throw new Error('Customer email not found');
    }

    const startTime = new Date(appointment.startTime);
    const appointmentDate = startTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const appointmentTime = startTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const appointmentType = appointment.appointmentType.replace(/_/g, ' ').toUpperCase();
    const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/customer/dashboard`;

    const vehicleInfo = appointment.vehicleInfo
      ? `${appointment.vehicleInfo.year} ${appointment.vehicleInfo.make} ${appointment.vehicleInfo.model}`
      : undefined;

    await transporter.sendMail({
      to: customer.email,
      from: `"Bellevue Collision Services" <${process.env.SMTP_USER}>`,
      subject: `⏰ Reminder: Your Appointment Tomorrow at ${appointmentTime}`,
      text: appointmentReminderText({
        customerName: customer.name,
        appointmentDate,
        appointmentTime,
        appointmentType,
        duration: appointment.duration,
        techName: appointment.assignedTo?.name,
        vehicleInfo,
      }),
      html: appointmentReminderHTML({
        customerName: customer.name,
        appointmentDate,
        appointmentTime,
        appointmentType,
        duration: appointment.duration,
        techName: appointment.assignedTo?.name,
        vehicleInfo,
        dashboardUrl,
      }),
    });

    logger.info(`Sent reminder email to ${customer.email} for appointment ${appointment._id}`);
  } catch (err) {
    logger.error('Failed to send appointment reminder email:', err);
    throw err;
  }
}

export async function sendAppointmentFollowUp(appointment: any) {
  try {
    const customer = appointment.customerId;
    if (!customer || !customer.email) {
      throw new Error('Customer email not found');
    }

    const completionDate = new Date(appointment.actualCompletionDate || appointment.endTime);
    const formattedDate = completionDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const appointmentType = appointment.appointmentType.replace(/_/g, ' ').toUpperCase();
    const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/customer/dashboard`;

    const vehicleInfo = appointment.vehicleInfo
      ? `${appointment.vehicleInfo.year} ${appointment.vehicleInfo.make} ${appointment.vehicleInfo.model}`
      : undefined;

    await transporter.sendMail({
      to: customer.email,
      from: `"Bellevue Collision Services" <${process.env.SMTP_USER}>`,
      subject: 'Thank You - How Was Your Experience?',
      text: appointmentFollowUpText({
        customerName: customer.name,
        formattedDate,
        appointmentType,
        techName: appointment.assignedTo?.name,
        vehicleInfo,
      }),
      html: appointmentFollowUpHTML({
        customerName: customer.name,
        formattedDate,
        appointmentType,
        techName: appointment.assignedTo?.name,
        vehicleInfo,
        dashboardUrl,
      }),
    });

    logger.info(`Sent follow-up email to ${customer.email} for appointment ${appointment._id}`);
  } catch (err) {
    logger.error('Failed to send appointment follow-up email:', err);
    throw err;
  }
}

// Export transporter for direct access if needed
export { transporter } from './transporter';
