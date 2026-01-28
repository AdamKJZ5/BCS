const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

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

export async function getMyVehicles(token: string): Promise<Vehicle[]> {
  const response = await fetch(`${API_BASE}/vehicles`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch vehicles");
  }

  return response.json();
}

export async function createVehicle(
  data: CreateVehicleData,
  token: string
): Promise<Vehicle> {
  const response = await fetch(`${API_BASE}/vehicles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create vehicle");
  }

  return response.json();
}

export async function updateVehicle(
  id: string,
  data: Partial<CreateVehicleData>,
  token: string
): Promise<Vehicle> {
  const response = await fetch(`${API_BASE}/vehicles/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update vehicle");
  }

  return response.json();
}

export async function deleteVehicle(id: string, token: string): Promise<void> {
  const response = await fetch(`${API_BASE}/vehicles/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete vehicle");
  }
}

export async function setPrimaryVehicle(id: string, token: string): Promise<Vehicle> {
  const response = await fetch(`${API_BASE}/vehicles/${id}/set-primary`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to set primary vehicle");
  }

  return response.json();
}
