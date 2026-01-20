import { Request, Response } from "express";
import Lead from "../models/Lead";
import { AppError } from "../utils/AppError";

/**
 * Archive (soft-delete) a lead
 */
export const archiveLead = async (req: Request, res: Response) => {
  const { id } = req.params;

  const lead = await Lead.findById(id);

  if (!lead) {
    throw new AppError("Lead not found", 404);
  }

  lead.archived = true;
  lead.archivedAt = new Date();

  await lead.save();

  res.json({ message: "Lead archived successfully" });
};

/**
 * Get paginated, non-archived leads
 */
export const getAllLeads = async (req: Request, res: Response) => {
  // 1️⃣ Read pagination values from query string
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // 2️⃣ Fetch paginated leads + total count
  const [leads, total] = await Promise.all([
    Lead.find({ archived: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Lead.countDocuments({ archived: false }),
  ]);

  // 3️⃣ Convert photo filenames into public URLs
  const formattedLeads = leads.map((lead) => ({
    ...lead,
    photos: lead.photos.map(
      (photo) => `${process.env.BASE_URL}/uploads/${photo}`
    ),
  }));

export const updateLeadStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validate input
  if (!["new", "contacted", "closed"].includes(status)) {
    throw new AppError("Invalid status value", 400);
  }

  const lead = await Lead.findById(id);

  if (!lead) {
    throw new AppError("Lead not found", 404);
  }

  lead.status = status;
  await lead.save();

  res.json({ message: "Lead status updated" });
};

  // 4️⃣ Send frontend-ready response
  res.json({
    data: formattedLeads,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
    },
  });
};
