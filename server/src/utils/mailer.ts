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

type SendEventCancelledEmailInput = {
    to: string;
    name: string;
    eventName: string;
    clubName: string;
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

export async function sendEventCancelledEmail({
    to,
    name,
    eventName,
    clubName,
}: SendEventCancelledEmailInput) {
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
        subject: `Event Cancelled - ${eventName}`,
        text: `
Hi ${name},

We regret to inform you that "${eventName}" has been cancelled by the organizing club "${clubName}".

Since you successfully registered for this event, you are eligible for a refund of your registration fee.

Please show this email to your college administration or the organizing club while requesting your refund.

This email serves as confirmation that your event registration has been cancelled.

Please do not forward this email.

Regards,
ClubSphere
        `,
        html: `
            <h2>Event Cancelled</h2>

            <p>Hi <strong>${name}</strong>,</p>

            <p>
                We regret to inform you that
                <strong>${eventName}</strong>
                has been cancelled by the organizing club 
                <strong>${clubName}</strong>.
            </p>

            <p>
                Since you successfully registered for this event,
                you are eligible for a refund of your registration fee.
            </p>

            <p>
                Please show this email to your college administration
                or the organizing club while requesting your refund.
            </p>

            <p>
                This email serves as confirmation that your
                registration has been cancelled.
            </p>

            <p>
                <strong>Please do not forward this email.</strong>
            </p>

            <br>

            <p>Regards,<br><strong>ClubSphere</strong></p>
        `,
    });
}
