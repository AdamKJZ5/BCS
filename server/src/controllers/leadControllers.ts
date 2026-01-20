import { Request, Response, NextFunction } from "express";
import Lead from "../models/Lead";
import { sendLeadEmailSafe, sendAutoReplySafe } from "../utils/email";
import { validateLead, SPAM_ERROR, sanitizeInput } from "../validators/leadValidators";
import { AppError } from "../utils/AppError";

export const createLead = async (
  req: Request,
  res: Response,
  next: NextFunction
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

  try {
    await Lead.create({
      name: sanitizedName,
      email: sanitizedEmail,
      phone: sanitizedPhone,
      message: sanitizedMessage,
      damageDescription: sanitizedDamageDescription,
      photos,
      ipAddress,
      userAgent
    });
  } catch (err) {
    // Database failure = server error
    throw new AppError("Failed to save lead", 500);
  }

  // Fire-and-forget emails
  void sendLeadEmailSafe({
    name: sanitizedName,
    email: sanitizedEmail,
    phone: sanitizedPhone,
    message: sanitizedMessage,
    damageDescription: sanitizedDamageDescription,
    photos
  });

  void sendAutoReplySafe(sanitizedEmail, sanitizedName);

  return res.status(201).json({ message: "Lead submitted successfully" });
};
