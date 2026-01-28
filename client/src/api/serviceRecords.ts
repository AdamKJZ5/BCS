const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

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
  token: string,
  filters?: {
    vehicleId?: string;
    serviceType?: string;
    startDate?: string;
    endDate?: string;
  }
): Promise<ServiceRecord[]> {
  const queryParams = new URLSearchParams();
  if (filters?.vehicleId) queryParams.append("vehicleId", filters.vehicleId);
  if (filters?.serviceType) queryParams.append("serviceType", filters.serviceType);
  if (filters?.startDate) queryParams.append("startDate", filters.startDate);
  if (filters?.endDate) queryParams.append("endDate", filters.endDate);

  const url = `${API_BASE_URL}/api/service-records/my-records?${queryParams.toString()}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch service records");
  }

  return response.json();
}

/**
 * Get service records for a specific vehicle
 */
export async function getVehicleServiceRecords(
  token: string,
  vehicleId: string
): Promise<ServiceRecord[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/service-records/vehicle/${vehicleId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch vehicle service records");
  }

  return response.json();
}

/**
 * Get vehicle service statistics
 */
export async function getVehicleServiceStats(
  token: string,
  vehicleId: string
): Promise<ServiceStats> {
  const response = await fetch(
    `${API_BASE_URL}/api/service-records/vehicle/${vehicleId}/stats`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch vehicle statistics");
  }

  return response.json();
}

/**
 * Get a single service record
 */
export async function getServiceRecord(
  token: string,
  id: string
): Promise<ServiceRecord> {
  const response = await fetch(`${API_BASE_URL}/api/service-records/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch service record");
  }

  return response.json();
}

/**
 * Create a new service record
 */
export async function createServiceRecord(
  token: string,
  data: CreateServiceRecordData
): Promise<ServiceRecord> {
  const response = await fetch(`${API_BASE_URL}/api/service-records`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create service record");
  }

  return response.json();
}

/**
 * Update a service record
 */
export async function updateServiceRecord(
  token: string,
  id: string,
  data: Partial<CreateServiceRecordData>
): Promise<ServiceRecord> {
  const response = await fetch(`${API_BASE_URL}/api/service-records/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update service record");
  }

  return response.json();
}

/**
 * Delete a service record
 */
export async function deleteServiceRecord(
  token: string,
  id: string
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/service-records/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete service record");
  }
}

// ==================== ADMIN API ====================

/**
 * Admin: Get all service records with filtering
 */
export async function adminGetAllServiceRecords(
  token: string,
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
  const queryParams = new URLSearchParams();
  if (filters?.userId) queryParams.append("userId", filters.userId);
  if (filters?.vehicleId) queryParams.append("vehicleId", filters.vehicleId);
  if (filters?.serviceType) queryParams.append("serviceType", filters.serviceType);
  if (filters?.startDate) queryParams.append("startDate", filters.startDate);
  if (filters?.endDate) queryParams.append("endDate", filters.endDate);
  if (filters?.search) queryParams.append("search", filters.search);
  if (filters?.page) queryParams.append("page", filters.page.toString());
  if (filters?.limit) queryParams.append("limit", filters.limit.toString());

  const url = `${API_BASE_URL}/api/service-records/admin/all?${queryParams.toString()}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch service records");
  }

  return response.json();
}

/**
 * Admin: Get service statistics
 */
export async function adminGetServiceStats(
  token: string,
  filters?: {
    startDate?: string;
    endDate?: string;
  }
): Promise<AdminServiceStats> {
  const queryParams = new URLSearchParams();
  if (filters?.startDate) queryParams.append("startDate", filters.startDate);
  if (filters?.endDate) queryParams.append("endDate", filters.endDate);

  const url = `${API_BASE_URL}/api/service-records/admin/stats?${queryParams.toString()}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch statistics");
  }

  return response.json();
}

/**
 * Admin: Create service record for any vehicle
 */
export async function adminCreateServiceRecord(
  token: string,
  data: CreateServiceRecordData & {
    userId?: string;
    leadId?: string;
    invoiceId?: string;
    appointmentId?: string;
  }
): Promise<ServiceRecord> {
  const response = await fetch(`${API_BASE_URL}/api/service-records/admin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create service record");
  }

  return response.json();
}

/**
 * Admin: Update any service record
 */
export async function adminUpdateServiceRecord(
  token: string,
  id: string,
  data: Partial<CreateServiceRecordData>
): Promise<ServiceRecord> {
  const response = await fetch(`${API_BASE_URL}/api/service-records/admin/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update service record");
  }

  return response.json();
}

/**
 * Admin: Delete any service record
 */
export async function adminDeleteServiceRecord(
  token: string,
  id: string
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/service-records/admin/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete service record");
  }
}
