/**
 * Lead notification email templates
 */

import { wrapEmailTemplate, generatePlainText } from './base';

export function leadNotificationHTML(data: {
  name: string;
  email: string;
  phone: string;
  message: string;
  damageDescription?: string;
  photos?: string[];
}): string {
  const { name, email, phone, message, damageDescription, photos } = data;

  const photosList = photos && photos.length
    ? photos.map(photo => `<li>${photo}</li>`).join('')
    : '<li>No photos uploaded</li>';

  const content = `
    <div class="field">
      <div class="label">Name:</div>
      <div class="value" style="padding: 10px; background-color: #f4f4f4; border-left: 3px solid #3498db;">${name}</div>
    </div>

    <div class="field">
      <div class="label">Email:</div>
      <div class="value" style="padding: 10px; background-color: #f4f4f4; border-left: 3px solid #3498db;">
        <a href="mailto:${email}">${email}</a>
      </div>
    </div>

    <div class="field">
      <div class="label">Phone:</div>
      <div class="value" style="padding: 10px; background-color: #f4f4f4; border-left: 3px solid #3498db;">
        <a href="tel:${phone}">${phone}</a>
      </div>
    </div>

    <div class="field">
      <div class="label">Message:</div>
      <div class="value" style="padding: 10px; background-color: #f4f4f4; border-left: 3px solid #3498db;">${message}</div>
    </div>

    <div class="field">
      <div class="label">Damage Description:</div>
      <div class="value" style="padding: 10px; background-color: #f4f4f4; border-left: 3px solid #3498db;">${damageDescription || 'N/A'}</div>
    </div>

    <div class="field">
      <div class="label">Photos:</div>
      <div class="value" style="padding: 10px; background-color: #f4f4f4; border-left: 3px solid #3498db;">
        <ul style="list-style-type: none; padding-left: 0;">${photosList}</ul>
      </div>
    </div>
  `;

  return wrapEmailTemplate({
    headerTitle: '🚗 New Lead from Website',
    headerIcon: '🚗',
    headerColor: '#2c3e50',
    content,
    footerText: 'This lead was submitted through your website contact form.',
  });
}

export function leadNotificationText(data: {
  name: string;
  email: string;
  phone: string;
  message: string;
  damageDescription?: string;
  photos?: string[];
}): string {
  const { name, email, phone, message, damageDescription, photos } = data;

  return generatePlainText({
    greeting: '🚗 NEW LEAD FROM WEBSITE',
    body: `Name: ${name}
Email: ${email}
Phone: ${phone}

Message:
${message}

Damage Description:
${damageDescription || 'N/A'}

Photos:
${photos && photos.length ? photos.join(', ') : 'No photos uploaded'}`,
  });
}

export function autoReplyHTML(name: string): string {
  const content = `
    <p>Hi <strong>${name}</strong>,</p>

    <p>Thanks for reaching out! We've received your request and will get back to you shortly.</p>

    <p>Our team will review your information and contact you within 24 hours.</p>

    <p>If you have any urgent questions, feel free to reply to this email.</p>

    <p style="margin-top: 30px;">Best regards,<br><strong>Bellevue Collision Services</strong></p>
  `;

  return wrapEmailTemplate({
    headerTitle: 'We received your request!',
    headerIcon: '✅',
    headerColor: '#27ae60',
    content,
    footerText: 'This is an automated confirmation email.',
  });
}

export function autoReplyText(name: string): string {
  return generatePlainText({
    greeting: `Hi ${name},`,
    body: `Thanks for reaching out! We've received your request and will get back to you shortly.

Our team will review your information and contact you within 24 hours.`,
  });
}
