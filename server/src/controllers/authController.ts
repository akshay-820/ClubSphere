//has registerUser , verifyRegistrationOtp and loginUser functions

import express from "express";
import bcrypt from "bcrypt";
import { createUser, getUserByEmail } from "../db/queries/userQueries.js";
import { generateToken } from "../utils/jwt.js";
import {
    deletePendingRegistration,
    getPendingRegistrationByEmail,
    incrementPendingRegistrationOtpAttempts,
    upsertPendingRegistration,
} from "../db/queries/userPendingRegsQueries.js";
import { generateOtp, hashOtp } from "../utils/otp.js";
import { sendRegistrationOtpEmail } from "../utils/mailer.js";

const setAuthCookie = (
    res: express.Response,
    userId: string,
    role: string,
    collegeId: string,
) => {
    const auth_token = generateToken({ userId, role, collegeId });
    res.cookie("token", auth_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24, // 1 day
    });
};

const clearAuthCookie = (res: express.Response) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });
};

const registerUser = async (req: express.Request, res: express.Response) => {
    try {
        let { name, email, year, branch, password, college_id } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        email = email.toLowerCase().trim();

        if (!college_id) {
            year = null;
            branch = null;
        }
        email = email.trim().toLowerCase();

        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const otp = generateOtp();
        const otpHash = hashOtp(email, otp);
        const otpExpiresAt = new Date(Date.now() + 1000 * 60 * 10);

        //store the avatar in cloudinary and get the url

        await upsertPendingRegistration({
            name,
            email,
            year,
            branch,
            password_hash: hashedPassword,
            college_id,
            otp_hash: otpHash,
            otp_expires_at: otpExpiresAt,
        });

        await sendRegistrationOtpEmail({
            to: email,
            name,
            otp,
        });

        return res.status(202).json({
            message: "OTP sent to email. Verify OTP to complete registration",
        });
    } catch (error) {
        console.error("Error registering user:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const verifyRegistrationOtp = async (
    req: express.Request,
    res: express.Response,
) => {
    try {
        let { email, otp } = req.body;

        if (!email || !otp) {
            return res
                .status(400)
                .json({ error: "Email and OTP are required" });
        }

        email = email.toLowerCase().trim();
        otp = String(otp).trim();

        const pendingRegistration = await getPendingRegistrationByEmail(email);

        if (!pendingRegistration) {
            return res
                .status(400)
                .json({ error: "No pending registration found" });
        }

        if (pendingRegistration.otp_attempts >= 2) {
            return res.status(429).json({
                error: "Too many incorrect OTP attempts. Please register again",
            });
        }

        if (new Date(pendingRegistration.otp_expires_at) < new Date()) {
            await deletePendingRegistration(pendingRegistration.id);
            return res.status(400).json({ error: "OTP expired" });
        }

        const otpHash = hashOtp(email, otp);

        if (otpHash !== pendingRegistration.otp_hash) {
            await incrementPendingRegistrationOtpAttempts(
                pendingRegistration.id,
            );
            return res.status(400).json({ error: "Invalid OTP" });
        }

        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            await deletePendingRegistration(pendingRegistration.id);
            return res.status(400).json({ error: "User already exists" });
        }

        const user = await createUser({
            name: pendingRegistration.name,
            email: pendingRegistration.email,
            year: pendingRegistration.year,
            branch: pendingRegistration.branch,
            password_hash: pendingRegistration.password_hash,
            avatar_url: pendingRegistration.avatar_url,
            college_id: pendingRegistration.college_id,
            email_verified: true,
        });

        await deletePendingRegistration(pendingRegistration.id);

        setAuthCookie(res, user.id, user.role, user.college_id);

        const { password_hash, ...userWithoutPassword } = user;

        return res.status(201).json({
            message: "Registration completed successfully",
            user: userWithoutPassword,
        });
    } catch (error) {
        console.error("Error verifying registration OTP:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const loginUser = async (req: express.Request, res: express.Response) => {
    try {
        let { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        email = email.toLowerCase().trim();

        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password_hash,
        );
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        if (!user.email_verified) {
            return res
                .status(403)
                .json({ error: "Please verify your email before logging in" });
        }

        setAuthCookie(res, user.id, user.role, user.college_id);

        const { password_hash, ...userWithoutPassword } = user;

        return res.status(200).json({
            message: "User logged in successfully",
            user: userWithoutPassword,
        });
    } catch (error) {
        console.error("Error logging in user:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const logoutUser = async (_req: express.Request, res: express.Response) => {
    try {
        clearAuthCookie(res);

        return res.status(200).json({
            message: "User logged out successfully",
        });
    } catch (error) {
        console.error("Error logging out user:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export { registerUser, verifyRegistrationOtp, loginUser, logoutUser };
