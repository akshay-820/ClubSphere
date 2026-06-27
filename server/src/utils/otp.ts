import crypto from "crypto";

export function generateOtp() {
    return crypto.randomInt(100000, 1000000).toString();
}

export function hashOtp(email: string, otp: string) {
    const secret = process.env.OTP_SECRET || process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("OTP_SECRET or JWT_SECRET is required");
    }

    return crypto
        .createHmac("sha256", secret)
        .update(`${email.toLowerCase().trim()}:${otp.trim()}`)
        .digest("hex");
}
