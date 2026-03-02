import twilio from "twilio";
import logger from "../utils/logger";

// Initialize Twilio client
let twilioClient: any = null;

try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }
} catch (error) {
  logger.warn("Twilio not configured - SMS notifications disabled");
}

/**
 * Send SMS reminder for appointment (24 hours before)
 */
export async function sendAppointmentReminderSMS(appointment: any) {
  // Skip if Twilio not configured
  if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
    logger.info("SMS notifications not configured, skipping");
    return;
  }

  try {
    const customer = appointment.customerId;
    if (!customer || !customer.phone) {
      logger.info("Customer phone not found, skipping SMS");
      return;
    }

    // Format phone number (remove non-digits and add +1 if needed)
    let phoneNumber = customer.phone.replace(/\D/g, "");
    if (phoneNumber.length === 10) {
      phoneNumber = "+1" + phoneNumber;
    } else if (!phoneNumber.startsWith("+")) {
      phoneNumber = "+" + phoneNumber;
    }

    const startTime = new Date(appointment.startTime);
    const appointmentDate = startTime.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    const appointmentTime = startTime.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const appointmentTypeLabel = appointment.appointmentType
      .replace(/_/g, " ")
      .toUpperCase();

    const message = `⏰ Reminder: Your ${appointmentTypeLabel} appointment at Bellevue Collision is TOMORROW at ${appointmentTime} (${appointmentDate}).

Location: 13434 SE 27th Pl, Bellevue WA 98005

Need to reschedule? Call (425) 373-0308 or visit your dashboard.

- Bellevue Collision Services`;

    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    logger.info(`SMS reminder sent to ${phoneNumber} for appointment ${appointment._id}`);
  } catch (error) {
    logger.error("Failed to send SMS reminder:", error);
    // Don't throw - SMS failure shouldn't break the app
  }
}

/**
 * Send SMS when appointment status changes
 */
export async function sendAppointmentStatusSMS(appointment: any, newStatus: string) {
  if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
    return;
  }

  try {
    const customer = appointment.customerId;
    if (!customer || !customer.phone) {
      return;
    }

    let phoneNumber = customer.phone.replace(/\D/g, "");
    if (phoneNumber.length === 10) {
      phoneNumber = "+1" + phoneNumber;
    } else if (!phoneNumber.startsWith("+")) {
      phoneNumber = "+" + phoneNumber;
    }

    const statusMessages: Record<string, string> = {
      confirmed:
        "✅ Your appointment at Bellevue Collision has been CONFIRMED! We'll see you soon.",
      in_progress:
        "🔧 We've started working on your vehicle! We'll notify you when it's ready.",
      completed:
        "🎉 Great news! Your vehicle is ready for pickup. Call us at (425) 373-0308 to schedule.",
      cancelled:
        "❌ Your appointment has been cancelled. Contact us at (425) 373-0308 if you have questions.",
    };

    const message = statusMessages[newStatus];
    if (!message) {
      return; // Only send for specific status changes
    }

    await twilioClient.messages.create({
      body: `${message}\n\n- Bellevue Collision Services`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    logger.info(`SMS status update sent to ${phoneNumber} (${newStatus})`);
  } catch (error) {
    logger.error("Failed to send status SMS:", error);
  }
}

/**
 * Send SMS when new invoice is created
 */
export async function sendInvoiceCreatedSMS(invoice: any) {
  if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
    return;
  }

  try {
    const customer = invoice.customerId;
    if (!customer || !customer.phone) {
      return;
    }

    let phoneNumber = customer.phone.replace(/\D/g, "");
    if (phoneNumber.length === 10) {
      phoneNumber = "+1" + phoneNumber;
    } else if (!phoneNumber.startsWith("+")) {
      phoneNumber = "+" + phoneNumber;
    }

    const message = `💰 Your invoice ${invoice.invoiceNumber} is ready! Total: $${invoice.total.toFixed(
      2
    )}

View & pay online: ${process.env.FRONTEND_URL || "http://localhost:5173"}/customer/dashboard

Due: ${new Date(invoice.dueDate).toLocaleDateString()}

- Bellevue Collision Services`;

    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    logger.info(`Invoice SMS sent to ${phoneNumber}`);
  } catch (error) {
    logger.error("Failed to send invoice SMS:", error);
  }
}

/**
 * Send test SMS (for configuration verification)
 */
export async function sendTestSMS(phoneNumber: string) {
  if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
    throw new Error("Twilio not configured");
  }

  let formattedPhone = phoneNumber.replace(/\D/g, "");
  if (formattedPhone.length === 10) {
    formattedPhone = "+1" + formattedPhone;
  } else if (!formattedPhone.startsWith("+")) {
    formattedPhone = "+" + formattedPhone;
  }

  await twilioClient.messages.create({
    body: "✅ Test message from Bellevue Collision Services - SMS notifications are working!",
    from: process.env.TWILIO_PHONE_NUMBER,
    to: formattedPhone,
  });

  return { success: true, message: `Test SMS sent to ${formattedPhone}` };
}
