const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

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

  const res = await fetch(`${API_BASE}/api/admin/leads?${params.toString()}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error('Failed to fetch leads');
  }

  return res.json();
}

export async function updateLeadStatus(
  id: string,
  status: 'new' | 'contacted' | 'closed'
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/leads/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    throw new Error('Failed to update status');
  }
}

export async function archiveLead(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/leads/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error('Failed to archive lead');
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
  const res = await fetch(`${API_BASE}/api/admin/leads/${id}/tracking`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('Failed to update repair tracking');
  }

  const result = await res.json();
  return result.lead;
}

export async function addProgressNote(
  id: string,
  note: string,
  createdBy: string
): Promise<Lead> {
  const res = await fetch(`${API_BASE}/api/admin/leads/${id}/notes`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ note, createdBy }),
  });

  if (!res.ok) {
    throw new Error('Failed to add progress note');
  }

  const result = await res.json();
  return result.lead;
}

export async function resendSignupEmail(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/leads/${id}/resend-signup`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to resend signup email');
  }
}

export type { Lead };
