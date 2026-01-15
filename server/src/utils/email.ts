
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
  message 
}: { 
  name: string;
  email: string; 
  phone: string; 
  message: string;
 }) {
  try {
    await transporter.sendMail({
      from: `"Auto Body Website" <${process.env.SMTP_USER}>`,
      to: process.env.OWNER_EMAIL,
      subject: "New Lead from Website",
      text: `
Name: ${name}
Email: ${email}
Phone: ${phone}

Message: 
${message}

Damage Description:
${damageDescription || "N/A"}

Photos:
${data.photos && data.photos.length ? data.photos.join(", ") : "No photos uploaded"}
  `
    });
  } catch (err) {
    console.error("❌ Failed to send owner email:", err);
  }

export async function sendAutoReplySafe(
  to: string, 
  name: string
) {
  try {

  await transporter.sendMail({
    to,
    from: `"Auto Body Shop" <${process.env.SMTP_USER}>`,
    subject: "We received your request",
    text: `Hi ${name},
Thanks for reaching out. We’ve received your request and will get back to you shortly.

– Auto Body Shop`
  });

  } catch(err) {
    console.error("❌ Failed to send auto-reply:", err);
  }
}
