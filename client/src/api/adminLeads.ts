const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_KEY = import.meta.env.VITE_ADMIN_API_KEY || 'super-secret-key';

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
}

interface LeadsResponse {
  data: Lead[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

export async function fetchLeads(page: number = 1, limit: number = 10): Promise<LeadsResponse> {
  const res = await fetch(`${API_BASE}/api/admin/leads?page=${page}&limit=${limit}`, {
    headers: {
      'x-api-key': API_KEY,
    },
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
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    throw new Error('Failed to update status');
  }
}

export async function archiveLead(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/leads/${id}`, {
    method: 'DELETE',
    headers: {
      'x-api-key': API_KEY,
    },
  });

  if (!res.ok) {
    throw new Error('Failed to archive lead');
  }
}
