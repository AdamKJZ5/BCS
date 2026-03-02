/**
 * Appointment-related email templates
 */

import { wrapEmailTemplate, generatePlainText } from './base';

const appointmentStyles = `
  .appointment-box { background-color: #e3f2fd; padding: 25px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2196f3; }
  .appointment-card { background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 5px solid #0047AB; }
  .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; }
  .detail-row:last-child { border-bottom: none; }
  .detail-label { font-weight: bold; color: #555; }
  .detail-value { color: #0047AB; font-weight: 600; }
  .location-box { background-color: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0; }
  .checklist { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
  .checklist-item { padding: 5px 0; }
  .checklist-item:before { content: "✓ "; color: #27ae60; font-weight: bold; margin-right: 8px; }
  .button-primary { background: linear-gradient(135deg, #FFD700 0%, #FFC700 100%); color: #0047AB; }
  .button-secondary { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: #fff; }
  .reminder-badge { display: inline-block; background-color: #FFD700; color: #0047AB; padding: 8px 20px; border-radius: 20px; font-weight: bold; margin-top: 10px; font-size: 16px; }
  .warning-box { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0; }
`;

interface AppointmentDetails {
  customerName: string;
  dateStr: string;
  timeStr: string;
  typeLabel: string;
  techName?: string;
  vehicleInfo?: string;
  description?: string;
  dashboardUrl: string;
}

export function appointmentConfirmationHTML(details: AppointmentDetails): string {
  const { customerName, dateStr, timeStr, typeLabel, techName, vehicleInfo, description, dashboardUrl } = details;

  const content = `
    <p>Hi <strong>${customerName}</strong>,</p>

    <p>Your appointment has been <strong style="color: #27ae60;">confirmed</strong>!</p>

    <div class="appointment-box">
      <h3 style="margin-top: 0; color: #0047AB;">Appointment Details</h3>

      <div class="field" style="font-size: 16px; margin-bottom: 12px;">
        <span class="label">📆 Date:</span>
        <span style="margin-left: 8px;"><strong>${dateStr}</strong></span>
      </div>

      <div class="field" style="font-size: 16px; margin-bottom: 12px;">
        <span class="label">🕐 Time:</span>
        <span style="margin-left: 8px;"><strong>${timeStr}</strong></span>
      </div>

      <div class="field" style="font-size: 16px; margin-bottom: 12px;">
        <span class="label">📋 Type:</span>
        <span style="margin-left: 8px;">${typeLabel}</span>
      </div>

      ${techName ? `<div class="field" style="font-size: 16px; margin-bottom: 12px;">
        <span class="label">👤 Technician:</span>
        <span style="margin-left: 8px;">${techName}</span>
      </div>` : ''}

      ${vehicleInfo ? `<div class="field" style="font-size: 16px; margin-bottom: 12px;">
        <span class="label">🚗 Vehicle:</span>
        <span style="margin-left: 8px;">${vehicleInfo}</span>
      </div>` : ''}
    </div>

    <div class="location-box">
      <strong style="color: #f57c00;">📍 Location:</strong><br>
      Bellevue Collision Services<br>
      13434 SE 27th Pl, Bellevue WA 98005<br>
      📞 Phone: <a href="tel:+14253730308">(425) 373-0308</a>
    </div>

    <div class="checklist">
      <strong style="color: #0047AB;">📝 What to bring:</strong>
      <div class="checklist-item">Vehicle registration</div>
      <div class="checklist-item">Insurance information (if applicable)</div>
      <div class="checklist-item">List of concerns or damage details</div>
    </div>

    ${description ? `<div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <strong>Notes:</strong><br>
      ${description}
    </div>` : ''}

    <p style="text-align: center;">
      <a href="${dashboardUrl}" class="button button-primary">View in Dashboard</a>
    </p>

    <p style="font-size: 14px; color: #666; padding: 15px; background-color: #f9f9f9; border-radius: 5px;">
      <strong>Need to reschedule or cancel?</strong><br>
      Please visit your dashboard or call us at least <strong>24 hours in advance</strong>.
    </p>

    <p style="margin-top: 30px;">We look forward to seeing you!<br><br><strong>Bellevue Collision Services</strong></p>
  `;

  return wrapEmailTemplate({
    headerTitle: 'Appointment Confirmed!',
    headerIcon: '📅',
    headerColor: '#0047AB',
    content,
    footerText: 'You\'re receiving this email because you scheduled an appointment with us.',
    customStyles: appointmentStyles,
  });
}

export function appointmentConfirmationText(details: AppointmentDetails): string {
  const { customerName, dateStr, timeStr, typeLabel, techName, vehicleInfo, description } = details;

  return generatePlainText({
    greeting: `Hi ${customerName},`,
    body: `Your appointment has been confirmed!

Appointment Details:
━━━━━━━━━━━━━━━━━━━━
Date: ${dateStr}
Time: ${timeStr}
Type: ${typeLabel}
${techName ? `Technician: ${techName}` : ''}
${vehicleInfo ? `Vehicle: ${vehicleInfo}` : ''}

Location:
Bellevue Collision Services
13434 SE 27th Pl, Bellevue WA 98005
Phone: (425) 373-0308

What to bring:
• Vehicle registration
• Insurance information (if applicable)
• List of concerns or damage details

${description ? `Notes:\n${description}\n\n` : ''}Need to reschedule or cancel? Please visit your dashboard or call us at least 24 hours in advance.

We look forward to seeing you!`,
  });
}

export function appointmentReminderHTML(details: {
  customerName: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: string;
  duration: number;
  techName?: string;
  vehicleInfo?: string;
  dashboardUrl: string;
}): string {
  const { customerName, appointmentDate, appointmentTime, appointmentType, duration, techName, vehicleInfo, dashboardUrl } = details;

  const content = `
    <p style="font-size: 16px;">Hi <strong>${customerName}</strong>,</p>

    <p>This is a friendly reminder about your upcoming appointment <strong>tomorrow</strong>!</p>

    <div class="appointment-card">
      <h2 style="margin-top: 0; color: #0047AB;">📅 ${appointmentType}</h2>

      <div class="detail-row">
        <span class="detail-label">Date:</span>
        <span class="detail-value">${appointmentDate}</span>
      </div>

      <div class="detail-row">
        <span class="detail-label">Time:</span>
        <span class="detail-value">${appointmentTime}</span>
      </div>

      <div class="detail-row">
        <span class="detail-label">Duration:</span>
        <span class="detail-value">${duration} minutes</span>
      </div>

      ${techName ? `<div class="detail-row">
        <span class="detail-label">Technician:</span>
        <span class="detail-value">${techName}</span>
      </div>` : ''}

      ${vehicleInfo ? `<div class="detail-row">
        <span class="detail-label">Vehicle:</span>
        <span class="detail-value">${vehicleInfo}</span>
      </div>` : ''}

      <div class="detail-row">
        <span class="detail-label">Location:</span>
        <span class="detail-value">13434 SE 27th Pl, Bellevue WA 98005</span>
      </div>
    </div>

    <div class="checklist" style="background-color: #e8f4f8; padding: 20px;">
      <h3 style="color: #0047AB; margin-top: 0;">✓ What to Bring:</h3>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li style="padding: 5px 0;">Vehicle registration</li>
        <li style="padding: 5px 0;">Insurance information</li>
        <li style="padding: 5px 0;">List of any concerns or questions</li>
      </ul>
    </div>

    <div class="warning-box">
      <strong>⚠️ Need to Reschedule?</strong><br>
      If you need to reschedule or cancel, please let us know at least <strong>24 hours in advance</strong> by calling <strong>(425) 373-0308</strong> or visiting your dashboard.
    </div>

    <p style="text-align: center;">
      <a href="${dashboardUrl}" class="button button-primary">View in Dashboard</a>
      <a href="tel:+14253730308" class="button button-secondary">Call Us</a>
    </p>

    <p style="margin-top: 30px;">We look forward to seeing you tomorrow!<br><br><strong>Bellevue Collision Services Team</strong></p>
  `;

  return wrapEmailTemplate({
    headerTitle: 'Appointment Reminder',
    headerIcon: '⏰',
    headerColor: '#0047AB',
    content,
    footerText: 'You\'re receiving this reminder because you have an appointment scheduled with us.',
    customStyles: appointmentStyles,
  });
}

export function appointmentReminderText(details: {
  customerName: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: string;
  duration: number;
  techName?: string;
  vehicleInfo?: string;
}): string {
  const { customerName, appointmentDate, appointmentTime, appointmentType, duration, techName, vehicleInfo } = details;

  return generatePlainText({
    greeting: `Hi ${customerName},`,
    body: `This is a friendly reminder about your upcoming appointment tomorrow!

Appointment Details:
━━━━━━━━━━━━━━━━━━━━
Type: ${appointmentType}
Date: ${appointmentDate}
Time: ${appointmentTime}
Duration: ${duration} minutes
Location: 13434 SE 27th Pl, Bellevue WA 98005

${techName ? `Technician: ${techName}\n` : ''}${vehicleInfo ? `Vehicle: ${vehicleInfo}\n` : ''}
What to Bring:
✓ Vehicle registration
✓ Insurance information
✓ List of any concerns or questions

Need to Reschedule?
If you need to reschedule or cancel, please let us know at least 24 hours in advance by calling (425) 373-0308 or visiting your dashboard.

We look forward to seeing you tomorrow!`,
  });
}

export function appointmentFollowUpHTML(details: {
  customerName: string;
  formattedDate: string;
  appointmentType: string;
  techName?: string;
  vehicleInfo?: string;
  dashboardUrl: string;
}): string {
  const { customerName, formattedDate, appointmentType, techName, vehicleInfo, dashboardUrl } = details;

  const content = `
    <p>Hi <strong>${customerName}</strong>,</p>

    <p>Thank you for choosing Bellevue Collision Services! We hope you're satisfied with the <strong>${appointmentType}</strong> service we provided on <strong>${formattedDate}</strong>.</p>

    <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 5px solid #28a745;">
      <h3 style="color: #28a745; margin-top: 0;">✅ Service Completed</h3>
      <p><strong>Service Type:</strong> ${appointmentType}</p>
      <p><strong>Completion Date:</strong> ${formattedDate}</p>
      ${techName ? `<p><strong>Technician:</strong> ${techName}</p>` : ''}
      ${vehicleInfo ? `<p><strong>Vehicle:</strong> ${vehicleInfo}</p>` : ''}
    </div>

    <div style="background-color: #e8f4f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #0047AB; margin-top: 0;">⭐ How Did We Do?</h3>
      <div style="font-size: 32px; text-align: center; margin: 15px 0;">⭐⭐⭐⭐⭐</div>
      <p>We'd love to hear about your experience:</p>
      <ul>
        <li>Was your vehicle ready on time?</li>
        <li>Are you satisfied with the quality of work?</li>
        <li>Was our team helpful and professional?</li>
      </ul>
    </div>

    <p style="text-align: center;">
      <a href="${dashboardUrl}" class="button button-primary">Share Feedback</a>
      <a href="tel:+14253730308" class="button button-secondary">Call Us</a>
    </p>

    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <strong>💬 Leave Us a Review!</strong><br>
      If you're happy with our service, we'd greatly appreciate it if you could leave us a review online. Your review helps other customers find quality collision repair services!
    </div>

    <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <strong>🔧 Need Follow-up Service?</strong><br>
      If you notice any issues or have questions about the work performed, don't hesitate to reach out. We stand behind our work and want to ensure you're completely satisfied!
    </div>

    <p style="margin-top: 30px;">Thank you for trusting us with your vehicle!<br><br><strong>Bellevue Collision Services Team</strong></p>
  `;

  return wrapEmailTemplate({
    headerTitle: 'Thank You!',
    headerIcon: '🎉',
    headerColor: '#0047AB',
    content,
    footerText: 'You\'re receiving this follow-up because you recently used our services.',
    customStyles: appointmentStyles,
  });
}

export function appointmentFollowUpText(details: {
  customerName: string;
  formattedDate: string;
  appointmentType: string;
  techName?: string;
  vehicleInfo?: string;
}): string {
  const { customerName, formattedDate, appointmentType, techName, vehicleInfo } = details;

  return generatePlainText({
    greeting: `Hi ${customerName},`,
    body: `Thank you for choosing Bellevue Collision Services!

We hope you're satisfied with the ${appointmentType} service we provided on ${formattedDate}.

Your feedback matters to us! We'd love to hear about your experience:

⭐ How did we do?
- Was your vehicle ready on time?
- Are you satisfied with the quality of work?
- Was our team helpful and professional?

Help us improve by sharing your thoughts:
📧 Email us at info@bellevuecollisionservices.com
📞 Call us at (425) 373-0308
💻 Visit your dashboard to submit feedback

Leave Us a Review:
If you're happy with our service, we'd greatly appreciate it if you could leave us a review online. Your review helps other customers find quality collision repair services!

Need Follow-up Service?
If you notice any issues or have questions about the work performed, don't hesitate to reach out. We stand behind our work and want to ensure you're completely satisfied.

Thank you for trusting us with your vehicle!`,
  });
}
