/**
 * Authentication email templates (signup, welcome, password reset)
 */

import { wrapEmailTemplate, generatePlainText } from './base';

const customStyles = `
  .button-primary { background: linear-gradient(135deg, #FFD700 0%, #FFC700 100%); color: #0047AB; }
  .button-primary:hover { background: linear-gradient(135deg, #E5C100 0%, #D4B000 100%); }
  .features { background-color: #f4f4f4; padding: 20px; border-radius: 5px; margin: 20px 0; }
  .feature-item { padding: 8px 0; }
  .feature-item:before { content: "✓ "; color: #27ae60; font-weight: bold; }
  .warning { background-color: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0; }
`;

export function signupInviteHTML(params: {
  name: string;
  signupLink: string;
}): string {
  const { name, signupLink } = params;

  const content = `
    <p>Hi <strong>${name}</strong>,</p>

    <p>Thank you for submitting your repair request to <strong>Bellevue Collision Services</strong>! While we work on your estimate, we've created an account for you to track your repair progress online.</p>

    <div class="features">
      <h3 style="margin-top: 0;">Your Account Benefits:</h3>
      <div class="feature-item">View real-time repair status updates</div>
      <div class="feature-item">Track parts shipping status</div>
      <div class="feature-item">See estimated completion dates</div>
      <div class="feature-item">Receive progress notifications from our team</div>
    </div>

    <p style="text-align: center;">
      <a href="${signupLink}" class="button button-primary">Complete Account Setup</a>
    </p>

    <p style="font-size: 0.9em; color: #666;">This link will expire in 7 days. If you need a new link, please contact us.</p>

    <p>If you have any questions, feel free to contact us at <strong>(425) 373-0308</strong>.</p>
  `;

  return wrapEmailTemplate({
    headerTitle: 'Track Your Repair Progress',
    headerIcon: '🔧',
    headerColor: '#0047AB',
    content,
    footerText: 'This email was sent because you submitted a repair request on our website.',
    customStyles,
  });
}

export function signupInviteText(params: {
  name: string;
  signupLink: string;
}): string {
  const { name, signupLink } = params;

  return generatePlainText({
    greeting: `Hi ${name},`,
    body: `Thank you for submitting your repair request to Bellevue Collision Services! While we work on your estimate, we've created an account for you to track your repair progress online.

Complete your account setup to:
• View real-time repair status updates
• Track parts shipping status
• See estimated completion dates
• Receive progress notifications

Click here to set up your password and access your dashboard:
${signupLink}

This link will expire in 7 days.

If you have any questions, feel free to contact us at (425) 373-0308.`,
  });
}

export function welcomeEmailHTML(params: {
  name: string;
  loginUrl: string;
}): string {
  const { name, loginUrl } = params;

  const content = `
    <p>Hi <strong>${name}</strong>,</p>

    <p>Welcome to <strong>Bellevue Collision Services</strong>! We're thrilled to have you as part of our family.</p>

    <p>Your account has been created successfully. You can now track any repair requests you submit through our website.</p>

    <div class="features">
      <h3 style="margin-top: 0;">Your Account Features:</h3>
      <div class="feature-item">Submit repair requests online</div>
      <div class="feature-item">Track repair progress in real-time</div>
      <div class="feature-item">View parts shipping status</div>
      <div class="feature-item">See estimated completion dates</div>
      <div class="feature-item">Receive updates from our team</div>
    </div>

    <p style="text-align: center;">
      <a href="${loginUrl}" class="button button-primary">Log In to Your Account</a>
    </p>

    <p>If you have any questions or need assistance, don't hesitate to contact us at <strong>(425) 373-0308</strong>.</p>

    <p style="margin-top: 30px;">We look forward to serving you!<br><br><strong>Bellevue Collision Services</strong></p>
  `;

  return wrapEmailTemplate({
    headerTitle: 'Welcome to the BCS Family!',
    headerIcon: '🎉',
    headerColor: '#0047AB',
    content,
    footerText: 'You\'re receiving this email because you created an account on our website.',
    customStyles,
  });
}

export function welcomeEmailText(params: {
  name: string;
  loginUrl: string;
}): string {
  const { name, loginUrl } = params;

  return generatePlainText({
    greeting: `Hi ${name},`,
    body: `Welcome to Bellevue Collision Services! We're thrilled to have you as part of our family.

Your account has been created successfully. You can now log in to track any repair requests you submit through our website.

What you can do with your account:
• Submit repair requests online
• Track repair progress in real-time
• View parts shipping status
• See estimated completion dates
• Receive updates from our team

Visit our website to log in: ${loginUrl}

If you have any questions or need assistance, don't hesitate to contact us at (425) 373-0308.

We look forward to serving you!`,
  });
}

export function passwordResetHTML(params: {
  name: string;
  resetLink: string;
}): string {
  const { name, resetLink } = params;

  const content = `
    <p>Hi <strong>${name}</strong>,</p>

    <p>We received a request to reset your password for your Bellevue Collision Services account.</p>

    <p style="text-align: center;">
      <a href="${resetLink}" class="button button-primary">Reset Password</a>
    </p>

    <div class="warning">
      <strong>⏱️ Important:</strong> This link will expire in <strong>1 hour</strong> for security reasons.
    </div>

    <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>

    <p style="margin-top: 30px;">Best regards,<br><strong>Bellevue Collision Services</strong></p>
  `;

  return wrapEmailTemplate({
    headerTitle: 'Password Reset Request',
    headerIcon: '🔒',
    headerColor: '#0047AB',
    content,
    footerText: 'This is an automated email. Please do not reply to this message.',
    customStyles,
  });
}

export function passwordResetText(params: {
  name: string;
  resetLink: string;
}): string {
  const { name, resetLink } = params;

  return generatePlainText({
    greeting: `Hi ${name},`,
    body: `We received a request to reset your password for your Bellevue Collision Services account.

Click the link below to reset your password:
${resetLink}

This link will expire in 1 hour for security reasons.

If you didn't request this password reset, please ignore this email. Your password will remain unchanged.`,
  });
}
