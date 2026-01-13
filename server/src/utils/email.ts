
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

  await transporter.sendMail({
    from: `"Auto Body Website" <${process.env.SMTP_USER}>`,
    to: process.env.OWNER_EMAIL,
    subject: "New Lead from Website",
    text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`
  });
}
