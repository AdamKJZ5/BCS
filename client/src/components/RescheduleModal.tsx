import React, { useState } from "react";
import DatePicker from "./DatePicker";
import TimeSlotSelector from "./TimeSlotSelector";
import { TimeSlot, rescheduleAppointment } from "../api/appointments";

interface RescheduleModalProps {
  appointment: any;
  onClose: () => void;
  onSuccess: () => void;
  token: string;
}

const RescheduleModal: React.FC<RescheduleModalProps> = ({
  appointment,
  onClose,
  onSuccess,
  token,
}) => {
  const [newDate, setNewDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleReschedule = async () => {
    if (!selectedSlot) {
      setError("Please select a new date and time");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await rescheduleAppointment(appointment._id, selectedSlot.startTime, token);
      alert("Appointment rescheduled successfully!");
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to reschedule appointment");
    } finally {
      setLoading(false);
    }
  };

  const currentDate = new Date(appointment.startTime);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Reschedule Appointment</h2>
          <button onClick={onClose} style={styles.closeButton}>
            ×
          </button>
        </div>

        <div style={styles.body}>
          <div style={styles.currentAppointment}>
            <h3 style={styles.subtitle}>Current Appointment</h3>
            <div style={styles.detailRow}>
              <strong>Date:</strong>
              <span>
                {currentDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <div style={styles.detailRow}>
              <strong>Time:</strong>
              <span>
                {currentDate.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </span>
            </div>
          </div>

          <div style={styles.divider} />

          <h3 style={styles.subtitle}>Select New Date & Time</h3>

          <div style={styles.pickerSection}>
            <DatePicker
              selectedDate={newDate}
              onChange={(date) => {
                setNewDate(date);
                setSelectedSlot(null);
              }}
              minDate={new Date(Date.now() + 24 * 60 * 60 * 1000)} // Tomorrow
              maxDate={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)} // 90 days
            />
          </div>

          {newDate && (
            <div style={styles.pickerSection}>
              <TimeSlotSelector
                date={newDate}
                duration={appointment.duration || 60}
                onSelectSlot={setSelectedSlot}
                selectedSlot={selectedSlot}
              />
            </div>
          )}

          {error && <div style={styles.error}>{error}</div>}
        </div>

        <div style={styles.footer}>
          <button onClick={onClose} style={styles.cancelButton}>
            Cancel
          </button>
          <button
            onClick={handleReschedule}
            disabled={!selectedSlot || loading}
            style={{
              ...styles.confirmButton,
              ...((!selectedSlot || loading) && styles.disabledButton),
            }}
          >
            {loading ? "Rescheduling..." : "Confirm Reschedule"}
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
    maxWidth: "600px",
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
  currentAppointment: {
    backgroundColor: "#f8f9fa",
    padding: "1rem",
    borderRadius: "8px",
    marginBottom: "1.5rem",
  },
  subtitle: {
    fontSize: "1.1rem",
    fontWeight: "bold",
    marginTop: 0,
    marginBottom: "1rem",
    color: "#333",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "0.5rem 0",
  },
  divider: {
    height: "1px",
    backgroundColor: "#e0e0e0",
    margin: "1.5rem 0",
  },
  pickerSection: {
    marginBottom: "1.5rem",
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
    backgroundColor: "#0047AB",
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

export default RescheduleModal;
