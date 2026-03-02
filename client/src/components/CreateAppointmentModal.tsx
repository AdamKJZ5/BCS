import React, { useState, useEffect } from "react";
import DatePicker from "./DatePicker";
import TimeSlotSelector from "./TimeSlotSelector";
import { TimeSlot } from "../api/appointments";
import useModal from "../hooks/useModal";

interface CreateAppointmentModalProps {
  onClose: () => void;
  onSuccess: () => void;
  token: string;
}

const CreateAppointmentModal: React.FC<CreateAppointmentModalProps> = ({
  onClose,
  onSuccess,
  token,
}) => {
  const modal = useModal();
  const [appointmentMode, setAppointmentMode] = useState<"customer" | "private">("customer");
  const [customers, setCustomers] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  // Form fields
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [appointmentType, setAppointmentType] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [duration, setDuration] = useState(60);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

      // Fetch all users (customers and employees)
      const userResponse = await fetch(`${API_BASE}/admin/leads/users`, {
        headers: {
          "x-api-key": token,
        },
      });

      if (userResponse.ok) {
        const users = await userResponse.json();
        setCustomers(users.filter((u: any) => u.role === "customer"));
        setEmployees(users.filter((u: any) => u.role === "admin"));
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
  };

  const handleSubmit = async () => {
    if (appointmentMode === "customer") {
      if (!selectedCustomerId || !appointmentType || !selectedSlot) {
        modal.setError("Please fill in all required fields");
        return;
      }
    } else {
      if (!title || !selectedSlot) {
        modal.setError("Please fill in all required fields");
        return;
      }
    }

    await modal.handleSubmit(
      async () => {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

        const payload: any = {
          startTime: selectedSlot!.startTime,
          duration,
        };

        if (appointmentMode === "customer") {
          payload.customerId = selectedCustomerId;
          payload.appointmentType = appointmentType;
          payload.description = description;
          if (assignedTo) payload.assignedTo = assignedTo;
        } else {
          payload.title = title;
          payload.description = description;
          payload.isPrivate = true;
          if (assignedTo) payload.assignedTo = assignedTo;
        }

        const response = await fetch(`${API_BASE}/appointments/admin`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to create appointment");
        }

        alert("Appointment created successfully!");
        return response.json();
      },
      { onSuccess }
    );
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Create New Appointment</h2>
          <button onClick={onClose} style={styles.closeButton}>
            ×
          </button>
        </div>

        <div style={styles.body}>
          {/* Appointment Mode Toggle */}
          <div style={styles.modeToggle}>
            <button
              onClick={() => setAppointmentMode("customer")}
              style={{
                ...styles.modeButton,
                ...(appointmentMode === "customer" && styles.modeButtonActive),
              }}
            >
              Customer Appointment
            </button>
            <button
              onClick={() => setAppointmentMode("private")}
              style={{
                ...styles.modeButton,
                ...(appointmentMode === "private" && styles.modeButtonActive),
              }}
            >
              Private Appointment
            </button>
          </div>

          {/* Customer Mode Fields */}
          {appointmentMode === "customer" && (
            <>
              <div style={styles.formGroup}>
                <label style={styles.label}>Customer *</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  style={styles.input}
                >
                  <option value="">Select a customer</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.name} ({customer.email})
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Appointment Type *</label>
                <select
                  value={appointmentType}
                  onChange={(e) => setAppointmentType(e.target.value)}
                  style={styles.input}
                >
                  <option value="">Select type</option>
                  <option value="drop_off">Drop Off Vehicle</option>
                  <option value="estimate">Get Estimate</option>
                  <option value="consultation">Consultation</option>
                  <option value="inspection">Vehicle Inspection</option>
                  <option value="pickup">Pick Up Vehicle</option>
                </select>
              </div>
            </>
          )}

          {/* Private Mode Fields */}
          {appointmentMode === "private" && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Team Meeting, Lunch Break, Blocked Time"
                style={styles.input}
              />
            </div>
          )}

          {/* Common Fields */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{ ...styles.input, resize: "vertical" as const }}
              placeholder="Additional notes..."
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Assign To</label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              style={styles.input}
            >
              <option value="">Unassigned</option>
              {employees.map((employee) => (
                <option key={employee._id} value={employee._id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Duration (minutes)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
              min="15"
              max="480"
              step="15"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Date *</label>
            <DatePicker
              selectedDate={selectedDate}
              onChange={(date) => {
                setSelectedDate(date);
                setSelectedSlot(null);
              }}
              minDate={new Date()}
              maxDate={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)}
            />
          </div>

          {selectedDate && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Time *</label>
              <TimeSlotSelector
                date={selectedDate}
                duration={duration}
                onSelectSlot={setSelectedSlot}
                selectedSlot={selectedSlot}
                employeeId={assignedTo || undefined}
              />
            </div>
          )}

          {modal.error && <div style={styles.error}>{modal.error}</div>}
        </div>

        <div style={styles.footer}>
          <button onClick={onClose} style={styles.cancelButton}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={modal.loading}
            style={{
              ...styles.confirmButton,
              ...(modal.loading && styles.disabledButton),
            }}
          >
            {modal.loading ? "Creating..." : "Create Appointment"}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
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
    maxWidth: "700px",
    width: "90%",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1.5rem",
    borderBottom: "1px solid #e0e0e0",
  },
  title: {
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
  body: {
    padding: "1.5rem",
  },
  modeToggle: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "1.5rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    padding: "4px",
    backgroundColor: "#f8f9fa",
  },
  modeButton: {
    flex: 1,
    padding: "0.75rem",
    border: "none",
    borderRadius: "4px",
    backgroundColor: "transparent",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "all 0.2s",
  },
  modeButtonActive: {
    backgroundColor: "#0047AB",
    color: "white",
  },
  formGroup: {
    marginBottom: "1.5rem",
  },
  label: {
    display: "block",
    marginBottom: "0.5rem",
    fontWeight: "bold",
    color: "#333",
  },
  input: {
    width: "100%",
    padding: "0.75rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "1rem",
    fontFamily: "inherit",
  },
  error: {
    padding: "1rem",
    backgroundColor: "#f8d7da",
    color: "#721c24",
    borderRadius: "4px",
    border: "1px solid #f5c6cb",
    marginTop: "1rem",
  },
  footer: {
    padding: "1rem 1.5rem",
    borderTop: "1px solid #e0e0e0",
    display: "flex",
    justifyContent: "flex-end",
    gap: "1rem",
  },
  cancelButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
  },
  confirmButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
  },
  disabledButton: {
    backgroundColor: "#ccc",
    cursor: "not-allowed",
  },
};

export default CreateAppointmentModal;
