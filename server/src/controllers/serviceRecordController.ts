import { Request, Response, NextFunction } from "express";
import ServiceRecord from "../models/ServiceRecord";
import Vehicle from "../models/Vehicle";
import { AppError } from "../utils/AppError";

/**
 * Get all service records for a specific vehicle
 */
export const getVehicleServiceRecords = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.id;
    const vehicleId = req.params.vehicleId;

    if (!vehicleId) {
      throw new AppError("Vehicle ID is required", 400);
    }

    // Verify vehicle ownership
    const vehicle = await Vehicle.findOne({ _id: vehicleId, userId });
    if (!vehicle) {
      throw new AppError("Vehicle not found", 404);
    }

    const records = await ServiceRecord.find({ vehicleId: vehicleId })
      .populate("leadId", "name status")
      .populate("invoiceId", "invoiceNumber totalAmount")
      .populate("appointmentId", "appointmentType startTime")
      .sort({ serviceDate: -1 });

    res.json(records);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all service records for the authenticated customer (across all vehicles)
 */
export const getMyServiceRecords = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.id;
    const { vehicleId, serviceType, startDate, endDate } = req.query;

    const query: any = { userId };

    if (vehicleId) {
      query.vehicleId = vehicleId;
    }

    if (serviceType) {
      query.serviceType = serviceType;
    }

    if (startDate || endDate) {
      query.serviceDate = {};
      if (startDate) {
        query.serviceDate.$gte = new Date(startDate as string);
      }
      if (endDate) {
        query.serviceDate.$lte = new Date(endDate as string);
      }
    }

    const records = await ServiceRecord.find(query)
      .populate("vehicleId", "make model year color nickname")
      .populate("leadId", "name status")
      .populate("invoiceId", "invoiceNumber totalAmount")
      .sort({ serviceDate: -1 });

    res.json(records);
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single service record by ID
 */
export const getServiceRecord = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;

    const record = await ServiceRecord.findOne({ _id: id, userId })
      .populate("vehicleId", "make model year color vin licensePlate nickname")
      .populate("leadId", "name status")
      .populate("invoiceId", "invoiceNumber totalAmount status")
      .populate("appointmentId", "appointmentType startTime status");

    if (!record) {
      throw new AppError("Service record not found", 404);
    }

    res.json(record);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new service record (customer)
 */
export const createServiceRecord = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.id;
    const {
      vehicleId,
      serviceType,
      description,
      serviceDate,
      providedBy,
      providerName,
      cost,
      laborCost,
      partsCost,
      mileageAtService,
      partsUsed,
      laborDetails,
      warrantyExpirationDate,
      nextServiceDue,
      nextServiceMileage,
      notes,
      recommendations,
    } = req.body;

    // Verify vehicle ownership
    const vehicle = await Vehicle.findOne({ _id: vehicleId, userId });
    if (!vehicle) {
      throw new AppError("Vehicle not found", 404);
    }

    // Validate required fields
    if (!serviceType || !description || !serviceDate || !providedBy) {
      throw new AppError("Service type, description, date, and provider are required", 400);
    }

    const recordData: any = {
      vehicleId,
      userId,
      serviceType,
      description,
      serviceDate: new Date(serviceDate),
      providedBy,
    };

    if (providerName) recordData.providerName = providerName;
    if (cost) recordData.cost = cost;
    if (laborCost) recordData.laborCost = laborCost;
    if (partsCost) recordData.partsCost = partsCost;
    if (mileageAtService) recordData.mileageAtService = mileageAtService;
    if (partsUsed) recordData.partsUsed = partsUsed;
    if (laborDetails) recordData.laborDetails = laborDetails;
    if (warrantyExpirationDate) recordData.warrantyExpirationDate = new Date(warrantyExpirationDate);
    if (nextServiceDue) recordData.nextServiceDue = new Date(nextServiceDue);
    if (nextServiceMileage) recordData.nextServiceMileage = nextServiceMileage;
    if (notes) recordData.notes = notes;
    if (recommendations) recordData.recommendations = recommendations;

    const record = await ServiceRecord.create(recordData);

    // Update vehicle's lastServiceDate and mileage
    if (mileageAtService && (!vehicle.mileage || mileageAtService > vehicle.mileage)) {
      vehicle.mileage = mileageAtService;
    }
    vehicle.lastServiceDate = new Date(serviceDate);
    await vehicle.save();

    const populatedRecord = await ServiceRecord.findById(record._id)
      .populate("vehicleId", "make model year color nickname")
      .populate("leadId", "name status")
      .populate("invoiceId", "invoiceNumber totalAmount");

    res.status(201).json(populatedRecord);
  } catch (error) {
    next(error);
  }
};

/**
 * Update a service record
 */
export const updateServiceRecord = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;
    const updates = req.body;

    const record = await ServiceRecord.findOne({ _id: id, userId });

    if (!record) {
      throw new AppError("Service record not found", 404);
    }

    // Update fields
    Object.assign(record, updates);
    await record.save();

    // Update vehicle's mileage if needed
    if (updates.mileageAtService) {
      const vehicle = await Vehicle.findById(record.vehicleId);
      if (vehicle && (!vehicle.mileage || updates.mileageAtService > vehicle.mileage)) {
        vehicle.mileage = updates.mileageAtService;
        await vehicle.save();
      }
    }

    const populatedRecord = await ServiceRecord.findById(record._id)
      .populate("vehicleId", "make model year color nickname")
      .populate("leadId", "name status")
      .populate("invoiceId", "invoiceNumber totalAmount");

    res.json(populatedRecord);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a service record
 */
export const deleteServiceRecord = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;

    const record = await ServiceRecord.findOne({ _id: id, userId });

    if (!record) {
      throw new AppError("Service record not found", 404);
    }

    await record.deleteOne();

    res.json({ success: true, message: "Service record deleted" });
  } catch (error) {
    next(error);
  }
};

/**
 * Get service history statistics for a vehicle
 */
export const getVehicleServiceStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.id;
    const vehicleId = req.params.vehicleId;

    if (!vehicleId) {
      throw new AppError("Vehicle ID is required", 400);
    }

    // Verify vehicle ownership
    const vehicle = await Vehicle.findOne({ _id: vehicleId, userId });
    if (!vehicle) {
      throw new AppError("Vehicle not found", 404);
    }

    const records = await ServiceRecord.find({ vehicleId: vehicleId });

    // Calculate statistics
    const totalServices = records.length;
    const totalCost = records.reduce((sum, r) => sum + (r.cost || 0), 0);
    const averageCost = totalServices > 0 ? totalCost / totalServices : 0;

    const servicesByType = records.reduce((acc: any, r) => {
      acc[r.serviceType] = (acc[r.serviceType] || 0) + 1;
      return acc;
    }, {});

    const lastService = records.sort((a, b) =>
      new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime()
    )[0];

    const upcomingServices = records.filter(r =>
      r.nextServiceDue && new Date(r.nextServiceDue) > new Date()
    ).sort((a, b) =>
      new Date(a.nextServiceDue!).getTime() - new Date(b.nextServiceDue!).getTime()
    );

    res.json({
      totalServices,
      totalCost,
      averageCost,
      servicesByType,
      lastService: lastService ? {
        date: lastService.serviceDate,
        type: lastService.serviceType,
        description: lastService.description,
        cost: lastService.cost,
      } : null,
      upcomingServices: upcomingServices.map(s => ({
        id: s._id,
        dueDate: s.nextServiceDue,
        description: s.recommendations || s.description,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// ==================== ADMIN ENDPOINTS ====================

/**
 * Admin: Get all service records with filtering
 */
export const adminGetAllServiceRecords = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, vehicleId, serviceType, startDate, endDate, search, page = "1", limit = "50" } = req.query;

    const query: any = {};

    if (userId) query.userId = userId;
    if (vehicleId) query.vehicleId = vehicleId;
    if (serviceType) query.serviceType = serviceType;

    if (startDate || endDate) {
      query.serviceDate = {};
      if (startDate) query.serviceDate.$gte = new Date(startDate as string);
      if (endDate) query.serviceDate.$lte = new Date(endDate as string);
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    let records;
    let total;

    if (search) {
      // Fetch all with populated data for search
      const allRecords = await ServiceRecord.find(query)
        .populate("userId", "name email")
        .populate("vehicleId", "make model year licensePlate")
        .lean();

      const searchRegex = new RegExp(search as string, "i");
      const filtered = allRecords.filter((record: any) => {
        return (
          searchRegex.test(record.description) ||
          searchRegex.test(record.notes || "") ||
          searchRegex.test(record.userId?.name || "") ||
          searchRegex.test(record.userId?.email || "") ||
          searchRegex.test(`${record.vehicleId?.year} ${record.vehicleId?.make} ${record.vehicleId?.model}`)
        );
      });

      total = filtered.length;
      records = filtered.slice(skip, skip + limitNum);
    } else {
      records = await ServiceRecord.find(query)
        .populate("userId", "name email")
        .populate("vehicleId", "make model year color licensePlate nickname")
        .populate("leadId", "name status")
        .populate("invoiceId", "invoiceNumber totalAmount")
        .sort({ serviceDate: -1 })
        .skip(skip)
        .limit(limitNum);

      total = await ServiceRecord.countDocuments(query);
    }

    res.json({
      records,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Create service record for any vehicle
 */
export const adminCreateServiceRecord = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      vehicleId,
      userId,
      serviceType,
      description,
      serviceDate,
      providedBy,
      providerName,
      cost,
      laborCost,
      partsCost,
      mileageAtService,
      partsUsed,
      laborDetails,
      warrantyExpirationDate,
      nextServiceDue,
      nextServiceMileage,
      leadId,
      invoiceId,
      appointmentId,
      notes,
      recommendations,
    } = req.body;

    // Validate vehicle exists
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      throw new AppError("Vehicle not found", 404);
    }

    const recordData: any = {
      vehicleId,
      userId: userId || vehicle.userId,
      serviceType,
      description,
      serviceDate: new Date(serviceDate),
      providedBy,
    };

    if (providerName) recordData.providerName = providerName;
    if (cost) recordData.cost = cost;
    if (laborCost) recordData.laborCost = laborCost;
    if (partsCost) recordData.partsCost = partsCost;
    if (mileageAtService) recordData.mileageAtService = mileageAtService;
    if (partsUsed) recordData.partsUsed = partsUsed;
    if (laborDetails) recordData.laborDetails = laborDetails;
    if (warrantyExpirationDate) recordData.warrantyExpirationDate = new Date(warrantyExpirationDate);
    if (nextServiceDue) recordData.nextServiceDue = new Date(nextServiceDue);
    if (nextServiceMileage) recordData.nextServiceMileage = nextServiceMileage;
    if (leadId) recordData.leadId = leadId;
    if (invoiceId) recordData.invoiceId = invoiceId;
    if (appointmentId) recordData.appointmentId = appointmentId;
    if (notes) recordData.notes = notes;
    if (recommendations) recordData.recommendations = recommendations;

    const record = await ServiceRecord.create(recordData);

    // Update vehicle
    if (mileageAtService && (!vehicle.mileage || mileageAtService > vehicle.mileage)) {
      vehicle.mileage = mileageAtService;
    }
    vehicle.lastServiceDate = new Date(serviceDate);
    await vehicle.save();

    const populatedRecord = await ServiceRecord.findById(record._id)
      .populate("userId", "name email")
      .populate("vehicleId", "make model year color licensePlate nickname")
      .populate("leadId", "name status")
      .populate("invoiceId", "invoiceNumber totalAmount")
      .populate("appointmentId", "appointmentType startTime");

    res.status(201).json(populatedRecord);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Update any service record
 */
export const adminUpdateServiceRecord = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const record = await ServiceRecord.findById(id);

    if (!record) {
      throw new AppError("Service record not found", 404);
    }

    Object.assign(record, updates);
    await record.save();

    const populatedRecord = await ServiceRecord.findById(record._id)
      .populate("userId", "name email")
      .populate("vehicleId", "make model year color licensePlate nickname")
      .populate("leadId", "name status")
      .populate("invoiceId", "invoiceNumber totalAmount");

    res.json(populatedRecord);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Delete any service record
 */
export const adminDeleteServiceRecord = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const record = await ServiceRecord.findById(id);

    if (!record) {
      throw new AppError("Service record not found", 404);
    }

    await record.deleteOne();

    res.json({ success: true, message: "Service record deleted" });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Get service statistics
 */
export const adminGetServiceStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate } = req.query;

    const query: any = {};
    if (startDate || endDate) {
      query.serviceDate = {};
      if (startDate) query.serviceDate.$gte = new Date(startDate as string);
      if (endDate) query.serviceDate.$lte = new Date(endDate as string);
    }

    const records = await ServiceRecord.find(query);

    const totalServices = records.length;
    const totalRevenue = records
      .filter(r => r.providedBy === "bellevue_collision")
      .reduce((sum, r) => sum + (r.cost || 0), 0);

    const servicesByType = records.reduce((acc: any, r) => {
      acc[r.serviceType] = (acc[r.serviceType] || 0) + 1;
      return acc;
    }, {});

    const bellevueServices = records.filter(r => r.providedBy === "bellevue_collision").length;
    const externalServices = records.filter(r => r.providedBy === "other").length;

    res.json({
      totalServices,
      totalRevenue,
      bellevueServices,
      externalServices,
      servicesByType,
      averageServiceCost: totalServices > 0 ? totalRevenue / bellevueServices : 0,
    });
  } catch (error) {
    next(error);
  }
};
