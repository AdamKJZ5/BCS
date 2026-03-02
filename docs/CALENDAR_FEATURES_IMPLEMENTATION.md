# Calendar Features Implementation Guide

Complete guide for implementing customer calendar dashboard and enhanced admin calendar features.

---

## Overview

### Customer Calendar Dashboard
A visual calendar on the customer dashboard showing all their appointments and repair schedules in an easy-to-view calendar format.

### Enhanced Admin Calendar
Improved admin calendar with ability to schedule appointments, update repair statuses, and manage all customer schedules from one view.

---

## Customer Calendar Dashboard

### Requirements
- Show all customer appointments in calendar view
- Display repair schedules and completion dates
- Color-code by status (scheduled, in-progress, completed)
- Click event to view details
- Filter by appointment type
- Mobile-responsive

### Implementation Plan

#### Step 1: Install Calendar Library

The project already has `react-big-calendar` installed. Verify:
```bash
cd client
npm list react-big-calendar
```

If not installed:
```bash
npm install react-big-calendar date-fns
npm install --save-dev @types/react-big-calendar
```

#### Step 2: Create CustomerCalendar Component

**File**: `/client/src/components/CustomerCalendar.tsx`

```typescript
import { useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': require('date-fns/locale/en-US'),
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
    type: 'appointment' | 'repair';
    status: string;
    details: any;
  };
}

interface CustomerCalendarProps {
  appointments: any[];
  repairs?: any[];
  onSelectEvent?: (event: CalendarEvent) => void;
}

export default function CustomerCalendar({
  appointments,
  repairs = [],
  onSelectEvent
}: CustomerCalendarProps) {
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());

  // Transform appointments to calendar events
  const events: CalendarEvent[] = useMemo(() => {
    const appointmentEvents = appointments.map(apt => ({
      id: apt._id,
      title: `${apt.appointmentType.replace('_', ' ')} - ${apt.status}`,
      start: new Date(apt.startTime),
      end: new Date(apt.endTime),
      resource: {
        type: 'appointment' as const,
        status: apt.status,
        details: apt,
      },
    }));

    const repairEvents = repairs
      .filter(repair => repair.estimatedCompletion)
      .map(repair => ({
        id: repair._id,
        title: `Repair: ${repair.currentStep}`,
        start: new Date(repair.estimatedCompletion),
        end: new Date(repair.estimatedCompletion),
        resource: {
          type: 'repair' as const,
          status: repair.status,
          details: repair,
        },
      }));

    return [...appointmentEvents, ...repairEvents];
  }, [appointments, repairs]);

  // Event styling based on type and status
  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#3174ad';

    if (event.resource.type === 'appointment') {
      switch (event.resource.status) {
        case 'scheduled':
          backgroundColor = '#0047AB'; // Blue
          break;
        case 'confirmed':
          backgroundColor = '#28a745'; // Green
          break;
        case 'completed':
          backgroundColor = '#6c757d'; // Gray
          break;
        case 'cancelled':
          backgroundColor = '#dc3545'; // Red
          break;
        case 'in_progress':
          backgroundColor = '#ffc107'; // Yellow
          break;
      }
    } else if (event.resource.type === 'repair') {
      backgroundColor = '#17a2b8'; // Teal for repairs
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>My Calendar</h2>
        <div style={styles.legend}>
          <div style={styles.legendItem}>
            <span style={{ ...styles.legendDot, backgroundColor: '#0047AB' }} />
            <span>Scheduled</span>
          </div>
          <div style={styles.legendItem}>
            <span style={{ ...styles.legendDot, backgroundColor: '#28a745' }} />
            <span>Confirmed</span>
          </div>
          <div style={styles.legendItem}>
            <span style={{ ...styles.legendDot, backgroundColor: '#ffc107' }} />
            <span>In Progress</span>
          </div>
          <div style={styles.legendItem}>
            <span style={{ ...styles.legendDot, backgroundColor: '#17a2b8' }} />
            <span>Repair Schedule</span>
          </div>
        </div>
      </div>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={styles.calendar}
        onSelectEvent={onSelectEvent}
        eventPropGetter={eventStyleGetter}
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        views={['month', 'week', 'day', 'agenda']}
        popup
      />
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  header: {
    marginBottom: '1.5rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    color: '#333',
  },
  legend: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap' as const,
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem',
  },
  legendDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    display: 'inline-block',
  },
  calendar: {
    height: '600px',
  },
};
```

#### Step 3: Add Calendar to Customer Dashboard

**File**: `/client/src/pages/customer/Dashboard.tsx`

Add import:
```typescript
import CustomerCalendar from '../../components/CustomerCalendar';
```

Add state for selected view:
```typescript
const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
```

Add view toggle buttons:
```typescript
<div style={styles.viewToggle}>
  <button
    onClick={() => setViewMode('list')}
    style={{
      ...styles.toggleButton,
      ...(viewMode === 'list' ? styles.activeToggle : {}),
    }}
  >
    List View
  </button>
  <button
    onClick={() => setViewMode('calendar')}
    style={{
      ...styles.toggleButton,
      ...(viewMode === 'calendar' ? styles.activeToggle : {}),
    }}
  >
    Calendar View
  </button>
</div>
```

Conditionally render calendar or list:
```typescript
{viewMode === 'calendar' ? (
  <CustomerCalendar
    appointments={appointments}
    repairs={repairs}
    onSelectEvent={(event) => {
      // Show event details in modal
      if (event.resource.type === 'appointment') {
        setSelectedAppointment(event.resource.details);
      }
    }}
  />
) : (
  // Existing list view
  <div>{/* ... existing appointment list ... */}</div>
)}
```

---

## Enhanced Admin Calendar

### Requirements
- Drag-and-drop appointments
- Click to create new appointment
- Update appointment status from calendar
- Update repair tracking from calendar
- Color-code by status and type
- Filter by employee/technician
- Search appointments
- Export calendar

### Implementation Plan

#### Step 1: Enhance AdminCalendar Component

**File**: `/client/src/pages/admin/AdminCalendar.tsx` (already exists, enhance it)

Add drag-and-drop support:
```typescript
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

const DragAndDropCalendar = withDragAndDrop(Calendar);

// In component:
const handleEventDrop = async ({ event, start, end }: any) => {
  try {
    await updateAppointment(event.id, {
      startTime: start,
      endTime: end,
    });
    // Refresh events
    await fetchAppointments();
  } catch (error) {
    console.error('Failed to update appointment:', error);
  }
};

// In JSX:
<DragAndDropCalendar
  localizer={localizer}
  events={events}
  onEventDrop={handleEventDrop}
  onEventResize={handleEventDrop}
  resizable
  // ... other props
/>
```

#### Step 2: Add Quick Status Update

Add context menu on right-click:
```typescript
const [contextMenu, setContextMenu] = useState<{
  x: number;
  y: number;
  event: any;
} | null>(null);

const handleEventRightClick = (event: any, e: React.MouseEvent) => {
  e.preventDefault();
  setContextMenu({
    x: e.clientX,
    y: e.clientY,
    event,
  });
};

const updateEventStatus = async (newStatus: string) => {
  if (!contextMenu) return;

  try {
    await updateAppointment(contextMenu.event.id, {
      status: newStatus,
    });
    setContextMenu(null);
    await fetchAppointments();
  } catch (error) {
    console.error('Failed to update status:', error);
  }
};

// Context menu UI:
{contextMenu && (
  <div
    style={{
      position: 'fixed',
      top: contextMenu.y,
      left: contextMenu.x,
      backgroundColor: '#fff',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
      borderRadius: '4px',
      zIndex: 1000,
    }}
  >
    <button onClick={() => updateEventStatus('scheduled')}>
      Mark as Scheduled
    </button>
    <button onClick={() => updateEventStatus('confirmed')}>
      Mark as Confirmed
    </button>
    <button onClick={() => updateEventStatus('in_progress')}>
      Mark as In Progress
    </button>
    <button onClick={() => updateEventStatus('completed')}>
      Mark as Completed
    </button>
    <button onClick={() => setContextMenu(null)}>
      Cancel
    </button>
  </div>
)}
```

#### Step 3: Add Quick Appointment Creation

Click on empty slot to create appointment:
```typescript
const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
  setNewAppointment({
    startTime: start,
    endTime: end,
  });
  setShowCreateModal(true);
};

<Calendar
  selectable
  onSelectSlot={handleSelectSlot}
  // ... other props
/>
```

#### Step 4: Add Repair Tracking Integration

Show repair milestones on calendar:
```typescript
const repairEvents = leads
  .filter(lead => lead.repairTracking?.estimatedCompletion)
  .map(lead => ({
    id: lead._id,
    title: `${lead.name} - ${lead.repairTracking.currentStep}`,
    start: new Date(lead.repairTracking.estimatedCompletion),
    end: new Date(lead.repairTracking.estimatedCompletion),
    resource: {
      type: 'repair',
      lead,
    },
  }));
```

Click on repair event to update:
```typescript
const handleSelectEvent = (event: any) => {
  if (event.resource.type === 'repair') {
    setSelectedLead(event.resource.lead);
    setShowRepairUpdateModal(true);
  } else {
    setSelectedAppointment(event.resource.details);
    setShowAppointmentModal(true);
  }
};
```

#### Step 5: Add Employee Filter

Filter appointments by assigned technician:
```typescript
const [selectedEmployee, setSelectedEmployee] = useState<string>('all');

const filteredEvents = events.filter(event => {
  if (selectedEmployee === 'all') return true;
  return event.resource.details.assignedTo?._id === selectedEmployee;
});

// UI:
<select
  value={selectedEmployee}
  onChange={(e) => setSelectedEmployee(e.target.value)}
>
  <option value="all">All Employees</option>
  {employees.map(emp => (
    <option key={emp._id} value={emp._id}>
      {emp.name}
    </option>
  ))}
</select>
```

---

## Additional Features

### 1. Calendar Export (iCal)

Already implemented at:
- Customer: `/api/appointments/my-appointments/export`
- Admin: `/api/appointments/export`

Add download button:
```typescript
const downloadCalendar = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(
    `${API_BASE}/appointments/my-appointments/export`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'my-appointments.ics';
  a.click();
};

// Button:
<button onClick={downloadCalendar}>
  📅 Export to Google/Apple Calendar
</button>
```

### 2. Recurring Appointments

Add support for recurring appointments:
```typescript
interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number; // every X days/weeks/months
  endDate?: Date;
  count?: number; // or after X occurrences
}

// Generate recurring events:
const generateRecurringEvents = (
  baseEvent: any,
  pattern: RecurringPattern
) => {
  const events = [];
  let currentDate = new Date(baseEvent.start);

  // Logic to generate multiple events based on pattern
  // ...

  return events;
};
```

### 3. Calendar Sync with Google/Outlook

Use external calendar APIs:
- Google Calendar API
- Microsoft Graph API (Outlook)

Add sync buttons to admin calendar for each appointment.

### 4. Appointment Reminders

Already implemented in `/server/src/jobs/appointmentReminders.ts`

Visual indicator on calendar for appointments with reminders sent:
```typescript
// In event styling:
if (event.resource.details.reminderSent) {
  // Add indicator
  return {
    style: {
      ...style,
      border: '2px solid #ffc107',
    },
  };
}
```

---

## Mobile Optimization

### Responsive Calendar View

```typescript
import { useMediaQuery } from 'react-responsive';

const isMobile = useMediaQuery({ maxWidth: 768 });

// Adjust calendar view:
const defaultView = isMobile ? 'day' : 'month';
const views = isMobile
  ? ['day', 'agenda']
  : ['month', 'week', 'day', 'agenda'];
```

### Touch-Friendly Controls

```css
/* Add to calendar styles */
.rbc-event {
  padding: 8px;
  min-height: 40px; /* Touch-friendly */
}

.rbc-toolbar button {
  padding: 12px; /* Larger touch targets */
  min-width: 44px;
  min-height: 44px;
}
```

---

## Testing Checklist

### Customer Calendar
- [ ] Appointments display correctly
- [ ] Repair schedules show estimated completion
- [ ] Color-coding by status works
- [ ] Click event opens details
- [ ] Calendar navigates properly (month/week/day)
- [ ] Mobile responsive
- [ ] Export calendar works
- [ ] No appointments shows empty state

### Admin Calendar
- [ ] Drag-and-drop updates appointment times
- [ ] Right-click context menu works
- [ ] Status updates reflect immediately
- [ ] Click empty slot creates appointment
- [ ] Employee filter works
- [ ] Repair milestones display
- [ ] Export works
- [ ] Multiple appointments on same day display correctly

---

## Performance Considerations

### Optimize Event Loading

```typescript
// Paginate events by date range
const [dateRange, setDateRange] = useState({
  start: startOfMonth(new Date()),
  end: endOfMonth(new Date()),
});

// Only fetch appointments in visible range
useEffect(() => {
  fetchAppointments({
    startDate: dateRange.start,
    endDate: dateRange.end,
  });
}, [dateRange]);
```

### Memoize Event Transformations

```typescript
const events = useMemo(() => {
  return appointments.map(apt => ({
    // transformation
  }));
}, [appointments]);
```

---

## Styling Customization

### Match BCS Brand Colors

```css
/* Override react-big-calendar styles */
.rbc-calendar {
  font-family: inherit;
}

.rbc-toolbar button.rbc-active {
  background-color: #0047AB;
}

.rbc-today {
  background-color: #e6f2ff;
}

.rbc-header {
  background-color: #f8f9fa;
  padding: 10px;
  font-weight: bold;
}
```

---

## Deployment Steps

1. Install dependencies:
   ```bash
   cd client
   npm install react-big-calendar date-fns
   npm install react-big-calendar/lib/addons/dragAndDrop
   ```

2. Create CustomerCalendar component

3. Update Customer Dashboard with calendar view toggle

4. Enhance Admin Calendar with drag-and-drop

5. Add quick status update functionality

6. Test on multiple devices

7. Deploy to production

---

## Support & Resources

- React Big Calendar Docs: https://jquense.github.io/react-big-calendar/
- Date-fns Docs: https://date-fns.org/
- Calendar Export API: Already implemented in server
- Appointment Reminders: Already implemented in cron jobs

---

**Implementation Time Estimate**: 6-8 hours
**Difficulty**: Medium
**Dependencies**: react-big-calendar, date-fns
**Backend Changes Required**: Minimal (APIs already exist)

---

Ready to implement! Let me know if you need help with any specific part of the calendar features.
