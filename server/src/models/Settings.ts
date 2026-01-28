import mongoose, { Document, Schema } from "mongoose";

export interface ISettings extends Document {
  businessInfo: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
  hours: {
    weekday: string;
    saturday: string;
    sunday: string;
  };
  emailSettings: {
    notificationEmail: string;
    autoReplyEnabled: boolean;
  };
  appointmentSettings: {
    enabled: boolean;
    defaultDuration: number;
    bufferTime: number;
    maxAdvanceBooking: number;
    minAdvanceBooking: number;
    businessHours: {
      monday: { enabled: boolean; start: string; end: string };
      tuesday: { enabled: boolean; start: string; end: string };
      wednesday: { enabled: boolean; start: string; end: string };
      thursday: { enabled: boolean; start: string; end: string };
      friday: { enabled: boolean; start: string; end: string };
      saturday: { enabled: boolean; start: string; end: string };
      sunday: { enabled: boolean; start: string; end: string };
    };
    blockouts: Array<{
      date: Date;
      reason: string;
    }>;
  };
  reminderSettings: {
    enabled: boolean;
    reminderTimes: Array<{
      enabled: boolean;
      hoursBeforeAppointment: number;
      label: string;
    }>;
    followUpReminders: {
      enabled: boolean;
      daysAfterCompletion: number;
    };
    reminderMethods: {
      email: boolean;
      sms: boolean;
    };
    jobScheduleTime: string; // Cron time for when reminders are sent (e.g., "09:00")
  };
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>({
  businessInfo: {
    name: { type: String, required: true, default: "Bellevue Collision Services" },
    phone: { type: String, required: true, default: "(425) 373-0308" },
    email: { type: String, required: true, default: "info@bellevuecollisionservices.com" },
    address: { type: String, required: true, default: "13434 SE 27th Pl, Bellevue WA 98005" },
  },
  hours: {
    weekday: { type: String, required: true, default: "8:00 AM - 5:30 PM" },
    saturday: { type: String, required: true, default: "By Appointment Only" },
    sunday: { type: String, required: true, default: "Closed" },
  },
  emailSettings: {
    notificationEmail: { type: String, required: true },
    autoReplyEnabled: { type: Boolean, default: true },
  },
  appointmentSettings: {
    enabled: { type: Boolean, default: true },
    defaultDuration: { type: Number, default: 60 }, // 60 minutes
    bufferTime: { type: Number, default: 15 }, // 15 minutes between appointments
    maxAdvanceBooking: { type: Number, default: 90 }, // 90 days
    minAdvanceBooking: { type: Number, default: 24 }, // 24 hours
    businessHours: {
      monday: {
        enabled: { type: Boolean, default: true },
        start: { type: String, default: "08:00" },
        end: { type: String, default: "17:30" },
      },
      tuesday: {
        enabled: { type: Boolean, default: true },
        start: { type: String, default: "08:00" },
        end: { type: String, default: "17:30" },
      },
      wednesday: {
        enabled: { type: Boolean, default: true },
        start: { type: String, default: "08:00" },
        end: { type: String, default: "17:30" },
      },
      thursday: {
        enabled: { type: Boolean, default: true },
        start: { type: String, default: "08:00" },
        end: { type: String, default: "17:30" },
      },
      friday: {
        enabled: { type: Boolean, default: true },
        start: { type: String, default: "08:00" },
        end: { type: String, default: "17:30" },
      },
      saturday: {
        enabled: { type: Boolean, default: true },
        start: { type: String, default: "09:00" },
        end: { type: String, default: "14:00" },
      },
      sunday: {
        enabled: { type: Boolean, default: false },
        start: { type: String, default: "00:00" },
        end: { type: String, default: "00:00" },
      },
    },
    blockouts: [
      {
        date: Date,
        reason: String,
      },
    ],
  },
  reminderSettings: {
    enabled: { type: Boolean, default: true },
    reminderTimes: [
      {
        enabled: { type: Boolean, default: true },
        hoursBeforeAppointment: { type: Number, required: true },
        label: { type: String, required: true },
      },
    ],
    followUpReminders: {
      enabled: { type: Boolean, default: false },
      daysAfterCompletion: { type: Number, default: 7 },
    },
    reminderMethods: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
    },
    jobScheduleTime: { type: String, default: "09:00" },
  },
  updatedAt: { type: Date, default: Date.now },
});

// Update the updatedAt field before saving
settingsSchema.pre("save", function (this: ISettings) {
  this.updatedAt = new Date();
});

const Settings = mongoose.model<ISettings>("Settings", settingsSchema);

export default Settings;
