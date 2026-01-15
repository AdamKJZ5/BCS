
import nodemailer from "nodemailer";

export async function sendLeadEmail({ name, email, phone, message }: { name: string, email: string, phone: string, message: string }) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

export async function sendAutoReply(to: string, name: string) {
  await transporter.sendMail({
    to,
    from: `"Auto Body Shop" <${process.env.SMTP_USER}>`,
    subject: "We received your request",
    text: `Hi ${name},\n\nThanks for reaching out. We’ve received your request and will get back to you shortly.\n\n– Auto Body Shop`
  });
}

  await transporter.sendMail({
    from: `"Auto Body Website" <${process.env.SMTP_USER}>`,
    to: process.env.OWNER_EMAIL,
    subject: "New Lead from Website",
    text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`
  });
}
