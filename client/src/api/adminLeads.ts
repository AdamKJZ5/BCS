import apiClient from '../utils/apiClient';

interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  damageDescription?: string;
  photos: string[];
  status: 'new' | 'contacted' | 'closed';
  createdAt: string;

  // Tracking fields
  repairStage?: 'pending' | 'assessment' | 'parts_ordered' | 'in_progress' | 'quality_check' | 'completed';
  partsStatus?: 'not_needed' | 'ordering' | 'ordered' | 'in_transit' | 'received' | 'installed';
  estimatedCompletionDate?: string;
  actualCompletionDate?: string;
  progressNotes?: Array<{
    note: string;
    createdBy: string;
    createdAt: string;
  }>;
  estimateAmount?: number;
  finalAmount?: number;
  insuranceClaimNumber?: string;
  vehicleInfo?: {
    make?: string;
    model?: string;
    year?: number;
    color?: string;
    vin?: string;
  };
}

interface LeadsResponse {
  data: Lead[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
  filters?: any;
}

export interface LeadFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  repairStage?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: string;
}

export async function fetchLeads(filters: LeadFilters = {}): Promise<LeadsResponse> {
  try {
    const params = new URLSearchParams();

    params.append("page", (filters.page || 1).toString());
    params.append("limit", (filters.limit || 10).toString());

    if (filters.search) params.append("search", filters.search);
    if (filters.status) params.append("status", filters.status);
    if (filters.repairStage) params.append("repairStage", filters.repairStage);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

    const response = await apiClient.get(`/admin/leads?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch leads');
  }
}

export async function updateLeadStatus(
  id: string,
  status: 'new' | 'contacted' | 'closed'
): Promise<void> {
  try {
    await apiClient.patch(`/admin/leads/${id}/status`, { status });
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update status');
  }
}

export async function archiveLead(id: string): Promise<void> {
  try {
    await apiClient.delete(`/admin/leads/${id}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to archive lead');
  }
}

export async function updateRepairTracking(
  id: string,
  data: {
    repairStage?: string;
    partsStatus?: string;
    estimatedCompletionDate?: string;
    estimateAmount?: number;
    finalAmount?: number;
    insuranceClaimNumber?: string;
    vehicleInfo?: {
      make?: string;
      model?: string;
      year?: number;
      color?: string;
      vin?: string;
    };
  }
): Promise<Lead> {
  try {
    const response = await apiClient.patch(`/admin/leads/${id}/tracking`, data);
    return response.data.lead;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update repair tracking');
  }
}

export async function addProgressNote(
  id: string,
  note: string,
  createdBy: string
): Promise<Lead> {
  try {
    const response = await apiClient.post(`/admin/leads/${id}/notes`, { note, createdBy });
    return response.data.lead;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to add progress note');
  }
}

export async function resendSignupEmail(id: string): Promise<void> {
  try {
    await apiClient.post(`/admin/leads/${id}/resend-signup`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to resend signup email');
  }
}

export type { Lead };
