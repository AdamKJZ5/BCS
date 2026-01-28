const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export interface BusinessInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface Hours {
  weekday: string;
  saturday: string;
  sunday: string;
}

export interface EmailSettings {
  notificationEmail: string;
  autoReplyEnabled: boolean;
}

export interface BusinessHours {
  monday: { enabled: boolean; start: string; end: string };
  tuesday: { enabled: boolean; start: string; end: string };
  wednesday: { enabled: boolean; start: string; end: string };
  thursday: { enabled: boolean; start: string; end: string };
  friday: { enabled: boolean; start: string; end: string };
  saturday: { enabled: boolean; start: string; end: string };
  sunday: { enabled: boolean; start: string; end: string };
}

export interface AppointmentSettings {
  enabled: boolean;
  defaultDuration: number;
  bufferTime: number;
  maxAdvanceBooking: number;
  minAdvanceBooking: number;
  businessHours: BusinessHours;
  blockouts: Array<{
    date: string;
    reason: string;
  }>;
}

export interface ReminderTime {
  enabled: boolean;
  hoursBeforeAppointment: number;
  label: string;
}

export interface ReminderSettings {
  enabled: boolean;
  reminderTimes: ReminderTime[];
  followUpReminders: {
    enabled: boolean;
    daysAfterCompletion: number;
  };
  reminderMethods: {
    email: boolean;
    sms: boolean;
  };
  jobScheduleTime: string;
}

export interface Settings {
  _id: string;
  businessInfo: BusinessInfo;
  hours: Hours;
  emailSettings: EmailSettings;
  appointmentSettings?: AppointmentSettings;
  reminderSettings?: ReminderSettings;
  updatedAt: string;
}

export async function getSettings(): Promise<Settings> {
  const res = await fetch(`${API_BASE}/api/admin/settings`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error('Failed to fetch settings');
  }

  const data = await res.json();
  return data.settings;
}

export async function updateSettings(updates: Partial<Settings>): Promise<Settings> {
  const res = await fetch(`${API_BASE}/api/admin/settings`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    throw new Error('Failed to update settings');
  }

  const data = await res.json();
  return data.settings;
}

export async function initializeReminderSettings(): Promise<Settings> {
  const res = await fetch(`${API_BASE}/api/admin/settings/initialize-reminders`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error('Failed to initialize reminder settings');
  }

  const data = await res.json();
  return data.settings;
}
