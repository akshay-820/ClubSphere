//getMyProfile and updateMyProfile functions

import express from "express";
import {
    getUserById,
    searchUserByName,
    updateUserProfile,
} from "../db/queries/userQueries.js";
import { AuthRequest } from "../middleware/authMiddleware.js";
import { uploadImage } from "../utils/uploadImage.js";
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

        const { name, year, branch } = req.body;

        // If a file was uploaded, send it to Cloudinary and use the returned URL
        let avatar_url: string | undefined = undefined;
        if (req.file) {
            const result = await uploadImage(
                req.file.buffer,
                "clubsphere/avatars",
                userId,
            );
            avatar_url = result.secure_url;
        }

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

const searchUser = async (req: AuthRequest, res: express.Response) => {
    try {
        const collegeId = req.user?.collegeId;
        if (!collegeId) {
            return res.status(401).json({ error: "Cannot search" });
        }
        const q = req.query.name;
        if (typeof q !== "string" || q.trim().length < 2) {
            return res.status(200).json({ users: [] });
        }

        const users = await searchUserByName(collegeId, q);
        if (!users) {
            return res.status(200).json({ users });
        }
        return res.status(200).json({ users });
    } catch (err) {
        console.error("Error while searching user:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export { getMyProfile, updateMyProfile, searchUser };
