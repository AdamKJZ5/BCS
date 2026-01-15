import { Request, Response } from "express";
import Lead from "../models/Lead";
import { sendLeadEmailSafe, sendAutoReplySafe } from "../utils/email";
import { validateLead, SPAM_ERROR, sanitizeInput } from "../validators/leadValidators";

export const createLead = async (req: Request, res: Response) => {
  try {
    const error = validateLead(req.body);

    if (error) {
      if (error === SPAM_ERROR) {
        return res.status(200).json({ message: "Lead submitted" });
      }
      return res.status(400).json({ message: error });
    }

    const { name, email, phone, message, damageDescription } = req.body;

    // Sanitize all text inputs to prevent XSS
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPhone = sanitizeInput(phone);
    const sanitizedMessage = sanitizeInput(message);
    const sanitizedDamageDescription = damageDescription ? sanitizeInput(damageDescription) : undefined;

    const forwarded = req.headers["x-forwarded-for"];
    const ipAddress =
      typeof forwarded === "string"
        ? forwarded.split(",")[0]
        : req.socket.remoteAddress;

    const userAgent = req.headers["user-agent"];

    const photos = req.files ? (req.files as Express.Multer.File[]).map(file => file.filename) : [];
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

    // Fire-and-forget safe emails
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

  } catch (err) {
    console.error("Create lead error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
