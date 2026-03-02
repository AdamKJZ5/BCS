import apiClient from '../utils/apiClient';

// ==================== TYPES ====================

export interface Part {
  partName: string;
  partNumber?: string;
  quantity: number;
  cost?: number;
}

export interface LaborDetail {
  description: string;
  hours?: number;
  cost?: number;
}

export interface ServiceRecord {
  _id: string;
  vehicleId: string | {
    _id: string;
    make: string;
    model: string;
    year: number;
    color?: string;
    licensePlate?: string;
    nickname?: string;
  };
  userId: string | {
    _id: string;
    name: string;
    email: string;
  };
  serviceType: "collision_repair" | "maintenance" | "inspection" | "detailing" | "painting" | "parts_replacement" | "other";
  description: string;
  serviceDate: string;
  providedBy: "bellevue_collision" | "other";
  providerName?: string;
  cost?: number;
  laborCost?: number;
  partsCost?: number;
  mileageAtService?: number;
  partsUsed?: Part[];
  laborDetails?: LaborDetail[];
  photos?: string[];
  documents?: string[];
  warrantyExpirationDate?: string;
  nextServiceDue?: string;
  nextServiceMileage?: number;
  leadId?: string | { _id: string; name: string; status: string };
  invoiceId?: string | { _id: string; invoiceNumber: string; totalAmount: number };
  appointmentId?: string | { _id: string; appointmentType: string; startTime: string };
  notes?: string;
  recommendations?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceRecordData {
  vehicleId: string;
  serviceType: string;
  description: string;
  serviceDate: string;
  providedBy: string;
  providerName?: string;
  cost?: number;
  laborCost?: number;
  partsCost?: number;
  mileageAtService?: number;
  partsUsed?: Part[];
  laborDetails?: LaborDetail[];
  warrantyExpirationDate?: string;
  nextServiceDue?: string;
  nextServiceMileage?: number;
  notes?: string;
  recommendations?: string;
}

export interface ServiceStats {
  totalServices: number;
  totalCost: number;
  averageCost: number;
  servicesByType: { [key: string]: number };
  lastService: {
    date: string;
    type: string;
    description: string;
    cost?: number;
  } | null;
  upcomingServices: Array<{
    id: string;
    dueDate: string;
    description: string;
  }>;
}

export interface AdminServiceStats {
  totalServices: number;
  totalRevenue: number;
  bellevueServices: number;
  externalServices: number;
  servicesByType: { [key: string]: number };
  averageServiceCost: number;
}

// ==================== CUSTOMER API ====================

/**
 * Get all service records for authenticated customer
 */
export async function getMyServiceRecords(
  filters?: {
    vehicleId?: string;
    serviceType?: string;
    startDate?: string;
    endDate?: string;
  }
): Promise<ServiceRecord[]> {
  try {
    const queryParams = new URLSearchParams();
    if (filters?.vehicleId) queryParams.append("vehicleId", filters.vehicleId);
    if (filters?.serviceType) queryParams.append("serviceType", filters.serviceType);
    if (filters?.startDate) queryParams.append("startDate", filters.startDate);
    if (filters?.endDate) queryParams.append("endDate", filters.endDate);

    const response = await apiClient.get(`/service-records/my-records?${queryParams.toString()}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch service records");
  }
}

/**
 * Get service records for a specific vehicle
 */
export async function getVehicleServiceRecords(
  vehicleId: string
): Promise<ServiceRecord[]> {
  try {
    const response = await apiClient.get(`/service-records/vehicle/${vehicleId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch vehicle service records");
  }
}

/**
 * Get vehicle service statistics
 */
export async function getVehicleServiceStats(
  vehicleId: string
): Promise<ServiceStats> {
  try {
    const response = await apiClient.get(`/service-records/vehicle/${vehicleId}/stats`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch vehicle statistics");
  }
}

/**
 * Get a single service record
 */
export async function getServiceRecord(
  id: string
): Promise<ServiceRecord> {
  try {
    const response = await apiClient.get(`/service-records/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch service record");
  }
}

/**
 * Create a new service record
 */
export async function createServiceRecord(
  data: CreateServiceRecordData
): Promise<ServiceRecord> {
  try {
    const response = await apiClient.post('/service-records', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to create service record");
  }
}

/**
 * Update a service record
 */
export async function updateServiceRecord(
  id: string,
  data: Partial<CreateServiceRecordData>
): Promise<ServiceRecord> {
  try {
    const response = await apiClient.patch(`/service-records/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to update service record");
  }
}

/**
 * Delete a service record
 */
export async function deleteServiceRecord(
  id: string
): Promise<void> {
  try {
    await apiClient.delete(`/service-records/${id}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to delete service record");
  }
}

// ==================== ADMIN API ====================

/**
 * Admin: Get all service records with filtering
 */
export async function adminGetAllServiceRecords(
  filters?: {
    userId?: string;
    vehicleId?: string;
    serviceType?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: number;
    limit?: number;
  }
): Promise<{
  records: ServiceRecord[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}> {
  try {
    const queryParams = new URLSearchParams();
    if (filters?.userId) queryParams.append("userId", filters.userId);
    if (filters?.vehicleId) queryParams.append("vehicleId", filters.vehicleId);
    if (filters?.serviceType) queryParams.append("serviceType", filters.serviceType);
    if (filters?.startDate) queryParams.append("startDate", filters.startDate);
    if (filters?.endDate) queryParams.append("endDate", filters.endDate);
    if (filters?.search) queryParams.append("search", filters.search);
    if (filters?.page) queryParams.append("page", filters.page.toString());
    if (filters?.limit) queryParams.append("limit", filters.limit.toString());

    const response = await apiClient.get(`/service-records/admin/all?${queryParams.toString()}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch service records");
  }
}

/**
 * Admin: Get service statistics
 */
export async function adminGetServiceStats(
  filters?: {
    startDate?: string;
    endDate?: string;
  }
): Promise<AdminServiceStats> {
  try {
    const queryParams = new URLSearchParams();
    if (filters?.startDate) queryParams.append("startDate", filters.startDate);
    if (filters?.endDate) queryParams.append("endDate", filters.endDate);

    const response = await apiClient.get(`/service-records/admin/stats?${queryParams.toString()}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch statistics");
  }
}

/**
 * Admin: Create service record for any vehicle
 */
export async function adminCreateServiceRecord(
  data: CreateServiceRecordData & {
    userId?: string;
    leadId?: string;
    invoiceId?: string;
    appointmentId?: string;
  }
): Promise<ServiceRecord> {
  try {
    const response = await apiClient.post('/service-records/admin', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to create service record");
  }
}

/**
 * Admin: Update any service record
 */
export async function adminUpdateServiceRecord(
  id: string,
  data: Partial<CreateServiceRecordData>
): Promise<ServiceRecord> {
  try {
    const response = await apiClient.patch(`/service-records/admin/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to update service record");
  }
}

/**
 * Admin: Delete any service record
 */
export async function adminDeleteServiceRecord(
  id: string
): Promise<void> {
  try {
    await apiClient.delete(`/service-records/admin/${id}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to delete service record");
  }
}
