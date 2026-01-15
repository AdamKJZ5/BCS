import { Request, Response } from "express";
import Lead from "../models/Lead";
import { sendLeadEmailSafe, sendAutoReplySafe } from "../utils/email";
import { validateLead, SPAM_ERROR } from "../validators/leadValidator";

export const createLead = async (req: Request, res: Response) => {
  try {
    const error = validateLead(req.body);

    if (error) {
      if (error === SPAM_ERROR) {
        return res.status(200).json({ message: "Lead submitted" });
      }
      return res.status(400).json({ message: error });
    }

    const { name, email, phone, message } = req.body;

    const forwarded = req.headers["x-forwarded-for"];
    const ipAddress =
      typeof forwarded === "string"
        ? forwarded.split(",")[0]
        : req.socket.remoteAddress;

    const userAgent = req.headers["user-agent"];
  
    const photos = req.files ? (req.files as Express.Multer.File[]).map(file => file.filename) : [];
    await Lead.create({
      name,
      email,
      phone,
      message,
      damageDescription,
      photos,
      ipAddress,
      userAgent
    });

    // Fire-and-forget safe emails
    void sendLeadEmailSafe({ name, email, phone, message, damageDescription, photos });
    void sendAutoReplySafe(email, name);

    return res.status(201).json({ message: "Lead submitted successfully" });

  } catch (err) {
    console.error("Create lead error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
