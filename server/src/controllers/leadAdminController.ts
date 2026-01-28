import { Request, Response } from "express";
import Lead from "../models/Lead";
import User from "../models/User";
import { AppError } from "../utils/AppError";
import { sendSignupInviteEmail, sendStatusUpdateEmail, sendRepairTrackingUpdateEmail } from "../utils/email";
import { ENV } from "../config/env";
import { createNotification } from "../utils/createNotification";

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
 * Get paginated, non-archived leads with search and filtering
 */
export const getAllLeads = async (req: Request, res: Response) => {
  // 1️⃣ Read pagination values from query string
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // 2️⃣ Build query with filters
  const query: any = { archived: false };

  // Search across multiple fields
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search as string, "i");
    query.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
      { message: searchRegex },
    ];
  }

  // Filter by status
  if (req.query.status && req.query.status !== "all") {
    query.status = req.query.status;
  }

  // Filter by repair stage
  if (req.query.repairStage && req.query.repairStage !== "all") {
    query.repairStage = req.query.repairStage;
  }

  // Filter by date range
  if (req.query.startDate || req.query.endDate) {
    query.createdAt = {};
    if (req.query.startDate) {
      query.createdAt.$gte = new Date(req.query.startDate as string);
    }
    if (req.query.endDate) {
      const endDate = new Date(req.query.endDate as string);
      endDate.setHours(23, 59, 59, 999); // End of day
      query.createdAt.$lte = endDate;
    }
  }

  // 3️⃣ Determine sort order
  let sortOption: any = { createdAt: -1 }; // Default: newest first
  if (req.query.sortBy) {
    const sortBy = req.query.sortBy as string;
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    sortOption = { [sortBy]: sortOrder };
  }

  // 4️⃣ Fetch paginated leads + total count
  const [leads, total] = await Promise.all([
    Lead.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),
    Lead.countDocuments(query),
  ]);

  // 5️⃣ Convert photo filenames into public URLs
  const formattedLeads = leads.map((lead) => ({
    ...lead,
    photos: lead.photos?.map(
      (photo) => `${process.env.BASE_URL}/uploads/${photo}`
    ) || [],
  }));

  // 6️⃣ Send frontend-ready response
  res.json({
    data: formattedLeads,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
    },
    filters: {
      search: req.query.search || "",
      status: req.query.status || "all",
      repairStage: req.query.repairStage || "all",
      startDate: req.query.startDate || "",
      endDate: req.query.endDate || "",
      sortBy: req.query.sortBy || "createdAt",
      sortOrder: req.query.sortOrder || "desc",
    },
  });
};

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

  const oldStatus = lead.status || 'new';
  lead.status = status;
  await lead.save();

  // Send email notification to customer if status changed
  if (oldStatus !== status) {
    const formattedOldStatus = oldStatus.charAt(0).toUpperCase() + oldStatus.slice(1);
    const formattedNewStatus = status.charAt(0).toUpperCase() + status.slice(1);
    const submittedDate = lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : 'Unknown';

    // Send email asynchronously (don't wait for it)
    sendStatusUpdateEmail(
      lead.email,
      lead.name,
      {
        serviceType: lead.damageDescription || lead.message.substring(0, 50) + '...',
        submittedDate,
        oldStatus: formattedOldStatus,
        newStatus: formattedNewStatus
      }
    ).catch(err => console.error('Failed to send status update email:', err));

    // Send in-app notification if customer has an account
    if (lead.userId) {
      try {
        const statusMessages: Record<string, string> = {
          contacted: "We've reviewed your inquiry and will be in touch soon",
          closed: "Your inquiry has been completed",
        };

        if (statusMessages[status]) {
          await createNotification({
            userId: lead.userId,
            type: "lead",
            title: "Lead Status Updated",
            message: statusMessages[status],
            relatedLead: lead._id,
            actionUrl: "/customer/dashboard",
          });
        }
      } catch (notifError) {
        console.error("Failed to send lead notification:", notifError);
      }
    }
  }

  res.json({ message: "Lead status updated", lead });
};

/**
 * Update repair tracking information
 */
export const updateRepairTracking = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    repairStage,
    partsStatus,
    estimatedCompletionDate,
    estimateAmount,
    finalAmount,
    insuranceClaimNumber,
    vehicleInfo,
  } = req.body;

  const lead = await Lead.findById(id);

  if (!lead) {
    throw new AppError("Lead not found", 404);
  }

  const hasSignificantChange = repairStage || estimatedCompletionDate;

  // Update fields if provided
  if (repairStage) lead.repairStage = repairStage;
  if (partsStatus) lead.partsStatus = partsStatus;
  if (estimatedCompletionDate)
    lead.estimatedCompletionDate = new Date(estimatedCompletionDate);
  if (estimateAmount !== undefined) lead.estimateAmount = estimateAmount;
  if (finalAmount !== undefined) lead.finalAmount = finalAmount;
  if (insuranceClaimNumber) lead.insuranceClaimNumber = insuranceClaimNumber;
  if (vehicleInfo) lead.vehicleInfo = { ...lead.vehicleInfo, ...vehicleInfo };

  // If repair stage is completed, set actual completion date
  if (repairStage === "completed" && !lead.actualCompletionDate) {
    lead.actualCompletionDate = new Date();
  }

  await lead.save();

  // Send email notification if there's a significant change
  if (hasSignificantChange) {
    const formattedRepairStage = lead.repairStage
      ? lead.repairStage.split('_').map(word =>
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')
      : 'Pending';

    const formattedCompletionDate = lead.estimatedCompletionDate
      ? new Date(lead.estimatedCompletionDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : 'To be determined';

    // Get latest progress note if available
    const latestNote = lead.progressNotes && lead.progressNotes.length > 0
      ? lead.progressNotes[lead.progressNotes.length - 1]?.note || 'Our team is working on your vehicle.'
      : 'Our team is working on your vehicle.';

    // Send email asynchronously
    sendRepairTrackingUpdateEmail(
      lead.email,
      lead.name,
      {
        serviceType: lead.damageDescription || lead.message.substring(0, 50) + '...',
        currentStep: formattedRepairStage,
        estimatedCompletion: formattedCompletionDate,
        notes: latestNote
      }
    ).catch(err => console.error('Failed to send repair tracking update email:', err));
  }

  res.json({ message: "Repair tracking updated successfully", lead });
};

/**
 * Add progress note to a lead
 */
export const addProgressNote = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { note, createdBy } = req.body;

  if (!note || !createdBy) {
    throw new AppError("Note and createdBy are required", 400);
  }

  const lead = await Lead.findById(id);

  if (!lead) {
    throw new AppError("Lead not found", 404);
  }

  if (!lead.progressNotes) {
    lead.progressNotes = [];
  }

  lead.progressNotes.push({
    note,
    createdBy,
    createdAt: new Date(),
  });

  await lead.save();

  res.json({ message: "Progress note added successfully", lead });
};

/**
 * Assign customer to a lead
 */
export const assignCustomer = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.body;

  const lead = await Lead.findById(id);

  if (!lead) {
    throw new AppError("Lead not found", 404);
  }

  lead.userId = userId;
  await lead.save();

  res.json({ message: "Customer assigned successfully" });
};

/**
 * Resend signup invitation email for a lead
 */
export const resendSignupEmail = async (req: Request, res: Response) => {
  const { id } = req.params;

  const lead = await Lead.findById(id);

  if (!lead) {
    throw new AppError("Lead not found", 404);
  }

  // Find the user associated with this lead
  const user = await User.findOne({ email: lead.email });

  if (!user) {
    throw new AppError("No user account found for this lead", 404);
  }

  if (!user.needsPasswordSetup) {
    throw new AppError("User has already completed signup", 400);
  }

  if (!user.signupToken) {
    throw new AppError("No signup token found for this user", 400);
  }

  // Resend the signup email
  const frontendUrl = ENV.FRONTEND_URL || "http://localhost:5173";
  await sendSignupInviteEmail(user.email, user.name, user.signupToken, frontendUrl);

  res.json({ message: "Signup email resent successfully" });
};
