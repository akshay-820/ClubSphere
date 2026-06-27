import express from "express";
import {
    getUserById,
    updateUserProfile,
} from "../db/queries/userQueries.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

const getMyProfile = async (req: AuthRequest, res: express.Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const user = await getUserById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json({ user });
    } catch (error) {
        console.error("Error fetching profile:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const updateMyProfile = async (req: AuthRequest, res: express.Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { name, year, branch, avatar_url } = req.body;
        const user = await updateUserProfile(userId, {
            name,
            year,
            branch,
            avatar_url,
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json({
            message: "Profile updated successfully",
            user,
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export { getMyProfile, updateMyProfile };
