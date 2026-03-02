import { Request, Response } from "express";
import Lead from "../models/Lead";
import User from "../models/User";
import Appointment from "../models/Appointment";
import { sendLeadEmailSafe, sendSignupInviteEmail, sendAppointmentConfirmation } from "../utils/email";
import { validateLead, SPAM_ERROR, sanitizeInput } from "../validators/leadValidators";
import { AppError } from "../utils/AppError";
import asyncHandler from "../utils/asyncHandler";
import crypto from "crypto";
import { ENV } from "../config/env";
import logger from "../utils/logger";

export const createLead = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const error = validateLead(req.body);

  // Honeypot: silently accept spam
  if (error === SPAM_ERROR) {
    return res.status(200).json({ message: "Lead submitted" });
  }

  // Validation error
  if (error) {
    throw new AppError(error, 400);
  }

  const { name, email, phone, message, damageDescription } = req.body;

  // Sanitize inputs
  const sanitizedName = sanitizeInput(name);
  const sanitizedEmail = sanitizeInput(email);
  const sanitizedPhone = sanitizeInput(phone);
  const sanitizedMessage = sanitizeInput(message);
  const sanitizedDamageDescription = damageDescription
    ? sanitizeInput(damageDescription)
    : undefined;

  // Metadata
  const forwarded = req.headers["x-forwarded-for"];
  const ipAddress =
    typeof forwarded === "string"
      ? forwarded.split(",")[0]
      : req.socket.remoteAddress;

  const userAgent = req.headers["user-agent"];

  // Uploaded photos
  const photos = req.files
    ? (req.files as Express.Multer.File[]).map(file => file.filename)
    : [];

  // Check if user already exists or create new account
  let user;
  let isNewUser = false;

  try {
    user = await User.findOne({ email: sanitizedEmail });

    if (!user) {
      // Create new user account with temporary password
      const tempPassword = crypto.randomBytes(32).toString("hex");
      const signupToken = crypto.randomBytes(32).toString("hex");
      const signupTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      user = await User.create({
        email: sanitizedEmail,
        password: tempPassword,
        name: sanitizedName,
        phone: sanitizedPhone,
        role: "customer",
        needsPasswordSetup: true,
        signupToken,
        signupTokenExpires,
      });

      isNewUser = true;
    }
  } catch (err) {
    logger.error("Error checking/creating user:", err);
    throw new AppError("Failed to process user account", 500);
  }

  // Create lead linked to user
  let createdLead;
  try {
    createdLead = await Lead.create({
      name: sanitizedName,
      email: sanitizedEmail,
      phone: sanitizedPhone,
      message: sanitizedMessage,
      ...(sanitizedDamageDescription !== undefined && { damageDescription: sanitizedDamageDescription }),
      photos,
      ...(ipAddress !== undefined && { ipAddress }),
      ...(userAgent !== undefined && { userAgent }),
      userId: user._id,
    });
  } catch (err) {
    // Database failure = server error
    throw new AppError("Failed to save lead", 500);
  }

  // Create appointment if requested
  const { wantAppointment, appointmentType, appointmentStartTime } = req.body;

  if (wantAppointment === "true" && appointmentType && appointmentStartTime) {
    try {
      const startTime = new Date(appointmentStartTime);
      const duration = 60; // Default 60 minutes
      const endTime = new Date(startTime.getTime() + duration * 60000);

      const appointment = await Appointment.create({
        customerId: user._id,
        leadId: createdLead._id,
        appointmentType,
        title: `${appointmentType.replace(/_/g, " ")} Appointment`,
        startTime,
        endTime,
        duration,
        status: "scheduled",
        isPrivate: false,
        visibleToCustomer: true,
        reminderSent: false,
        confirmationSent: false,
        createdBy: user._id,
      });

      // Populate and send appointment confirmation email
      const populatedAppointment = await Appointment.findById(appointment._id)
        .populate("customerId", "name email")
        .populate("assignedTo", "name email");

      if (populatedAppointment) {
        try {
          await sendAppointmentConfirmation(populatedAppointment);
          populatedAppointment.confirmationSent = true;
          await populatedAppointment.save();
        } catch (emailError) {
          logger.error("Failed to send appointment confirmation:", emailError);
        }
      }
    } catch (err) {
      logger.error("Failed to create appointment:", err);
      // Don't fail the whole request if appointment creation fails
    }
  }

  // Fire-and-forget emails
  void sendLeadEmailSafe({
    name: sanitizedName,
    email: sanitizedEmail,
    phone: sanitizedPhone,
    message: sanitizedMessage,
    ...(sanitizedDamageDescription !== undefined && { damageDescription: sanitizedDamageDescription }),
    photos
  });

  // Send signup invite email if new user
  if (isNewUser && user.signupToken) {
    const frontendUrl = ENV.FRONTEND_URL || "http://localhost:5173";
    void sendSignupInviteEmail(sanitizedEmail, sanitizedName, user.signupToken, frontendUrl);
  }

  return res.status(201).json({ message: "Lead submitted successfully" });
});
