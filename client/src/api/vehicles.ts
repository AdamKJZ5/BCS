import apiClient from '../utils/apiClient';

export interface Vehicle {
  _id: string;
  userId: string;
  make: string;
  model: string;
  year: number;
  color?: string;
  vin?: string;
  licensePlate?: string;
  nickname?: string;
  isPrimary: boolean;
  isSecondary: boolean;
  lastServiceDate?: string;
  mileage?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVehicleData {
  make: string;
  model: string;
  year: number;
  color?: string;
  vin?: string;
  licensePlate?: string;
  nickname?: string;
  mileage?: number;
  notes?: string;
}

export async function getMyVehicles(): Promise<Vehicle[]> {
  try {
    const response = await apiClient.get('/vehicles');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch vehicles");
  }
}

export async function createVehicle(data: CreateVehicleData): Promise<Vehicle> {
  try {
    const response = await apiClient.post('/vehicles', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to create vehicle");
  }
}

export async function updateVehicle(
  id: string,
  data: Partial<CreateVehicleData>
): Promise<Vehicle> {
  try {
    const response = await apiClient.patch(`/vehicles/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to update vehicle");
  }
}

export async function deleteVehicle(id: string): Promise<void> {
  try {
    await apiClient.delete(`/vehicles/${id}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to delete vehicle");
  }
}

export async function setPrimaryVehicle(id: string): Promise<Vehicle> {
  try {
    const response = await apiClient.post(`/vehicles/${id}/set-primary`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to set primary vehicle");
  }
}

export async function setSecondaryVehicle(id: string): Promise<Vehicle> {
  try {
    const response = await apiClient.post(`/vehicles/${id}/set-secondary`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to set secondary vehicle");
  }
}
