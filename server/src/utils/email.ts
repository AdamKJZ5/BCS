
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
      from: `"Auto Body Shop" <${process.env.SMTP_USER}>`,
      subject: "✅ We received your request",
      text: `Hi ${name},

Thanks for reaching out! We've received your request and will get back to you shortly.

Our team will review your information and contact you within 24 hours.

– Auto Body Shop`,
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

      <p style="margin-top: 30px;">Best regards,<br><strong>Auto Body Shop Team</strong></p>
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
