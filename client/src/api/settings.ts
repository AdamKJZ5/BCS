import apiClient from '../utils/apiClient';

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
  try {
    const response = await apiClient.get('/admin/settings');
    return response.data.settings;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch settings');
  }
}

export async function updateSettings(updates: Partial<Settings>): Promise<Settings> {
  try {
    const response = await apiClient.put('/admin/settings', updates);
    return response.data.settings;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update settings');
  }
}

export async function initializeReminderSettings(): Promise<Settings> {
  try {
    const response = await apiClient.post('/admin/settings/initialize-reminders');
    return response.data.settings;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to initialize reminder settings');
  }
}
