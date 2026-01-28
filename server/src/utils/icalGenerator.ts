/**
 * iCal (.ics) file generation utility for appointment calendar export
 * Supports both single appointment export and full calendar export
 */

interface ICalAppointment {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  attendeeEmail?: string;
  attendeeName?: string;
  organizerEmail: string;
  organizerName: string;
  status: string;
}

/**
 * Formats a date to iCal format: YYYYMMDDTHHmmssZ
 */
function formatICalDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Escapes special characters in iCal text fields
 */
function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "");
}

/**
 * Folds long lines to 75 characters as per RFC 5545
 */
function foldLine(line: string): string {
  if (line.length <= 75) {
    return line;
  }

  const lines: string[] = [];
  let currentLine = line.substring(0, 75);
  let remaining = line.substring(75);

  lines.push(currentLine);

  while (remaining.length > 0) {
    currentLine = " " + remaining.substring(0, 74);
    remaining = remaining.substring(74);
    lines.push(currentLine);
  }

  return lines.join("\r\n");
}

/**
 * Generates a single VEVENT component for an appointment
 */
function generateVEvent(appointment: ICalAppointment): string {
  const lines: string[] = [];

  lines.push("BEGIN:VEVENT");
  lines.push(`UID:${appointment.id}@bellevuecollision.com`);
  lines.push(`DTSTAMP:${formatICalDate(new Date())}`);
  lines.push(`DTSTART:${formatICalDate(appointment.startTime)}`);
  lines.push(`DTEND:${formatICalDate(appointment.endTime)}`);
  lines.push(`SUMMARY:${escapeICalText(appointment.title)}`);

  if (appointment.description) {
    lines.push(`DESCRIPTION:${escapeICalText(appointment.description)}`);
  }

  if (appointment.location) {
    lines.push(`LOCATION:${escapeICalText(appointment.location)}`);
  }

  // Add organizer (business)
  lines.push(`ORGANIZER;CN="${escapeICalText(appointment.organizerName)}":mailto:${appointment.organizerEmail}`);

  // Add attendee (customer)
  if (appointment.attendeeEmail && appointment.attendeeName) {
    lines.push(`ATTENDEE;CN="${escapeICalText(appointment.attendeeName)}";RSVP=TRUE:mailto:${appointment.attendeeEmail}`);
  }

  // Map appointment status to iCal status
  const statusMap: Record<string, string> = {
    scheduled: "TENTATIVE",
    confirmed: "CONFIRMED",
    in_progress: "CONFIRMED",
    completed: "CONFIRMED",
    cancelled: "CANCELLED",
  };
  lines.push(`STATUS:${statusMap[appointment.status] || "TENTATIVE"}`);

  // Add alarm for 1 day before
  lines.push("BEGIN:VALARM");
  lines.push("TRIGGER:-P1D");
  lines.push("ACTION:DISPLAY");
  lines.push(`DESCRIPTION:Reminder: ${escapeICalText(appointment.title)}`);
  lines.push("END:VALARM");

  lines.push("END:VEVENT");

  return lines.map(foldLine).join("\r\n");
}

/**
 * Generates a complete iCal file for one or more appointments
 */
export function generateICalFile(appointments: ICalAppointment[]): string {
  const lines: string[] = [];

  // Calendar header
  lines.push("BEGIN:VCALENDAR");
  lines.push("VERSION:2.0");
  lines.push("PRODID:-//Bellevue Collision Services//Appointment Calendar//EN");
  lines.push("CALSCALE:GREGORIAN");
  lines.push("METHOD:PUBLISH");
  lines.push("X-WR-CALNAME:Bellevue Collision Appointments");
  lines.push("X-WR-TIMEZONE:America/Los_Angeles");

  // Add timezone definition
  lines.push("BEGIN:VTIMEZONE");
  lines.push("TZID:America/Los_Angeles");
  lines.push("BEGIN:STANDARD");
  lines.push("DTSTART:19701101T020000");
  lines.push("RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU");
  lines.push("TZOFFSETFROM:-0700");
  lines.push("TZOFFSETTO:-0800");
  lines.push("END:STANDARD");
  lines.push("BEGIN:DAYLIGHT");
  lines.push("DTSTART:19700308T020000");
  lines.push("RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU");
  lines.push("TZOFFSETFROM:-0800");
  lines.push("TZOFFSETTO:-0700");
  lines.push("END:DAYLIGHT");
  lines.push("END:VTIMEZONE");

  // Add each appointment as VEVENT
  for (const appointment of appointments) {
    lines.push(generateVEvent(appointment));
  }

  // Calendar footer
  lines.push("END:VCALENDAR");

  return lines.join("\r\n");
}

/**
 * Generates an iCal file for a single appointment
 */
export function generateSingleAppointmentICalFile(appointment: ICalAppointment): string {
  return generateICalFile([appointment]);
}
