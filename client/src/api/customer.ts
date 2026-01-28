const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface Repair {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  damageDescription?: string;
  photos: string[];
  status: "new" | "contacted" | "closed";
  createdAt: string;

  // Tracking fields
  repairStage?: string;
  partsStatus?: string;
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

export const getMyRepairs = async (token: string): Promise<Repair[]> => {
  const response = await fetch(`${API_BASE_URL}/api/customer/repairs`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch repairs");
  }

  const data = await response.json();
  return data.repairs;
};

export const getRepairById = async (token: string, id: string): Promise<Repair> => {
  const response = await fetch(`${API_BASE_URL}/api/customer/repairs/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch repair");
  }

  const data = await response.json();
  return data.repair;
};
