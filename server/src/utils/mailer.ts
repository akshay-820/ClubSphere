import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

type SendOtpEmailInput = {
    to: string;
    name: string;
    otp: string;
};

export async function sendRegistrationOtpEmail({
    to,
    name,
    otp,
}: SendOtpEmailInput) {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        throw new Error(
            "GMAIL_USER and GMAIL_APP_PASSWORD are required to send emails",
        );
    }

    await transporter.sendMail({
        from:
            process.env.EMAIL_FROM ||
            `"ClubSphere" <${process.env.GMAIL_USER}>`,
        to,
        subject: "Your ClubSphere verification code",
        text: `Hi ${name}, your ClubSphere verification code is ${otp}. It expires in 10 minutes.`,
        html: `
            <h2>Verify your ClubSphere account</h2>
            <p>Hi ${name}, use this code to finish creating your account:</p>
            <p style="font-size: 28px; font-weight: 700; letter-spacing: 4px;">${otp}</p>
            <p>This code expires in 10 minutes.</p>
        `,
    });
}
