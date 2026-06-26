import express from "express";
import bcrypt from "bcrypt";
import { createUser, getUserByEmail } from "../db/queries/userQueries.js";
import { generateToken } from "../utils/jwt.js";

const registerUser = async (req: express.Request, res: express.Response) => {
    try {
        let { name, email, year, branch, password, college_id } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }
        if (!college_id) {
            year = null;
            branch = null;
        }

        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 12);

        //store the avatar in cloudinary and get the url

        //store the user in the database
        const user = await createUser({
            name,
            email,
            year,
            branch,
            password_hash: hashedPassword,
            college_id,
        });

        const { password_hash, ...userWithoutPassword } = user;

        const auth_token = generateToken({ userId: user.id, role: user.role });
        res.cookie("token", auth_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 1000 * 60 * 60 * 24, // 1 day
        });

        return res.status(201).json({
            message: "User registered successfully",
            user: userWithoutPassword,
        });
    } catch (error) {
        console.error("Error registering user:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const loginUser = async (req: express.Request, res: express.Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

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

        const auth_token = generateToken({ userId: user.id, role: user.role });
        res.cookie("token", auth_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 1000 * 60 * 60 * 24, // 1 day
        });

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

export { registerUser, loginUser };
