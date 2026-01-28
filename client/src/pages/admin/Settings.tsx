import { useState, useEffect, FormEvent } from "react";
import AdminLayout from "../../components/Layout/AdminLayout";
import {
  getSettings,
  updateSettings as saveSettings,
  Settings as SettingsType,
  BusinessHours,
} from "../../api/settings";

type TabType = "business" | "appointments" | "reminders" | "email";

const Settings = () => {
  const [activeTab, setActiveTab] = useState<TabType>("business");
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getSettings();
      setSettings(data);
    } catch (err: any) {
      setError(err.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setError("");
    setSaving(true);

    try {
      const updated = await saveSettings(settings);
      setSettings(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={styles.loading}>Loading settings...</div>
      </AdminLayout>
    );
  }

  if (!settings) {
    return (
      <AdminLayout>
        <div style={styles.error}>Failed to load settings</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Settings</h1>
          <p style={styles.subtitle}>Manage your business configuration</p>
        </div>

        {error && <div style={styles.errorBanner}>{error}</div>}
        {saved && <div style={styles.successBanner}>Settings saved successfully!</div>}

        {/* Tab Navigation */}
        <div style={styles.tabs}>
          <button
            onClick={() => setActiveTab("business")}
            style={{ ...styles.tab, ...(activeTab === "business" ? styles.tabActive : {}) }}
          >
            Business Info
          </button>
          <button
            onClick={() => setActiveTab("appointments")}
            style={{ ...styles.tab, ...(activeTab === "appointments" ? styles.tabActive : {}) }}
          >
            Appointments
          </button>
          <button
            onClick={() => setActiveTab("reminders")}
            style={{ ...styles.tab, ...(activeTab === "reminders" ? styles.tabActive : {}) }}
          >
            Reminders
          </button>
          <button
            onClick={() => setActiveTab("email")}
            style={{ ...styles.tab, ...(activeTab === "email" ? styles.tabActive : {}) }}
          >
            Email
          </button>
        </div>

        <form onSubmit={handleSave}>
          {/* Business Info Tab */}
          {activeTab === "business" && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Business Information</h2>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Business Name</label>
                  <input
                    type="text"
                    value={settings.businessInfo.name}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        businessInfo: { ...settings.businessInfo, name: e.target.value },
                      })
                    }
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Phone Number</label>
                  <input
                    type="tel"
                    value={settings.businessInfo.phone}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        businessInfo: { ...settings.businessInfo, phone: e.target.value },
                      })
                    }
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Email Address</label>
                  <input
                    type="email"
                    value={settings.businessInfo.email}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        businessInfo: { ...settings.businessInfo, email: e.target.value },
                      })
                    }
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Address</label>
                  <input
                    type="text"
                    value={settings.businessInfo.address}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        businessInfo: { ...settings.businessInfo, address: e.target.value },
                      })
                    }
                    style={styles.input}
                  />
                </div>
              </div>

              <h3 style={{ ...styles.sectionTitle, marginTop: "2rem" }}>Display Hours</h3>
              <p style={styles.helpText}>Hours shown on your website</p>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Monday - Friday</label>
                  <input
                    type="text"
                    value={settings.hours.weekday}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        hours: { ...settings.hours, weekday: e.target.value },
                      })
                    }
                    style={styles.input}
                    placeholder="8:00 AM - 5:30 PM"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Saturday</label>
                  <input
                    type="text"
                    value={settings.hours.saturday}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        hours: { ...settings.hours, saturday: e.target.value },
                      })
                    }
                    style={styles.input}
                    placeholder="By Appointment Only"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Sunday</label>
                  <input
                    type="text"
                    value={settings.hours.sunday}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        hours: { ...settings.hours, sunday: e.target.value },
                      })
                    }
                    style={styles.input}
                    placeholder="Closed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Appointments Tab */}
          {activeTab === "appointments" && settings.appointmentSettings && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Appointment Settings</h2>
              
              <div style={styles.formGroup}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={settings.appointmentSettings.enabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        appointmentSettings: {
                          ...settings.appointmentSettings!,
                          enabled: e.target.checked,
                        },
                      })
                    }
                    style={styles.checkbox}
                  />
                  Enable Online Appointment Booking
                </label>
              </div>

              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Default Appointment Duration (minutes)</label>
                  <input
                    type="number"
                    value={settings.appointmentSettings.defaultDuration}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        appointmentSettings: {
                          ...settings.appointmentSettings!,
                          defaultDuration: parseInt(e.target.value),
                        },
                      })
                    }
                    style={styles.input}
                    min="15"
                    step="15"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Buffer Time Between Appointments (minutes)</label>
                  <input
                    type="number"
                    value={settings.appointmentSettings.bufferTime}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        appointmentSettings: {
                          ...settings.appointmentSettings!,
                          bufferTime: parseInt(e.target.value),
                        },
                      })
                    }
                    style={styles.input}
                    min="0"
                    step="5"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Max Advance Booking (days)</label>
                  <input
                    type="number"
                    value={settings.appointmentSettings.maxAdvanceBooking}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        appointmentSettings: {
                          ...settings.appointmentSettings!,
                          maxAdvanceBooking: parseInt(e.target.value),
                        },
                      })
                    }
                    style={styles.input}
                    min="1"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Min Advance Booking (hours)</label>
                  <input
                    type="number"
                    value={settings.appointmentSettings.minAdvanceBooking}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        appointmentSettings: {
                          ...settings.appointmentSettings!,
                          minAdvanceBooking: parseInt(e.target.value),
                        },
                      })
                    }
                    style={styles.input}
                    min="1"
                  />
                </div>
              </div>

              <h3 style={{ ...styles.sectionTitle, marginTop: "2rem" }}>Business Hours for Appointments</h3>
              {(Object.keys(settings.appointmentSettings.businessHours) as Array<keyof BusinessHours>).map((day) => {
                const daySettings = settings.appointmentSettings!.businessHours[day];
                return (
                  <div key={day} style={styles.dayRow}>
                    <label style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={daySettings.enabled}
                        onChange={(e) => {
                          const updated = { ...settings.appointmentSettings!.businessHours };
                          updated[day] = { ...updated[day], enabled: e.target.checked };
                          setSettings({
                            ...settings,
                            appointmentSettings: {
                              ...settings.appointmentSettings!,
                              businessHours: updated,
                            },
                          });
                        }}
                        style={styles.checkbox}
                      />
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </label>
                    {daySettings.enabled && (
                      <div style={styles.timeInputs}>
                        <input
                          type="time"
                          value={daySettings.start}
                          onChange={(e) => {
                            const updated = { ...settings.appointmentSettings!.businessHours };
                            updated[day] = { ...updated[day], start: e.target.value };
                            setSettings({
                              ...settings,
                              appointmentSettings: {
                                ...settings.appointmentSettings!,
                                businessHours: updated,
                              },
                            });
                          }}
                          style={styles.timeInput}
                        />
                        <span>to</span>
                        <input
                          type="time"
                          value={daySettings.end}
                          onChange={(e) => {
                            const updated = { ...settings.appointmentSettings!.businessHours };
                            updated[day] = { ...updated[day], end: e.target.value };
                            setSettings({
                              ...settings,
                              appointmentSettings: {
                                ...settings.appointmentSettings!,
                                businessHours: updated,
                              },
                            });
                          }}
                          style={styles.timeInput}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Reminders Tab */}
          {activeTab === "reminders" && settings.reminderSettings && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Reminder Settings</h2>
              
              <div style={styles.formGroup}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={settings.reminderSettings.enabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        reminderSettings: {
                          ...settings.reminderSettings!,
                          enabled: e.target.checked,
                        },
                      })
                    }
                    style={styles.checkbox}
                  />
                  Enable Appointment Reminders
                </label>
              </div>

              <h3 style={{ ...styles.sectionTitle, marginTop: "2rem" }}>Reminder Times</h3>
              {settings.reminderSettings.reminderTimes.map((reminder, index) => (
                <div key={index} style={styles.reminderRow}>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={reminder.enabled}
                      onChange={(e) => {
                        const updated = [...settings.reminderSettings!.reminderTimes];
                        updated[index] = { ...updated[index], enabled: e.target.checked };
                        setSettings({
                          ...settings,
                          reminderSettings: {
                            ...settings.reminderSettings!,
                            reminderTimes: updated,
                          },
                        });
                      }}
                      style={styles.checkbox}
                    />
                    Send reminder
                  </label>
                  <input
                    type="number"
                    value={reminder.hoursBeforeAppointment}
                    onChange={(e) => {
                      const updated = [...settings.reminderSettings!.reminderTimes];
                      updated[index] = { ...updated[index], hoursBeforeAppointment: parseInt(e.target.value) };
                      setSettings({
                        ...settings,
                        reminderSettings: {
                          ...settings.reminderSettings!,
                          reminderTimes: updated,
                        },
                      });
                    }}
                    style={{ ...styles.input, width: "100px" }}
                    min="1"
                    disabled={!reminder.enabled}
                  />
                  <span>hours before appointment</span>
                </div>
              ))}

              <h3 style={{ ...styles.sectionTitle, marginTop: "2rem" }}>Follow-Up Reminders</h3>
              <div style={styles.formGroup}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={settings.reminderSettings.followUpReminders.enabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        reminderSettings: {
                          ...settings.reminderSettings!,
                          followUpReminders: {
                            ...settings.reminderSettings!.followUpReminders,
                            enabled: e.target.checked,
                          },
                        },
                      })
                    }
                    style={styles.checkbox}
                  />
                  Send follow-up after completion
                </label>
              </div>
              {settings.reminderSettings.followUpReminders.enabled && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Days after completion</label>
                  <input
                    type="number"
                    value={settings.reminderSettings.followUpReminders.daysAfterCompletion}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        reminderSettings: {
                          ...settings.reminderSettings!,
                          followUpReminders: {
                            ...settings.reminderSettings!.followUpReminders,
                            daysAfterCompletion: parseInt(e.target.value),
                          },
                        },
                      })
                    }
                    style={styles.input}
                    min="1"
                  />
                </div>
              )}

              <h3 style={{ ...styles.sectionTitle, marginTop: "2rem" }}>Reminder Methods</h3>
              <div style={styles.formGroup}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={settings.reminderSettings.reminderMethods.email}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        reminderSettings: {
                          ...settings.reminderSettings!,
                          reminderMethods: {
                            ...settings.reminderSettings!.reminderMethods,
                            email: e.target.checked,
                          },
                        },
                      })
                    }
                    style={styles.checkbox}
                  />
                  Email Reminders
                </label>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={settings.reminderSettings.reminderMethods.sms}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        reminderSettings: {
                          ...settings.reminderSettings!,
                          reminderMethods: {
                            ...settings.reminderSettings!.reminderMethods,
                            sms: e.target.checked,
                          },
                        },
                      })
                    }
                    style={styles.checkbox}
                  />
                  SMS Reminders (requires Twilio configuration)
                </label>
              </div>
            </div>
          )}

          {/* Email Tab */}
          {activeTab === "email" && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Email Settings</h2>
              <div style={styles.formGroup}>
                <label style={styles.label}>Notification Email</label>
                <input
                  type="email"
                  value={settings.emailSettings.notificationEmail}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      emailSettings: { ...settings.emailSettings, notificationEmail: e.target.value },
                    })
                  }
                  style={styles.input}
                />
                <p style={styles.helpText}>
                  Lead notifications and important alerts will be sent to this email
                </p>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={settings.emailSettings.autoReplyEnabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        emailSettings: { ...settings.emailSettings, autoReplyEnabled: e.target.checked },
                      })
                    }
                    style={styles.checkbox}
                  />
                  Send auto-reply to customers
                </label>
                <p style={styles.helpText}>
                  Automatically send a confirmation email when customers submit a quote request
                </p>
              </div>
            </div>
          )}

          <div style={styles.actions}>
            <button type="submit" disabled={saving} style={styles.saveButton}>
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "2rem",
  },
  loading: {
    textAlign: "center" as const,
    padding: "4rem",
    fontSize: "1.25rem",
    color: "#666",
  },
  error: {
    textAlign: "center" as const,
    padding: "4rem",
    fontSize: "1.25rem",
    color: "#dc3545",
  },
  header: {
    marginBottom: "2rem",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    margin: "0 0 0.5rem",
    color: "#0047AB",
  },
  subtitle: {
    fontSize: "1.1rem",
    color: "#666",
    margin: 0,
  },
  errorBanner: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
    padding: "1rem",
    borderRadius: "4px",
    marginBottom: "1rem",
    border: "1px solid #f5c6cb",
  },
  successBanner: {
    backgroundColor: "#d4edda",
    color: "#155724",
    padding: "1rem",
    borderRadius: "4px",
    marginBottom: "1rem",
    textAlign: "center" as const,
    fontWeight: "bold",
    border: "1px solid #c3e6cb",
  },
  tabs: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "2rem",
    borderBottom: "2px solid #e0e0e0",
  },
  tab: {
    padding: "1rem 2rem",
    fontSize: "1rem",
    fontWeight: "bold",
    border: "none",
    backgroundColor: "transparent",
    color: "#666",
    cursor: "pointer",
    borderBottom: "3px solid transparent",
    transition: "all 0.3s",
  },
  tabActive: {
    color: "#0047AB",
    borderBottom: "3px solid #0047AB",
  },
  section: {
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    marginBottom: "2rem",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "1.5rem",
    color: "#333",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "1.5rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.5rem",
  },
  label: {
    fontSize: "1rem",
    fontWeight: "bold",
    color: "#333",
  },
  input: {
    padding: "0.75rem",
    fontSize: "1rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontFamily: "inherit",
  },
  helpText: {
    fontSize: "0.85rem",
    color: "#666",
    margin: "0.25rem 0 0",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "1rem",
    cursor: "pointer",
  },
  checkbox: {
    width: "18px",
    height: "18px",
    cursor: "pointer",
  },
  dayRow: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "0.75rem",
    borderBottom: "1px solid #e0e0e0",
  },
  timeInputs: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginLeft: "auto",
  },
  timeInput: {
    padding: "0.5rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "1rem",
  },
  reminderRow: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "0.75rem",
    borderBottom: "1px solid #e0e0e0",
  },
  actions: {
    display: "flex",
    gap: "1rem",
  },
  saveButton: {
    backgroundColor: "#007bff",
    color: "#fff",
    padding: "1rem 2rem",
    fontSize: "1.1rem",
    fontWeight: "bold",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
};

export default Settings;
