import React, { useState, useEffect } from "react";
import { getAvailability, TimeSlot } from "../api/appointments";

interface TimeSlotSelectorProps {
  date: Date;
  duration: number;
  onSelectSlot: (slot: TimeSlot) => void;
  selectedSlot: TimeSlot | null;
  employeeId?: string;
}

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  date,
  duration,
  onSelectSlot,
  selectedSlot,
  employeeId,
}) => {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSlots = async () => {
      setLoading(true);
      setError(null);

      try {
        // Format date as YYYY-MM-DD
        const dateStr = date.toISOString().split("T")[0];
        const availableSlots = await getAvailability(dateStr, duration, employeeId);
        setSlots(availableSlots);
      } catch (err: any) {
        setError(err.message || "Failed to load time slots");
        setSlots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [date, duration, employeeId]);

  const formatTime = (timeStr: string): string => {
    const date = new Date(timeStr);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const isSlotSelected = (slot: TimeSlot): boolean => {
    if (!selectedSlot) return false;
    return slot.startTime === selectedSlot.startTime;
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <strong>Available Times:</strong>
          <span style={styles.date}>
            {date.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
        <div style={styles.slotsGrid}>
          {[1, 2, 3, 4, 5, 6].map((_, idx) => (
            <div key={idx} style={styles.skeletonSlot}>
              <div style={styles.skeletonLine} />
              <div style={styles.skeletonLineSmall} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>{error}</div>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.noSlots}>
          No available time slots for this date. Please select another day.
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <strong>Available Times:</strong>
        <span style={styles.date}>
          {date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </span>
      </div>

      <div style={styles.slotsGrid}>
        {slots.map((slot, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelectSlot(slot)}
            disabled={!slot.available}
            style={{
              ...styles.slotButton,
              ...(isSlotSelected(slot) && styles.selectedSlot),
              ...(!slot.available && styles.unavailableSlot),
            }}
          >
            <div style={styles.slotTime}>{formatTime(slot.startTime)}</div>
            <div style={styles.slotDuration}>{duration} min</div>
          </button>
        ))}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    marginTop: "16px",
    width: "100%",
  },
  header: {
    marginBottom: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  date: {
    fontSize: "14px",
    color: "#666",
  },
  loading: {
    padding: "24px",
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
  },
  error: {
    padding: "16px",
    backgroundColor: "#fee",
    border: "1px solid #fcc",
    borderRadius: "4px",
    color: "#c33",
    textAlign: "center",
  },
  noSlots: {
    padding: "24px",
    textAlign: "center",
    color: "#666",
    backgroundColor: "#f9f9f9",
    border: "1px solid #ddd",
    borderRadius: "4px",
  },
  slotsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
    gap: "12px",
  },
  slotButton: {
    padding: "12px 16px",
    border: "2px solid #ddd",
    borderRadius: "6px",
    background: "#fff",
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
  },
  slotTime: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#333",
  },
  slotDuration: {
    fontSize: "12px",
    color: "#666",
  },
  selectedSlot: {
    backgroundColor: "#0047AB",
    borderColor: "#0047AB",
    color: "#fff",
  },
  unavailableSlot: {
    backgroundColor: "#f5f5f5",
    borderColor: "#e0e0e0",
    color: "#ccc",
    cursor: "not-allowed",
    opacity: 0.6,
  },
  skeletonSlot: {
    padding: "12px 16px",
    border: "2px solid #e0e0e0",
    borderRadius: "6px",
    background: "#f5f5f5",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    animation: "pulse 1.5s ease-in-out infinite",
  },
  skeletonLine: {
    width: "60px",
    height: "20px",
    backgroundColor: "#e0e0e0",
    borderRadius: "4px",
  },
  skeletonLineSmall: {
    width: "40px",
    height: "14px",
    backgroundColor: "#e0e0e0",
    borderRadius: "4px",
  },
};

export default TimeSlotSelector;
