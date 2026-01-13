import Lead from "../models/Lead";
import { sendLeadEmail } from "../utils/email";
import { Request, Response } from "express";

export const createLead = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const lead = await Lead.create({ name, email, phone, message });
    await sendLeadEmail({ name, email, phone, message });

    res.status(201).json({ message: "Lead created", lead });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
