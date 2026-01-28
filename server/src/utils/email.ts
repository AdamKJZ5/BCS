
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function sendLeadEmail({
  name,
  email,
  phone,
  message,
  damageDescription,
  photos
}: {
  name: string;
  email: string;
  phone: string;
  message: string;
  damageDescription?: string;
  photos?: string[];
 }) {
  try {
    const photosList = photos && photos.length
      ? photos.map(photo => `<li>${photo}</li>`).join("")
      : "<li>No photos uploaded</li>";

    await transporter.sendMail({
      from: `"Auto Body Website" <${process.env.SMTP_USER}>`,
      to: process.env.OWNER_EMAIL,
      subject: "🚗 New Lead from Website",
      text: `
Name: ${name}
Email: ${email}
Phone: ${phone}

Message:
${message}

Damage Description:
${damageDescription || "N/A"}

Photos:
${photos && photos.length ? photos.join(", ") : "No photos uploaded"}
      `,
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
    .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background-color: white; padding: 30px; border-radius: 0 0 5px 5px; }
    .field { margin-bottom: 20px; }
    .label { font-weight: bold; color: #2c3e50; margin-bottom: 5px; }
    .value { padding: 10px; background-color: #f4f4f4; border-left: 3px solid #3498db; }
    .footer { text-align: center; margin-top: 20px; color: #7f8c8d; font-size: 12px; }
    ul { list-style-type: none; padding-left: 0; }
    li { padding: 5px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>🚗 New Lead from Website</h2>
    </div>
    <div class="content">
      <div class="field">
        <div class="label">Name:</div>
        <div class="value">${name}</div>
      </div>

      <div class="field">
        <div class="label">Email:</div>
        <div class="value"><a href="mailto:${email}">${email}</a></div>
      </div>

      <div class="field">
        <div class="label">Phone:</div>
        <div class="value"><a href="tel:${phone}">${phone}</a></div>
      </div>

      <div class="field">
        <div class="label">Message:</div>
        <div class="value">${message}</div>
      </div>

      <div class="field">
        <div class="label">Damage Description:</div>
        <div class="value">${damageDescription || "N/A"}</div>
      </div>

      <div class="field">
        <div class="label">Photos:</div>
        <div class="value">
          <ul>${photosList}</ul>
        </div>
      </div>
    </div>
    <div class="footer">
      <p>This lead was submitted through your website contact form.</p>
    </div>
  </div>
</body>
</html>
      `
    });
  } catch (err) {
    console.error("❌ Failed to send owner email:", err);
  }
}

export function sendLeadEmailSafe(data: {
  name: string;
  email: string;
  phone: string;
  message: string;
  damageDescription?: string;
  photos?: string[];
}) {
  void sendLeadEmail(data);
}

export async function sendAutoReplySafe(
  to: string,
  name: string
) {
  try {
    await transporter.sendMail({
      to,
      from: `"Bellevue Collision Services" <${process.env.SMTP_USER}>`,
      subject: "✅ We received your request",
      text: `Hi ${name},

Thanks for reaching out! We've received your request and will get back to you shortly.

Our team will review your information and contact you within 24 hours.

– Bellevue Collision Services`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
    .header { background-color: #27ae60; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background-color: white; padding: 30px; border-radius: 0 0 5px 5px; }
    .footer { text-align: center; margin-top: 20px; color: #7f8c8d; font-size: 12px; }
    .checkmark { font-size: 48px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="checkmark">✅</div>
      <h2>We received your request!</h2>
    </div>
    <div class="content">
      <p>Hi <strong>${name}</strong>,</p>

      <p>Thanks for reaching out! We've received your request and will get back to you shortly.</p>

      <p>Our team will review your information and contact you within 24 hours.</p>

      <p>If you have any urgent questions, feel free to reply to this email.</p>

      <p style="margin-top: 30px;">Best regards,<br><strong>Bellevue Collision Services</strong></p>
    </div>
    <div class="footer">
      <p>This is an automated confirmation email.</p>
    </div>
  </div>
</body>
</html>
      `
    });
  } catch (err) {
    console.error("❌ Failed to send auto-reply:", err);
  }
}

export async function sendSignupInviteEmail(
  to: string,
  name: string,
  signupToken: string,
  frontendUrl: string
) {
  try {
    const signupLink = `${frontendUrl}/customer/complete-signup?token=${signupToken}`;

    await transporter.sendMail({
      to,
      from: `"Bellevue Collision Services" <${process.env.SMTP_USER}>`,
      subject: "🔧 Track Your Repair Progress - Complete Your Account Setup",
      text: `Hi ${name},

Thank you for submitting your repair request to Bellevue Collision Services! While we work on your estimate, we've created an account for you to track your repair progress online.

Complete your account setup to:
• View real-time repair status updates
• Track parts shipping status
• See estimated completion dates
• Receive progress notifications

Click here to set up your password and access your dashboard:
${signupLink}

This link will expire in 7 days.

If you have any questions, feel free to contact us at (425) 373-0308.

Best regards,
Bellevue Collision Services Team`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
    .header { background-color: #0047AB; color: white; padding: 30px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background-color: white; padding: 30px; border-radius: 0 0 5px 5px; }
    .button { display: inline-block; padding: 15px 30px; background-color: #FFD700; color: #0047AB; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
    .features { background-color: #f4f4f4; padding: 20px; border-radius: 5px; margin: 20px 0; }
    .feature-item { padding: 8px 0; }
    .feature-item:before { content: "✓ "; color: #27ae60; font-weight: bold; }
    .footer { text-align: center; margin-top: 20px; color: #7f8c8d; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>🔧 Track Your Repair Progress</h2>
    </div>
    <div class="content">
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
        <a href="${signupLink}" class="button">Complete Account Setup</a>
      </p>

      <p style="font-size: 0.9em; color: #666;">This link will expire in 7 days. If you need a new link, please contact us.</p>

      <p>If you have any questions, feel free to contact us at <strong>(425) 373-0308</strong>.</p>

      <p style="margin-top: 30px;">Best regards,<br><strong>Bellevue Collision Services</strong><br>13434 SE 27th Pl, Bellevue WA 98005</p>
    </div>
    <div class="footer">
      <p>This email was sent because you submitted a repair request on our website.</p>
    </div>
  </div>
</body>
</html>
      `
    });
  } catch (err) {
    console.error("❌ Failed to send signup invite email:", err);
  }
}

export async function sendWelcomeEmail(
  to: string,
  name: string
) {
  try {
    await transporter.sendMail({
      to,
      from: `"Bellevue Collision Services" <${process.env.SMTP_USER}>`,
      subject: "🎉 Welcome to the BCS Family!",
      text: `Hi ${name},

Welcome to Bellevue Collision Services! We're thrilled to have you as part of our family.

Your account has been created successfully. You can now log in to track any repair requests you submit through our website.

What you can do with your account:
• Submit repair requests online
• Track repair progress in real-time
• View parts shipping status
• See estimated completion dates
• Receive updates from our team

Visit our website to log in: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/customer/login

If you have any questions or need assistance, don't hesitate to contact us at (425) 373-0308.

We look forward to serving you!

Best regards,
Bellevue Collision Services Team`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
    .header { background-color: #0047AB; color: white; padding: 30px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background-color: white; padding: 30px; border-radius: 0 0 5px 5px; }
    .button { display: inline-block; padding: 15px 30px; background-color: #FFD700; color: #0047AB; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
    .features { background-color: #f4f4f4; padding: 20px; border-radius: 5px; margin: 20px 0; }
    .feature-item { padding: 8px 0; }
    .feature-item:before { content: "✓ "; color: #27ae60; font-weight: bold; }
    .footer { text-align: center; margin-top: 20px; color: #7f8c8d; font-size: 12px; }
    .welcome { font-size: 48px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="welcome">🎉</div>
      <h2>Welcome to the BCS Family!</h2>
    </div>
    <div class="content">
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
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/customer/login" class="button">Log In to Your Account</a>
      </p>

      <p>If you have any questions or need assistance, don't hesitate to contact us at <strong>(425) 373-0308</strong>.</p>

      <p style="margin-top: 30px;">We look forward to serving you!<br><br><strong>Bellevue Collision Services</strong><br>13434 SE 27th Pl, Bellevue WA 98005</p>
    </div>
    <div class="footer">
      <p>You're receiving this email because you created an account on our website.</p>
    </div>
  </div>
</body>
</html>
      `
    });
  } catch (err) {
    console.error("❌ Failed to send welcome email:", err);
  }
}

export async function sendStatusUpdateEmail(
  to: string,
  name: string,
  leadDetails: {
    serviceType: string;
    submittedDate: string;
    oldStatus: string;
    newStatus: string;
  }
) {
  try {
    const statusEmojis: Record<string, string> = {
      'new': '📝',
      'contacted': '📞',
      'in_progress': '🔧',
      'completed': '✅',
      'cancelled': '❌'
    };

    const statusMessages: Record<string, string> = {
      'new': 'Your service request has been received and is awaiting review.',
      'contacted': 'We\'ve reviewed your request and will be in touch soon!',
      'in_progress': 'Great news! We\'ve started working on your vehicle.',
      'completed': 'Your vehicle is ready for pickup! Give us a call to schedule.',
      'cancelled': 'This service request has been cancelled. Contact us if you have questions.'
    };

    const emoji = statusEmojis[leadDetails.newStatus] || '📋';
    const statusMessage = statusMessages[leadDetails.newStatus] || 'Your service request status has been updated.';

    await transporter.sendMail({
      to,
      from: `"Bellevue Collision Services" <${process.env.SMTP_USER}>`,
      subject: `${emoji} Update on Your Service Request - ${leadDetails.serviceType}`,
      text: `Hi ${name},

We wanted to update you on your service request.

Service Request Details:
━━━━━━━━━━━━━━━━━━━━
Service Type: ${leadDetails.serviceType}
Submitted: ${leadDetails.submittedDate}
Previous Status: ${leadDetails.oldStatus}
New Status: ${leadDetails.newStatus}

${statusMessage}

You can view complete details and track your repair progress by logging into your account:
${process.env.FRONTEND_URL || 'http://localhost:5173'}/customer/dashboard

If you have any questions, please don't hesitate to contact us:
📞 Phone: (425) 373-0308
📧 Email: ${process.env.SMTP_USER}

Best regards,
Bellevue Collision Services Team
13434 SE 27th Pl, Bellevue WA 98005`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
    .header { background-color: #0047AB; color: white; padding: 30px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background-color: white; padding: 30px; border-radius: 0 0 5px 5px; }
    .button { display: inline-block; padding: 15px 30px; background-color: #FFD700; color: #0047AB; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
    .status-box { background-color: #f4f4f4; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #0047AB; }
    .status-change { display: flex; align-items: center; justify-content: center; margin: 15px 0; font-size: 18px; font-weight: bold; }
    .old-status { color: #999; text-decoration: line-through; }
    .arrow { margin: 0 15px; color: #0047AB; }
    .new-status { color: #27ae60; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #0047AB; }
    .value { color: #555; }
    .message { background-color: #e8f5e9; padding: 15px; border-radius: 5px; border-left: 4px solid #27ae60; margin: 20px 0; }
    .footer { text-align: center; margin-top: 20px; color: #7f8c8d; font-size: 12px; }
    .contact-info { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>${emoji} Service Request Update</h2>
    </div>
    <div class="content">
      <p>Hi <strong>${name}</strong>,</p>

      <p>We wanted to update you on your service request.</p>

      <div class="status-box">
        <h3 style="margin-top: 0; color: #0047AB;">Request Details</h3>

        <div class="field">
          <span class="label">Service Type:</span>
          <span class="value">${leadDetails.serviceType}</span>
        </div>

        <div class="field">
          <span class="label">Submitted:</span>
          <span class="value">${leadDetails.submittedDate}</span>
        </div>

        <div class="status-change">
          <span class="old-status">${leadDetails.oldStatus}</span>
          <span class="arrow">→</span>
          <span class="new-status">${leadDetails.newStatus}</span>
        </div>
      </div>

      <div class="message">
        <strong>What this means:</strong><br>
        ${statusMessage}
      </div>

      <p style="text-align: center;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/customer/dashboard" class="button">View Full Details</a>
      </p>

      <div class="contact-info">
        <strong>Questions? Contact us:</strong><br>
        📞 Phone: <a href="tel:+14253730308">(425) 373-0308</a><br>
        📧 Email: <a href="mailto:${process.env.SMTP_USER}">${process.env.SMTP_USER}</a>
      </div>

      <p style="margin-top: 30px; text-align: center;">
        <strong>Bellevue Collision Services</strong><br>
        13434 SE 27th Pl, Bellevue WA 98005
      </p>
    </div>
    <div class="footer">
      <p>You're receiving this email because you submitted a service request on our website.</p>
    </div>
  </div>
</body>
</html>
      `
    });
  } catch (err) {
    console.error("❌ Failed to send status update email:", err);
  }
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetToken: string,
  frontendUrl: string
) {
  try {
    const resetLink = `${frontendUrl}/customer/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      to,
      from: `"Bellevue Collision Services" <${process.env.SMTP_USER}>`,
      subject: "🔒 Password Reset Request",
      text: `Hi ${name},

We received a request to reset your password for your Bellevue Collision Services account.

Click the link below to reset your password:
${resetLink}

This link will expire in 1 hour for security reasons.

If you didn't request this password reset, please ignore this email. Your password will remain unchanged.

Best regards,
Bellevue Collision Services Team
13434 SE 27th Pl, Bellevue WA 98005`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
    .header { background-color: #0047AB; color: white; padding: 30px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background-color: white; padding: 30px; border-radius: 0 0 5px 5px; }
    .button { display: inline-block; padding: 15px 30px; background-color: #FFD700; color: #0047AB; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; margin-top: 20px; color: #7f8c8d; font-size: 12px; }
    .warning { background-color: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0; }
    .lock-icon { font-size: 48px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="lock-icon">🔒</div>
      <h2>Password Reset Request</h2>
    </div>
    <div class="content">
      <p>Hi <strong>${name}</strong>,</p>

      <p>We received a request to reset your password for your Bellevue Collision Services account.</p>

      <p style="text-align: center;">
        <a href="${resetLink}" class="button">Reset Password</a>
      </p>

      <div class="warning">
        <strong>⏱️ Important:</strong> This link will expire in <strong>1 hour</strong> for security reasons.
      </div>

      <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>

      <p style="margin-top: 30px;">Best regards,<br><strong>Bellevue Collision Services</strong><br>13434 SE 27th Pl, Bellevue WA 98005</p>
    </div>
    <div class="footer">
      <p>This is an automated email. Please do not reply to this message.</p>
    </div>
  </div>
</body>
</html>
      `
    });
  } catch (err) {
    console.error("❌ Failed to send password reset email:", err);
  }
}

export async function sendRepairTrackingUpdateEmail(
  to: string,
  name: string,
  leadDetails: {
    serviceType: string;
    currentStep: string;
    estimatedCompletion: string;
    notes: string;
  }
) {
  try {
    await transporter.sendMail({
      to,
      from: `"Bellevue Collision Services" <${process.env.SMTP_USER}>`,
      subject: `🔧 Repair Progress Update - ${leadDetails.serviceType}`,
      text: `Hi ${name},

We have an update on your vehicle repair!

Current Repair Status:
━━━━━━━━━━━━━━━━━━━━
Service: ${leadDetails.serviceType}
Current Step: ${leadDetails.currentStep}
Estimated Completion: ${leadDetails.estimatedCompletion}

Progress Notes:
${leadDetails.notes}

You can view complete details and photos by logging into your account:
${process.env.FRONTEND_URL || 'http://localhost:5173'}/customer/dashboard

If you have any questions about the repair process, please don't hesitate to reach out:
📞 Phone: (425) 373-0308
📧 Email: ${process.env.SMTP_USER}

Best regards,
Bellevue Collision Services Team
13434 SE 27th Pl, Bellevue WA 98005`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
    .header { background-color: #0047AB; color: white; padding: 30px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background-color: white; padding: 30px; border-radius: 0 0 5px 5px; }
    .button { display: inline-block; padding: 15px 30px; background-color: #FFD700; color: #0047AB; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
    .progress-box { background-color: #e3f2fd; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2196f3; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #0047AB; display: block; margin-bottom: 5px; }
    .value { color: #555; background-color: #f9f9f9; padding: 10px; border-radius: 3px; }
    .notes-box { background-color: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0; }
    .footer { text-align: center; margin-top: 20px; color: #7f8c8d; font-size: 12px; }
    .contact-info { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .icon { font-size: 48px; text-align: center; margin-bottom: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="icon">🔧</div>
      <h2>Repair Progress Update</h2>
    </div>
    <div class="content">
      <p>Hi <strong>${name}</strong>,</p>

      <p>We have an update on your vehicle repair!</p>

      <div class="progress-box">
        <h3 style="margin-top: 0; color: #0047AB;">Current Status</h3>

        <div class="field">
          <span class="label">Service:</span>
          <div class="value">${leadDetails.serviceType}</div>
        </div>

        <div class="field">
          <span class="label">Current Step:</span>
          <div class="value"><strong>${leadDetails.currentStep}</strong></div>
        </div>

        <div class="field">
          <span class="label">Estimated Completion:</span>
          <div class="value">${leadDetails.estimatedCompletion}</div>
        </div>
      </div>

      <div class="notes-box">
        <strong style="color: #f57c00;">📝 Progress Notes:</strong><br><br>
        ${leadDetails.notes}
      </div>

      <p style="text-align: center;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/customer/dashboard" class="button">View Full Details</a>
      </p>

      <div class="contact-info">
        <strong>Questions about your repair?</strong><br>
        📞 Phone: <a href="tel:+14253730308">(425) 373-0308</a><br>
        📧 Email: <a href="mailto:${process.env.SMTP_USER}">${process.env.SMTP_USER}</a>
      </div>

      <p style="margin-top: 30px; text-align: center;">
        <strong>Bellevue Collision Services</strong><br>
        13434 SE 27th Pl, Bellevue WA 98005
      </p>
    </div>
    <div class="footer">
      <p>You're receiving this email because we're working on your vehicle repair.</p>
    </div>
  </div>
</body>
</html>
      `
    });
  } catch (err) {
    console.error("❌ Failed to send repair tracking update email:", err);
  }
}

export async function sendAppointmentConfirmation(appointment: any) {
  try {
    const customer = appointment.customerId;
    const assignedTech = appointment.assignedTo;

    const startTime = new Date(appointment.startTime);
    const dateStr = startTime.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const timeStr = startTime.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const appointmentTypeLabels: Record<string, string> = {
      drop_off: "Vehicle Drop-Off",
      pickup: "Vehicle Pickup",
      consultation: "Consultation",
      estimate: "Estimate",
      inspection: "Vehicle Inspection",
    };

    const typeLabel = appointmentTypeLabels[appointment.appointmentType] || appointment.appointmentType;

    await transporter.sendMail({
      to: customer.email,
      from: `"Bellevue Collision Services" <${process.env.SMTP_USER}>`,
      subject: `📅 Appointment Confirmed - ${dateStr} at ${timeStr}`,
      text: `Hi ${customer.name},

Your appointment has been confirmed!

Appointment Details:
━━━━━━━━━━━━━━━━━━━━
Date: ${dateStr}
Time: ${timeStr}
Type: ${typeLabel}
${assignedTech ? `Technician: ${assignedTech.name}` : ""}
${appointment.vehicleInfo?.make ? `Vehicle: ${appointment.vehicleInfo.year || ""} ${appointment.vehicleInfo.make} ${appointment.vehicleInfo.model || ""}` : ""}

Location:
Bellevue Collision Services
13434 SE 27th Pl, Bellevue WA 98005
Phone: (425) 373-0308

What to bring:
• Vehicle registration
• Insurance information (if applicable)
• List of concerns or damage details

${appointment.description ? `\nNotes:\n${appointment.description}` : ""}

Need to reschedule or cancel? Please visit your dashboard or call us at least 24 hours in advance:
${process.env.FRONTEND_URL || "http://localhost:5173"}/customer/dashboard

We look forward to seeing you!

Best regards,
Bellevue Collision Services Team`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
    .header { background-color: #0047AB; color: white; padding: 30px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background-color: white; padding: 30px; border-radius: 0 0 5px 5px; }
    .appointment-box { background-color: #e3f2fd; padding: 25px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2196f3; }
    .field { margin-bottom: 12px; font-size: 16px; }
    .label { font-weight: bold; color: #0047AB; margin-right: 8px; }
    .value { color: #333; }
    .location-box { background-color: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0; }
    .checklist { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .checklist-item { padding: 5px 0; }
    .checklist-item:before { content: "✓ "; color: #27ae60; font-weight: bold; margin-right: 8px; }
    .button { display: inline-block; padding: 15px 30px; background-color: #FFD700; color: #0047AB; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; margin-top: 20px; color: #7f8c8d; font-size: 12px; }
    .icon { font-size: 48px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="icon">📅</div>
      <h2>Appointment Confirmed!</h2>
    </div>
    <div class="content">
      <p>Hi <strong>${customer.name}</strong>,</p>

      <p>Your appointment has been <strong style="color: #27ae60;">confirmed</strong>!</p>

      <div class="appointment-box">
        <h3 style="margin-top: 0; color: #0047AB;">Appointment Details</h3>

        <div class="field">
          <span class="label">📆 Date:</span>
          <span class="value"><strong>${dateStr}</strong></span>
        </div>

        <div class="field">
          <span class="label">🕐 Time:</span>
          <span class="value"><strong>${timeStr}</strong></span>
        </div>

        <div class="field">
          <span class="label">📋 Type:</span>
          <span class="value">${typeLabel}</span>
        </div>

        ${assignedTech ? `<div class="field">
          <span class="label">👤 Technician:</span>
          <span class="value">${assignedTech.name}</span>
        </div>` : ""}

        ${appointment.vehicleInfo?.make ? `<div class="field">
          <span class="label">🚗 Vehicle:</span>
          <span class="value">${appointment.vehicleInfo.year || ""} ${appointment.vehicleInfo.make} ${appointment.vehicleInfo.model || ""}</span>
        </div>` : ""}
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

      ${appointment.description ? `<div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <strong>Notes:</strong><br>
        ${appointment.description}
      </div>` : ""}

      <p style="text-align: center;">
        <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/customer/dashboard" class="button">View in Dashboard</a>
      </p>

      <p style="font-size: 14px; color: #666; padding: 15px; background-color: #f9f9f9; border-radius: 5px;">
        <strong>Need to reschedule or cancel?</strong><br>
        Please visit your dashboard or call us at least <strong>24 hours in advance</strong>.
      </p>

      <p style="margin-top: 30px;">We look forward to seeing you!<br><br><strong>Bellevue Collision Services</strong></p>
    </div>
    <div class="footer">
      <p>You're receiving this email because you scheduled an appointment with us.</p>
    </div>
  </div>
</body>
</html>
      `,
    });
  } catch (err) {
    console.error("❌ Failed to send appointment confirmation email:", err);
    throw err;
  }
}

/**
 * Send appointment reminder email (24 hours before)
 */
export async function sendAppointmentReminder(appointment: any) {
  try {
    const customer = appointment.customerId;
    if (!customer || !customer.email) {
      throw new Error("Customer email not found");
    }

    const startTime = new Date(appointment.startTime);
    const appointmentDate = startTime.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const appointmentTime = startTime.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const appointmentTypeLabel = appointment.appointmentType.replace(/_/g, " ").toUpperCase();

    await transporter.sendMail({
      to: customer.email,
      from: `"Bellevue Collision Services" <${process.env.SMTP_USER}>`,
      subject: `⏰ Reminder: Your Appointment Tomorrow at ${appointmentTime}`,
      text: `Hi ${customer.name},

This is a friendly reminder about your upcoming appointment tomorrow!

Appointment Details:
━━━━━━━━━━━━━━━━━━━━
Type: ${appointmentTypeLabel}
Date: ${appointmentDate}
Time: ${appointmentTime}
Duration: ${appointment.duration} minutes
Location: 13434 SE 27th Pl, Bellevue WA 98005

${appointment.assignedTo ? `Technician: ${appointment.assignedTo.name}\n` : ""}
${appointment.vehicleInfo ? `Vehicle: ${appointment.vehicleInfo.year} ${appointment.vehicleInfo.make} ${appointment.vehicleInfo.model}\n` : ""}

What to Bring:
✓ Vehicle registration
✓ Insurance information
✓ List of any concerns or questions

Need to Reschedule?
If you need to reschedule or cancel, please let us know at least 24 hours in advance by calling (425) 373-0308 or visiting your dashboard.

We look forward to seeing you tomorrow!

Best regards,
Bellevue Collision Services Team
13434 SE 27th Pl, Bellevue WA 98005
Phone: (425) 373-0308`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); }
    .header { background: linear-gradient(135deg, #0047AB 0%, #0066CC 100%); color: #fff; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .reminder-badge { display: inline-block; background-color: #FFD700; color: #0047AB; padding: 8px 20px; border-radius: 20px; font-weight: bold; margin-top: 10px; font-size: 16px; }
    .content { padding: 30px; }
    .appointment-card { background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 5px solid #0047AB; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { font-weight: bold; color: #555; }
    .detail-value { color: #0047AB; font-weight: 600; }
    .checklist { background-color: #e8f4f8; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .checklist h3 { color: #0047AB; margin-top: 0; }
    .checklist ul { margin: 10px 0; padding-left: 20px; }
    .checklist li { padding: 5px 0; }
    .button { display: inline-block; background: linear-gradient(135deg, #0047AB 0%, #0066CC 100%); color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px 5px; }
    .button:hover { background: linear-gradient(135deg, #003a8c 0%, #0052a3 100%); }
    .warning-box { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .footer { background-color: #1a1a1a; color: #fff; text-align: center; padding: 20px; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ Appointment Reminder</h1>
      <div class="reminder-badge">TOMORROW</div>
    </div>

    <div class="content">
      <p style="font-size: 16px;">Hi <strong>${customer.name}</strong>,</p>

      <p>This is a friendly reminder about your upcoming appointment <strong>tomorrow</strong>!</p>

      <div class="appointment-card">
        <h2 style="margin-top: 0; color: #0047AB;">📅 ${appointmentTypeLabel}</h2>

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
          <span class="detail-value">${appointment.duration} minutes</span>
        </div>

        ${appointment.assignedTo ? `
        <div class="detail-row">
          <span class="detail-label">Technician:</span>
          <span class="detail-value">${appointment.assignedTo.name}</span>
        </div>` : ""}

        ${appointment.vehicleInfo ? `
        <div class="detail-row">
          <span class="detail-label">Vehicle:</span>
          <span class="detail-value">${appointment.vehicleInfo.year} ${appointment.vehicleInfo.make} ${appointment.vehicleInfo.model}</span>
        </div>` : ""}

        <div class="detail-row">
          <span class="detail-label">Location:</span>
          <span class="detail-value">13434 SE 27th Pl, Bellevue WA 98005</span>
        </div>
      </div>

      <div class="checklist">
        <h3>✓ What to Bring:</h3>
        <ul>
          <li>Vehicle registration</li>
          <li>Insurance information</li>
          <li>List of any concerns or questions</li>
        </ul>
      </div>

      <div class="warning-box">
        <strong>⚠️ Need to Reschedule?</strong><br>
        If you need to reschedule or cancel, please let us know at least <strong>24 hours in advance</strong> by calling <strong>(425) 373-0308</strong> or visiting your dashboard.
      </div>

      <p style="text-align: center;">
        <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/customer/dashboard" class="button">View in Dashboard</a>
        <a href="tel:+14253730308" class="button" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%);">Call Us</a>
      </p>

      <p style="margin-top: 30px;">We look forward to seeing you tomorrow!<br><br><strong>Bellevue Collision Services Team</strong></p>
    </div>

    <div class="footer">
      <p>You're receiving this reminder because you have an appointment scheduled with us.</p>
      <p>13434 SE 27th Pl, Bellevue WA 98005 | (425) 373-0308</p>
    </div>
  </div>
</body>
</html>
      `,
    });

    console.log(`✅ Sent reminder email to ${customer.email} for appointment ${appointment._id}`);
  } catch (err) {
    console.error("❌ Failed to send appointment reminder email:", err);
    throw err;
  }
}

/**
 * Send follow-up email after appointment completion
 */
export async function sendAppointmentFollowUp(appointment: any) {
  try {
    const customer = appointment.customerId;
    if (!customer || !customer.email) {
      throw new Error("Customer email not found");
    }

    const completionDate = new Date(appointment.actualCompletionDate || appointment.endTime);
    const formattedDate = completionDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const appointmentTypeLabel = appointment.appointmentType.replace(/_/g, " ").toUpperCase();

    await transporter.sendMail({
      to: customer.email,
      from: `"Bellevue Collision Services" <${process.env.SMTP_USER}>`,
      subject: `Thank You - How Was Your Experience?`,
      text: `Hi ${customer.name},

Thank you for choosing Bellevue Collision Services!

We hope you're satisfied with the ${appointmentTypeLabel} service we provided on ${formattedDate}.

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

Thank you for trusting us with your vehicle!

Best regards,
Bellevue Collision Services Team
13434 SE 27th Pl, Bellevue WA 98005
Phone: (425) 373-0308`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); }
    .header { background: linear-gradient(135deg, #0047AB 0%, #0066CC 100%); color: #fff; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .thank-you-badge { display: inline-block; background-color: #FFD700; color: #0047AB; padding: 8px 20px; border-radius: 20px; font-weight: bold; margin-top: 10px; font-size: 16px; }
    .content { padding: 30px; }
    .service-card { background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 5px solid #28a745; }
    .feedback-section { background-color: #e8f4f8; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .feedback-section h3 { color: #0047AB; margin-top: 0; }
    .star-rating { font-size: 32px; text-align: center; margin: 15px 0; }
    .button { display: inline-block; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px 5px; }
    .button:hover { background: linear-gradient(135deg, #218838 0%, #1ea879 100%); }
    .button-secondary { background: linear-gradient(135deg, #0047AB 0%, #0066CC 100%); }
    .button-secondary:hover { background: linear-gradient(135deg, #003a8c 0%, #0052a3 100%); }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Thank You!</h1>
      <div class="thank-you-badge">We Value Your Feedback</div>
    </div>

    <div class="content">
      <p>Hi <strong>${customer.name}</strong>,</p>

      <p>Thank you for choosing Bellevue Collision Services! We hope you're satisfied with the <strong>${appointmentTypeLabel}</strong> service we provided on <strong>${formattedDate}</strong>.</p>

      <div class="service-card">
        <h3 style="color: #28a745; margin-top: 0;">✅ Service Completed</h3>
        <p><strong>Service Type:</strong> ${appointmentTypeLabel}</p>
        <p><strong>Completion Date:</strong> ${formattedDate}</p>
        ${appointment.assignedTo ? `<p><strong>Technician:</strong> ${appointment.assignedTo.name}</p>` : ""}
        ${appointment.vehicleInfo ? `<p><strong>Vehicle:</strong> ${appointment.vehicleInfo.year} ${appointment.vehicleInfo.make} ${appointment.vehicleInfo.model}</p>` : ""}
      </div>

      <div class="feedback-section">
        <h3>⭐ How Did We Do?</h3>
        <div class="star-rating">⭐⭐⭐⭐⭐</div>
        <p>We'd love to hear about your experience:</p>
        <ul>
          <li>Was your vehicle ready on time?</li>
          <li>Are you satisfied with the quality of work?</li>
          <li>Was our team helpful and professional?</li>
        </ul>
      </div>

      <p style="text-align: center;">
        <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/customer/dashboard" class="button button-secondary">Share Feedback</a>
        <a href="tel:+14253730308" class="button">Call Us</a>
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
    </div>

    <div class="footer">
      <p>You're receiving this follow-up because you recently used our services.</p>
      <p>13434 SE 27th Pl, Bellevue WA 98005 | (425) 373-0308</p>
    </div>
  </div>
</body>
</html>
      `,
    });

    console.log(`✅ Sent follow-up email to ${customer.email} for appointment ${appointment._id}`);
  } catch (err) {
    console.error("❌ Failed to send appointment follow-up email:", err);
    throw err;
  }
}
