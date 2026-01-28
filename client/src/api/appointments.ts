import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface Appointment {
  _id: string;
  customerId: string;
  leadId?: string;
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  appointmentType: "drop_off" | "pickup" | "consultation" | "estimate" | "inspection";
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
  isPrivate: boolean;
  visibleToCustomer: boolean;
  reminderSent: boolean;
  confirmationSent: boolean;
  vehicleInfo?: {
    make?: string;
    model?: string;
    year?: number;
    vin?: string;
  };
  notes?: string;
  cancellationReason?: string;
  photos?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentData {
  appointmentType: string;
  startTime: string;
  duration?: number;
  description?: string;
  vehicleInfo?: {
    make?: string;
    model?: string;
    year?: number;
    vin?: string;
  };
  notes?: string;
}

/**
 * Get available time slots for a specific date
 */
export async function getAvailability(
  date: string,
  duration: number = 60,
  employeeId?: string
): Promise<TimeSlot[]> {
  try {
    const params: any = { date, duration };
    if (employeeId) {
      params.employeeId = employeeId;
    }

    const response = await axios.get(`${API_BASE}/appointments/availability`, {
      params,
    });

    return response.data;
  } catch (error: any) {
    console.error("Error fetching availability:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch availability");
  }
}

/**
 * Create a new appointment (customer)
 */
export async function createAppointment(
  data: CreateAppointmentData,
  token: string
): Promise<Appointment> {
  try {
    const response = await axios.post(`${API_BASE}/appointments`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error creating appointment:", error);
    throw new Error(error.response?.data?.message || "Failed to create appointment");
  }
}

/**
 * Get customer's appointments
 */
export async function getMyAppointments(token: string): Promise<Appointment[]> {
  try {
    const response = await axios.get(`${API_BASE}/appointments/my-appointments`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error fetching appointments:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch appointments");
  }
}

/**
 * Update appointment (customer can only cancel)
 */
export async function updateAppointment(
  id: string,
  updates: { status?: string },
  token: string
): Promise<Appointment> {
  try {
    const response = await axios.patch(`${API_BASE}/appointments/${id}`, updates, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error updating appointment:", error);
    throw new Error(error.response?.data?.message || "Failed to update appointment");
  }
}

/**
 * Cancel appointment with reason
 */
export async function cancelAppointment(
  id: string,
  reason: string,
  token: string
): Promise<void> {
  try {
    await axios.delete(`${API_BASE}/appointments/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: { cancellationReason: reason },
    });
  } catch (error: any) {
    console.error("Error cancelling appointment:", error);
    throw new Error(error.response?.data?.message || "Failed to cancel appointment");
  }
}

/**
 * Reschedule appointment to new time
 */
export async function rescheduleAppointment(
  id: string,
  newStartTime: string,
  token: string
): Promise<Appointment> {
  try {
    const response = await axios.patch(
      `${API_BASE}/appointments/${id}`,
      { startTime: newStartTime },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error rescheduling appointment:", error);
    throw new Error(error.response?.data?.message || "Failed to reschedule appointment");
  }
}

/**
 * Upload photos to an appointment
 */
export async function uploadAppointmentPhotos(
  appointmentId: string,
  files: File[],
  token: string
): Promise<{ success: boolean; photos: string[]; appointment: Appointment }> {
  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("photos", file);
    });

    const response = await axios.post(
      `${API_BASE}/appointments/${appointmentId}/photos`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error uploading photos:", error);
    throw new Error(error.response?.data?.message || "Failed to upload photos");
  }
}

/**
 * Delete a photo from an appointment
 */
export async function deleteAppointmentPhoto(
  appointmentId: string,
  photoIndex: number,
  token: string
): Promise<{ success: boolean; appointment: Appointment }> {
  try {
    const response = await axios.delete(
      `${API_BASE}/appointments/${appointmentId}/photos/${photoIndex}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error deleting photo:", error);
    throw new Error(error.response?.data?.message || "Failed to delete photo");
  }
}

/**
 * Export a single appointment as iCal (.ics) file
 */
export function exportAppointmentToCalendar(appointmentId: string, token: string): void {
  const url = `${API_BASE}/appointments/${appointmentId}/export`;
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `appointment-${appointmentId}.ics`);
  link.style.display = "none";

  // Add authorization header via fetch and create blob
  fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.blob())
    .then((blob) => {
      const objectUrl = URL.createObjectURL(blob);
      link.href = objectUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    })
    .catch((error) => {
      console.error("Error exporting appointment:", error);
      throw new Error("Failed to export appointment");
    });
}

/**
 * Export all customer appointments as iCal (.ics) file
 */
export function exportMyAppointmentsToCalendar(token: string): void {
  const url = `${API_BASE}/appointments/my-appointments/export`;
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "my-appointments.ics");
  link.style.display = "none";

  fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.blob())
    .then((blob) => {
      const objectUrl = URL.createObjectURL(blob);
      link.href = objectUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    })
    .catch((error) => {
      console.error("Error exporting appointments:", error);
      throw new Error("Failed to export appointments");
    });
}

/**
 * Export all appointments as iCal (.ics) file (admin only)
 */
export function exportAllAppointmentsToCalendar(
  token: string,
  filters?: {
    startDate?: string;
    endDate?: string;
    employeeId?: string;
  }
): void {
  let url = `${API_BASE}/appointments/export-all`;

  if (filters) {
    const params = new URLSearchParams();
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.employeeId) params.append("employeeId", filters.employeeId);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }
  }

  fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.blob())
    .then((blob) => {
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.setAttribute("download", "bellevue-collision-calendar.ics");
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    })
    .catch((error) => {
      console.error("Error exporting calendar:", error);
      throw new Error("Failed to export calendar");
    });
}
