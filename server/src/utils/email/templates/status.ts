/**
 * Status update email templates
 */

import { wrapEmailTemplate, generatePlainText } from './base';

const statusStyles = `
  .status-box { background-color: #f4f4f4; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #0047AB; }
  .status-change { display: flex; align-items: center; justify-content: center; margin: 15px 0; font-size: 18px; font-weight: bold; }
  .old-status { color: #999; text-decoration: line-through; }
  .arrow { margin: 0 15px; color: #0047AB; }
  .new-status { color: #27ae60; }
  .message { background-color: #e8f5e9; padding: 15px; border-radius: 5px; border-left: 4px solid #27ae60; margin: 20px 0; }
  .progress-box { background-color: #e3f2fd; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2196f3; }
  .notes-box { background-color: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0; }
  .contact-info { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
  .button-primary { background: linear-gradient(135deg, #FFD700 0%, #FFC700 100%); color: #0047AB; }
`;

const statusEmojis: Record<string, string> = {
  'new': '📝',
  'contacted': '📞',
  'in_progress': '🔧',
  'completed': '✅',
  'cancelled': '❌',
};

const statusMessages: Record<string, string> = {
  'new': 'Your service request has been received and is awaiting review.',
  'contacted': 'We\'ve reviewed your request and will be in touch soon!',
  'in_progress': 'Great news! We\'ve started working on your vehicle.',
  'completed': 'Your vehicle is ready for pickup! Give us a call to schedule.',
  'cancelled': 'This service request has been cancelled. Contact us if you have questions.',
};

export function statusUpdateHTML(details: {
  customerName: string;
  serviceType: string;
  submittedDate: string;
  oldStatus: string;
  newStatus: string;
  dashboardUrl: string;
  smtpUser: string;
}): string {
  const { customerName, serviceType, submittedDate, oldStatus, newStatus, dashboardUrl, smtpUser } = details;

  const emoji = statusEmojis[newStatus] || '📋';
  const statusMessage = statusMessages[newStatus] || 'Your service request status has been updated.';

  const content = `
    <p>Hi <strong>${customerName}</strong>,</p>

    <p>We wanted to update you on your service request.</p>

    <div class="status-box">
      <h3 style="margin-top: 0; color: #0047AB;">Request Details</h3>

      <div class="field">
        <span class="label">Service Type:</span>
        <span class="value">${serviceType}</span>
      </div>

      <div class="field">
        <span class="label">Submitted:</span>
        <span class="value">${submittedDate}</span>
      </div>

      <div class="status-change">
        <span class="old-status">${oldStatus}</span>
        <span class="arrow">→</span>
        <span class="new-status">${newStatus}</span>
      </div>
    </div>

    <div class="message">
      <strong>What this means:</strong><br>
      ${statusMessage}
    </div>

    <p style="text-align: center;">
      <a href="${dashboardUrl}" class="button button-primary">View Full Details</a>
    </p>

    <div class="contact-info">
      <strong>Questions? Contact us:</strong><br>
      📞 Phone: <a href="tel:+14253730308">(425) 373-0308</a><br>
      📧 Email: <a href="mailto:${smtpUser}">${smtpUser}</a>
    </div>
  `;

  return wrapEmailTemplate({
    headerTitle: 'Service Request Update',
    headerIcon: emoji,
    headerColor: '#0047AB',
    content,
    footerText: 'You\'re receiving this email because you submitted a service request on our website.',
    customStyles: statusStyles,
  });
}

export function statusUpdateText(details: {
  customerName: string;
  serviceType: string;
  submittedDate: string;
  oldStatus: string;
  newStatus: string;
  dashboardUrl: string;
  smtpUser: string;
}): string {
  const { customerName, serviceType, submittedDate, oldStatus, newStatus, dashboardUrl, smtpUser } = details;

  const emoji = statusEmojis[newStatus] || '📋';
  const statusMessage = statusMessages[newStatus] || 'Your service request status has been updated.';

  return generatePlainText({
    greeting: `Hi ${customerName},`,
    body: `We wanted to update you on your service request.

Service Request Details:
━━━━━━━━━━━━━━━━━━━━
Service Type: ${serviceType}
Submitted: ${submittedDate}
Previous Status: ${oldStatus}
New Status: ${newStatus}

${statusMessage}

You can view complete details and track your repair progress by logging into your account:
${dashboardUrl}

If you have any questions, please don't hesitate to contact us:
📞 Phone: (425) 373-0308
📧 Email: ${smtpUser}`,
  });
}

export function repairTrackingUpdateHTML(details: {
  customerName: string;
  serviceType: string;
  currentStep: string;
  estimatedCompletion: string;
  notes: string;
  dashboardUrl: string;
  smtpUser: string;
}): string {
  const { customerName, serviceType, currentStep, estimatedCompletion, notes, dashboardUrl, smtpUser } = details;

  const content = `
    <p>Hi <strong>${customerName}</strong>,</p>

    <p>We have an update on your vehicle repair!</p>

    <div class="progress-box">
      <h3 style="margin-top: 0; color: #0047AB;">Current Status</h3>

      <div class="field">
        <span class="label">Service:</span>
        <div class="value" style="background-color: #f9f9f9; padding: 10px; border-radius: 3px; margin-top: 5px;">${serviceType}</div>
      </div>

      <div class="field">
        <span class="label">Current Step:</span>
        <div class="value" style="background-color: #f9f9f9; padding: 10px; border-radius: 3px; margin-top: 5px;"><strong>${currentStep}</strong></div>
      </div>

      <div class="field">
        <span class="label">Estimated Completion:</span>
        <div class="value" style="background-color: #f9f9f9; padding: 10px; border-radius: 3px; margin-top: 5px;">${estimatedCompletion}</div>
      </div>
    </div>

    <div class="notes-box">
      <strong style="color: #f57c00;">📝 Progress Notes:</strong><br><br>
      ${notes}
    </div>

    <p style="text-align: center;">
      <a href="${dashboardUrl}" class="button button-primary">View Full Details</a>
    </p>

    <div class="contact-info">
      <strong>Questions about your repair?</strong><br>
      📞 Phone: <a href="tel:+14253730308">(425) 373-0308</a><br>
      📧 Email: <a href="mailto:${smtpUser}">${smtpUser}</a>
    </div>
  `;

  return wrapEmailTemplate({
    headerTitle: 'Repair Progress Update',
    headerIcon: '🔧',
    headerColor: '#0047AB',
    content,
    footerText: 'You\'re receiving this email because we\'re working on your vehicle repair.',
    customStyles: statusStyles,
  });
}

export function repairTrackingUpdateText(details: {
  customerName: string;
  serviceType: string;
  currentStep: string;
  estimatedCompletion: string;
  notes: string;
  dashboardUrl: string;
  smtpUser: string;
}): string {
  const { customerName, serviceType, currentStep, estimatedCompletion, notes, dashboardUrl, smtpUser } = details;

  return generatePlainText({
    greeting: `Hi ${customerName},`,
    body: `We have an update on your vehicle repair!

Current Repair Status:
━━━━━━━━━━━━━━━━━━━━
Service: ${serviceType}
Current Step: ${currentStep}
Estimated Completion: ${estimatedCompletion}

Progress Notes:
${notes}

You can view complete details and photos by logging into your account:
${dashboardUrl}

If you have any questions about the repair process, please don't hesitate to reach out:
📞 Phone: (425) 373-0308
📧 Email: ${smtpUser}`,
  });
}
