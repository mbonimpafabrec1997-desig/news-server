import nodemailer from "nodemailer";

const user = process.env.EMAIL_USER || process.env.SMTP_GMAIL_SENDER_EMAIL || "";
const pass = process.env.EMAIL_PASS || process.env.SMTP_GMAIL_SENDER_PASSWORD || "";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: user && pass ? { user, pass } : undefined,
});

export default transporter;
