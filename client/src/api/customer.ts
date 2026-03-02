import apiClient from '../utils/apiClient';

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

export const getMyRepairs = async (): Promise<Repair[]> => {
  try {
    const response = await apiClient.get('/customer/repairs');
    return response.data.repairs;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch repairs");
  }
};

export const getRepairById = async (id: string): Promise<Repair> => {
  try {
    const response = await apiClient.get(`/customer/repairs/${id}`);
    return response.data.repair;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch repair");
  }
};
