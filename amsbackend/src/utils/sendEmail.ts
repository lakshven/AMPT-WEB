import nodemailer from "nodemailer";

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

export default async function sendMail({ to, subject, html }: SendMailOptions): Promise<void> {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER as string,
        pass: process.env.EMAIL_PASS as string,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    });

  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Unable to send email");
  }
}