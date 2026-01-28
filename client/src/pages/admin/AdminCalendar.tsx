import { useState, useEffect, useMemo, useCallback } from "react";
import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useAuth } from "../../context/AuthContext";
import AdminLayout from "../../components/Layout/AdminLayout";
import CreateAppointmentModal from "../../components/CreateAppointmentModal";
import CreateInvoiceFromAppointmentModal from "../../components/CreateInvoiceFromAppointmentModal";
import AppointmentPhotoUpload from "../../components/AppointmentPhotoUpload";
import { exportAllAppointmentsToCalendar } from "../../api/appointments";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    appointment: any;
    status: string;
    isPrivate: boolean;
    appointmentType: string;
  };
}

const AdminCalendar = () => {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState<View>("month");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [invoiceAppointment, setInvoiceAppointment] = useState<any | null>(null);

  useEffect(() => {
    fetchData();
  }, [selectedEmployee]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

      // Fetch appointments
      const apptUrl = selectedEmployee
        ? `${API_BASE}/appointments/by-employee/${selectedEmployee}`
        : `${API_BASE}/appointments`;

      const apptResponse = await fetch(apptUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!apptResponse.ok) throw new Error("Failed to fetch appointments");
      const apptData = await apptResponse.json();
      setAppointments(apptData.appointments || apptData);

      // Fetch employees (admins)
      const userResponse = await fetch(`${API_BASE}/admin/leads/users`, {
        headers: {
          "x-api-key": token || "",
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        const admins = userData.filter((u: any) => u.role === "admin");
        setEmployees(admins);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return appointments.map((apt) => ({
      id: apt._id,
      title: apt.isPrivate ? "🔒 Private" : `${apt.appointmentType.replace(/_/g, " ")} - ${apt.customerId?.name || "Customer"}`,
      start: new Date(apt.startTime),
      end: new Date(apt.endTime),
      resource: {
        appointment: apt,
        status: apt.status,
        isPrivate: apt.isPrivate,
        appointmentType: apt.appointmentType,
      },
    }));
  }, [appointments]);

  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    let backgroundColor = "#0047AB";

    if (event.resource.isPrivate) {
      backgroundColor = "#6c757d";
    } else {
      const statusColors: Record<string, string> = {
        scheduled: "#007bff",
        confirmed: "#28a745",
        in_progress: "#ffc107",
        completed: "#6c757d",
        cancelled: "#dc3545",
        no_show: "#dc3545",
      };
      backgroundColor = statusColors[event.resource.status] || "#0047AB";
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        opacity: 0.9,
        color: "white",
        border: "none",
        display: "block",
      },
    };
  }, []);

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleViewChange = (newView: View) => {
    setView(newView);
  };

  const handleExportCalendar = () => {
    try {
      exportAllAppointmentsToCalendar(token!, {
        employeeId: selectedEmployee || undefined,
      });
    } catch (err: any) {
      setError(err.message || "Failed to export calendar");
    }
  };

  if (loading && appointments.length === 0) {
    return (
      <AdminLayout>
        <div style={styles.container}>
          <div style={styles.header}>
            <h1 style={styles.title}>Appointment Calendar</h1>
            <div style={styles.controls}>
              <select style={styles.select} disabled>
                <option>Loading employees...</option>
              </select>
            </div>
          </div>
          <div style={styles.loadingContainer}>
            <div style={styles.loadingSpinner} />
            <div style={styles.loadingText}>Loading appointments...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Appointment Calendar</h1>
          <div style={styles.controls}>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              style={styles.select}
            >
              <option value="">All Employees</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleExportCalendar}
              style={styles.exportButton}
            >
              📥 Export Calendar
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              style={styles.createButton}
            >
              + New Appointment
            </button>
          </div>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.legend}>
          <div style={styles.legendTitle}>Legend:</div>
          <div style={styles.legendItems}>
            <div style={styles.legendItem}>
              <div style={{ ...styles.legendColor, backgroundColor: "#007bff" }} />
              <span>Scheduled</span>
            </div>
            <div style={styles.legendItem}>
              <div style={{ ...styles.legendColor, backgroundColor: "#28a745" }} />
              <span>Confirmed</span>
            </div>
            <div style={styles.legendItem}>
              <div style={{ ...styles.legendColor, backgroundColor: "#ffc107" }} />
              <span>In Progress</span>
            </div>
            <div style={styles.legendItem}>
              <div style={{ ...styles.legendColor, backgroundColor: "#6c757d" }} />
              <span>Completed/Private</span>
            </div>
            <div style={styles.legendItem}>
              <div style={{ ...styles.legendColor, backgroundColor: "#dc3545" }} />
              <span>Cancelled</span>
            </div>
          </div>
        </div>

        <div style={styles.calendarContainer}>
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            view={view}
            onView={handleViewChange}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            style={{ height: 700 }}
            views={["month", "week", "day"]}
          />
        </div>

        {selectedEvent && (
          <div style={styles.modalOverlay} onClick={() => setSelectedEvent(null)}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>Appointment Details</h2>
                <button
                  onClick={() => setSelectedEvent(null)}
                  style={styles.closeButton}
                >
                  ×
                </button>
              </div>

              <div style={styles.modalBody}>
                <div style={styles.detailRow}>
                  <strong>Status:</strong>
                  <span
                    style={{
                      padding: "0.25rem 0.75rem",
                      borderRadius: "12px",
                      backgroundColor:
                        selectedEvent.resource.status === "confirmed" ? "#28a745" :
                        selectedEvent.resource.status === "in_progress" ? "#ffc107" :
                        selectedEvent.resource.status === "completed" ? "#6c757d" :
                        selectedEvent.resource.status === "cancelled" ? "#dc3545" :
                        "#007bff",
                      color: "white",
                      fontSize: "0.9rem",
                      fontWeight: "bold",
                    }}
                  >
                    {selectedEvent.resource.status.toUpperCase().replace("_", " ")}
                  </span>
                </div>

                <div style={styles.detailRow}>
                  <strong>Type:</strong>
                  <span>{selectedEvent.resource.appointmentType.replace(/_/g, " ").toUpperCase()}</span>
                </div>

                <div style={styles.detailRow}>
                  <strong>Date:</strong>
                  <span>{selectedEvent.start.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
                </div>

                <div style={styles.detailRow}>
                  <strong>Time:</strong>
                  <span>{selectedEvent.start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })} - {selectedEvent.end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}</span>
                </div>

                {selectedEvent.resource.appointment.customerId && (
                  <div style={styles.detailRow}>
                    <strong>Customer:</strong>
                    <span>{selectedEvent.resource.appointment.customerId.name} ({selectedEvent.resource.appointment.customerId.email})</span>
                  </div>
                )}

                {selectedEvent.resource.appointment.assignedTo && (
                  <div style={styles.detailRow}>
                    <strong>Assigned To:</strong>
                    <span>{selectedEvent.resource.appointment.assignedTo.name}</span>
                  </div>
                )}

                {selectedEvent.resource.appointment.vehicleInfo && (
                  <div style={styles.detailRow}>
                    <strong>Vehicle:</strong>
                    <span>
                      {selectedEvent.resource.appointment.vehicleInfo.year} {selectedEvent.resource.appointment.vehicleInfo.make} {selectedEvent.resource.appointment.vehicleInfo.model}
                    </span>
                  </div>
                )}

                {selectedEvent.resource.appointment.description && (
                  <div style={styles.detailRow}>
                    <strong>Description:</strong>
                    <span>{selectedEvent.resource.appointment.description}</span>
                  </div>
                )}

                {selectedEvent.resource.appointment.notes && (
                  <div style={styles.detailRow}>
                    <strong>Notes:</strong>
                    <span>{selectedEvent.resource.appointment.notes}</span>
                  </div>
                )}

                <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid #e0e0e0" }}>
                  <AppointmentPhotoUpload
                    appointmentId={selectedEvent.resource.appointment._id}
                    photos={selectedEvent.resource.appointment.photos}
                    token={token!}
                    onPhotosUpdate={(newPhotos) => {
                      // Update the appointment in state
                      setAppointments((prev) =>
                        prev.map((apt) =>
                          apt._id === selectedEvent.resource.appointment._id
                            ? { ...apt, photos: newPhotos }
                            : apt
                        )
                      );
                      // Update the selected event
                      setSelectedEvent({
                        ...selectedEvent,
                        resource: {
                          ...selectedEvent.resource,
                          appointment: {
                            ...selectedEvent.resource.appointment,
                            photos: newPhotos,
                          },
                        },
                      });
                    }}
                  />
                </div>
              </div>

              <div style={styles.modalFooter}>
                {selectedEvent.resource.status === "completed" && !selectedEvent.resource.isPrivate && (
                  <button
                    onClick={() => {
                      setInvoiceAppointment(selectedEvent.resource.appointment);
                      setSelectedEvent(null);
                    }}
                    style={styles.invoiceButton}
                  >
                    💰 Create Invoice
                  </button>
                )}
                <button onClick={() => setSelectedEvent(null)} style={styles.closeButtonBottom}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {showCreateModal && (
          <CreateAppointmentModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={fetchData}
            token={token || ""}
          />
        )}

        {invoiceAppointment && (
          <CreateInvoiceFromAppointmentModal
            appointment={invoiceAppointment}
            onClose={() => setInvoiceAppointment(null)}
            onSuccess={() => {
              fetchData();
              alert("Invoice created! Redirecting to invoice page...");
            }}
            token={token || ""}
          />
        )}
      </div>
    </AdminLayout>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "2rem",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#0047AB",
    margin: 0,
  },
  controls: {
    display: "flex",
    gap: "1rem",
    alignItems: "center",
  },
  select: {
    padding: "0.75rem",
    fontSize: "1rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    minWidth: "200px",
  },
  createButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
  },
  exportButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#0047AB",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
  },
  loading: {
    textAlign: "center",
    padding: "4rem",
    fontSize: "1.25rem",
    color: "#666",
  },
  error: {
    padding: "1rem",
    backgroundColor: "#f8d7da",
    color: "#721c24",
    borderRadius: "4px",
    border: "1px solid #f5c6cb",
    marginBottom: "2rem",
  },
  legend: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "1rem",
    padding: "1rem",
    backgroundColor: "#f8f9fa",
    borderRadius: "4px",
  },
  legendTitle: {
    fontWeight: "bold",
    marginRight: "0.5rem",
  },
  legendItems: {
    display: "flex",
    gap: "1.5rem",
    flexWrap: "wrap",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  legendColor: {
    width: "20px",
    height: "20px",
    borderRadius: "4px",
  },
  calendarContainer: {
    backgroundColor: "white",
    padding: "1rem",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "8px",
    maxWidth: "600px",
    width: "90%",
    maxHeight: "80vh",
    overflow: "auto",
    boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1.5rem",
    borderBottom: "1px solid #e0e0e0",
  },
  modalTitle: {
    margin: 0,
    fontSize: "1.5rem",
    color: "#0047AB",
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "2rem",
    cursor: "pointer",
    color: "#666",
    lineHeight: 1,
  },
  modalBody: {
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "0.75rem",
    backgroundColor: "#f8f9fa",
    borderRadius: "4px",
  },
  modalFooter: {
    padding: "1rem 1.5rem",
    borderTop: "1px solid #e0e0e0",
    display: "flex",
    justifyContent: "flex-end",
  },
  closeButtonBottom: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
  },
  invoiceButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
    marginRight: "auto",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "4rem",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  loadingSpinner: {
    width: "50px",
    height: "50px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #0047AB",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "1rem",
  },
  loadingText: {
    fontSize: "1.1rem",
    color: "#666",
  },
};

export default AdminCalendar;
