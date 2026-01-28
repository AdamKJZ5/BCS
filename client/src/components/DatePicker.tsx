import React, { useState, useMemo } from "react";

interface DatePickerProps {
  selectedDate: Date | null;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
}

const DatePicker: React.FC<DatePickerProps> = ({
  selectedDate,
  onChange,
  minDate,
  maxDate,
  disabledDates = [],
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthYear = useMemo(() => {
    return currentMonth.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }, [currentMonth]);

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days: (Date | null)[] = [];

    // Add empty cells for days before month starts
    const startDayOfWeek = firstDay.getDay();
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days in month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }, [currentMonth]);

  const isDateDisabled = (date: Date): boolean => {
    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;

    // Check if before minDate
    if (minDate && date < minDate) return true;

    // Check if after maxDate
    if (maxDate && date > maxDate) return true;

    // Check if in disabledDates
    if (
      disabledDates.some(
        (d) =>
          d.getFullYear() === date.getFullYear() &&
          d.getMonth() === date.getMonth() &&
          d.getDate() === date.getDate()
      )
    ) {
      return true;
    }

    return false;
  };

  const isDateSelected = (date: Date): boolean => {
    if (!selectedDate) return false;
    return (
      date.getFullYear() === selectedDate.getFullYear() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getDate() === selectedDate.getDate()
    );
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateClick = (date: Date) => {
    if (!isDateDisabled(date)) {
      onChange(date);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button type="button" onClick={handlePrevMonth} style={styles.navButton}>
          &#8249;
        </button>
        <div style={styles.monthYear}>{monthYear}</div>
        <button type="button" onClick={handleNextMonth} style={styles.navButton}>
          &#8250;
        </button>
      </div>

      <div style={styles.weekDays}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} style={styles.weekDay}>
            {day}
          </div>
        ))}
      </div>

      <div style={styles.daysGrid}>
        {daysInMonth.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} style={styles.emptyCell} />;
          }

          const disabled = isDateDisabled(date);
          const selected = isDateSelected(date);

          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => handleDateClick(date)}
              disabled={disabled}
              style={{
                ...styles.dayCell,
                ...(selected && styles.selectedDay),
                ...(disabled && styles.disabledDay),
              }}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "16px",
    width: "100%",
    maxWidth: "350px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  monthYear: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#333",
  },
  navButton: {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    padding: "4px 12px",
    color: "#0047AB",
    transition: "color 0.2s",
  },
  weekDays: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    marginBottom: "8px",
  },
  weekDay: {
    textAlign: "center",
    fontSize: "12px",
    fontWeight: "600",
    color: "#666",
    padding: "8px 0",
  },
  daysGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "4px",
  },
  emptyCell: {
    padding: "12px",
  },
  dayCell: {
    padding: "12px",
    border: "1px solid #e0e0e0",
    borderRadius: "4px",
    background: "#fff",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.2s",
    color: "#333",
  },
  selectedDay: {
    backgroundColor: "#0047AB",
    color: "#fff",
    fontWeight: "600",
    border: "1px solid #0047AB",
  },
  disabledDay: {
    backgroundColor: "#f5f5f5",
    color: "#ccc",
    cursor: "not-allowed",
    border: "1px solid #f0f0f0",
  },
};

export default DatePicker;
