import express from "express";
import {
    addMembership,
    changeUserClubRole,
    getMemberships,
    getUserRoleInClub,
    isMember,
    removeMembership,
} from "../db/queries/membershipQueries.js";
import { AuthRequest } from "../middleware/authMiddleware.js";
import { getRouteParam } from "../utils/validation.js";
import { getUserById } from "../db/queries/userQueries.js";

const addMemberInClub = async (req: AuthRequest, res: express.Response) => {
    try {
        const clubId = getRouteParam(req.params.id);
        const collegeId = req.user?.collegeId;
        if (!collegeId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        //check if the user exists and if the user is from the same college
        const userId = req.body.userId;
        if (typeof userId !== "string") {
            return res.status(400).json({ error: "Invalid user" });
        }
        const user = await getUserById(userId);
        if (!user || user.college_id !== collegeId) {
            return res.status(404).json({ error: "User not found" });
        }

        //check if that user is already a member of the club
        const alreadyMember = await isMember(userId, clubId);
        if (alreadyMember) {
            return res.status(409).json({
                error: "User is already a member",
            });
        }

        const membership = await addMembership(userId, clubId);
        return res.status(201).json({
            message: "Membership added successfully",
            membership,
        });
    } catch (err) {
        console.error("Error while adding membership", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const removeMemberInClub = async (req: AuthRequest, res: express.Response) => {
    try {
        const clubId = getRouteParam(req.params.id);
        const userId = req.body.userId;
        if (typeof userId !== "string") {
            return res.status(400).json({ error: "Invalid user" });
        }

        //prevent removing the president
        const role = await getUserRoleInClub(userId, clubId);
        if (role === "president") {
            return res.status(403).json({
                error: "Cannot remove the president",
            });
        }

        const membership = await removeMembership(userId, clubId);
        if (!membership) {
            return res.status(404).json({ error: "Membership not found" });
        }

        return res.status(200).json({
            message: "Successfully removed member",
            membership,
        });
    } catch (err) {
        console.error("Error while deleting membership", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const showAllMembers = async (req: AuthRequest, res: express.Response) => {
    try {
        const clubId = getRouteParam(req.params.id);
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const userRoleInClub = await getUserRoleInClub(userId, clubId);

        const members = await getMemberships(clubId);

        return res.status(200).json({
            members,
            userRoleInClub,
        });
    } catch (err) {
        console.error("Error while fetching members", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const makeAdmin = async (req: AuthRequest, res: express.Response) => {
    try {
        const userId = req.body.userId;
        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }
        const clubId = getRouteParam(req.params.id);

        const clubRole = await getUserRoleInClub(userId, clubId);
        if (clubRole === "admin" || clubRole === "president") {
            return res.status(409).json({ error: "Cannot update user's role" });
        }
        const role = "admin";

        const result = await changeUserClubRole(userId, clubId, role);
        if (!result) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json({
            message: "Successfully updated user's club role",
            result,
        });
    } catch (err) {
        console.error("Error while making user as admin", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export { addMemberInClub, removeMemberInClub, showAllMembers, makeAdmin };
