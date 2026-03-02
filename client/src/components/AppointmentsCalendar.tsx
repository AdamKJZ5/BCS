import { useState, useMemo, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, View, Event } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Appointment } from '../api/appointments';

// Setup the localizer using date-fns
const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface AppointmentEvent extends Event {
  appointment: Appointment;
  status: string;
  type: string;
}

interface AppointmentsCalendarProps {
  appointments: Appointment[];
  onSelectAppointment: (appointment: Appointment) => void;
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void;
}

const AppointmentsCalendar: React.FC<AppointmentsCalendarProps> = ({
  appointments,
  onSelectAppointment,
  onSelectSlot,
}) => {
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());

  // Convert appointments to calendar events
  const events: AppointmentEvent[] = useMemo(() => {
    return appointments.map((apt) => ({
      title: `${apt.appointmentType.replace(/_/g, ' ').toUpperCase()}${apt.vehicleInfo ? ` - ${apt.vehicleInfo.make} ${apt.vehicleInfo.model}` : ''}`,
      start: new Date(apt.startTime),
      end: new Date(apt.endTime),
      appointment: apt,
      status: apt.status,
      type: apt.appointmentType,
      resource: apt,
    }));
  }, [appointments]);

  // Get event style based on appointment status
  const eventStyleGetter = useCallback((event: AppointmentEvent) => {
    let backgroundColor = '#3174ad'; // Default blue

    switch (event.status) {
      case 'confirmed':
        backgroundColor = '#28a745'; // Green
        break;
      case 'scheduled':
        backgroundColor = '#007bff'; // Blue
        break;
      case 'in_progress':
        backgroundColor = '#ffc107'; // Yellow
        break;
      case 'completed':
        backgroundColor = '#6c757d'; // Gray
        break;
      case 'cancelled':
        backgroundColor = '#dc3545'; // Red
        break;
      case 'no_show':
        backgroundColor = '#6c757d'; // Gray
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: event.status === 'completed' || event.status === 'cancelled' ? 0.6 : 1,
        color: 'white',
        border: '0',
        display: 'block',
        fontSize: '0.85rem',
        fontWeight: 'bold',
      },
    };
  }, []);

  const handleSelectEvent = useCallback((event: AppointmentEvent) => {
    onSelectAppointment(event.appointment);
  }, [onSelectAppointment]);

  const handleSelectSlot = useCallback((slotInfo: { start: Date; end: Date }) => {
    if (onSelectSlot) {
      onSelectSlot(slotInfo);
    }
  }, [onSelectSlot]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Appointments Calendar</h2>
        <div style={styles.legend}>
          <div style={styles.legendItem}>
            <div style={{ ...styles.legendColor, backgroundColor: '#007bff' }} />
            <span>Scheduled</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{ ...styles.legendColor, backgroundColor: '#28a745' }} />
            <span>Confirmed</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{ ...styles.legendColor, backgroundColor: '#ffc107' }} />
            <span>In Progress</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{ ...styles.legendColor, backgroundColor: '#6c757d' }} />
            <span>Completed</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{ ...styles.legendColor, backgroundColor: '#dc3545' }} />
            <span>Cancelled</span>
          </div>
        </div>
      </div>

      <div style={styles.calendarWrapper}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable={!!onSelectSlot}
          popup
          views={['month', 'week', 'day', 'agenda']}
          defaultView="month"
          step={30}
          showMultiDayTimes
          tooltipAccessor={(event: AppointmentEvent) => {
            const startTime = event.start ? format(event.start, 'h:mm a') : 'N/A';
            const endTime = event.end ? format(event.end, 'h:mm a') : 'N/A';
            return `${event.title}\nStatus: ${event.status.replace('_', ' ').toUpperCase()}\nTime: ${startTime} - ${endTime}`;
          }}
        />
      </div>

      <div style={styles.help}>
        💡 <strong>Tip:</strong> Click on an appointment to view details. Use the toolbar to switch between Month, Week, Day, and Agenda views.
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
  },
  header: {
    marginBottom: '1.5rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 'bold' as const,
    color: '#0047AB',
    marginBottom: '1rem',
  },
  legend: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem',
  },
  legendColor: {
    width: '20px',
    height: '20px',
    borderRadius: '4px',
  },
  calendarWrapper: {
    marginBottom: '1rem',
  },
  help: {
    padding: '1rem',
    backgroundColor: '#e7f3ff',
    border: '1px solid #b3d9ff',
    borderRadius: '6px',
    fontSize: '0.9rem',
    color: '#004085',
  },
};

export default AppointmentsCalendar;
