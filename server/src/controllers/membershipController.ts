import express from "express";
import pool from "../db/index.js";
import {
    addMembership,
    changeUserClubRole,
    getMemberships,
    getUserRoleInClub,
    isMember,
    deletePresident,
    makePresident,
    removeMembership,
    transferPresident,
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

        const currentUserId = req.user?.userId;
        if (!currentUserId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const clubRole = await getUserRoleInClub(userId, clubId);
        if (!clubRole || clubRole === "admin" || clubRole === "president") {
            return res.status(409).json({ error: "Cannot update user's role" });
        }
        const role = "admin";
        if (currentUserId === userId) {
            return res.status(403).json({ error: "Cannot update own role" });
        }

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

const removeAdmin = async (req: AuthRequest, res: express.Response) => {
    try {
        const userId = req.body.userId;
        if (!userId) {
            return res.status(400).json({ error: "User ID required" });
        }
        const clubId = getRouteParam(req.params.id);

        const currentUserId = req.user?.userId;
        if (!currentUserId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const clubRole = await getUserRoleInClub(userId, clubId);
        if (!clubRole || clubRole === "president" || clubRole === "member") {
            return res.status(409).json({ error: "Cannot update user's role" });
        }

        if (currentUserId === userId) {
            return res.status(403).json({ error: "Cannot update own role" });
        }

        const result = await changeUserClubRole(userId, clubId, "member");
        if (!result) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json({
            error: "Successfully made the user as member",
            result,
        });
    } catch (err) {
        console.error("Error while removing admin", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

//if user is the club president - appoint president and demote him (transaction)
//else if user is a college admin - just appoint president
const appointPresident = async (req: AuthRequest, res: express.Response) => {
    let transactionStarted = false;
    const client = await pool.connect();
    try {
        const currentUserId = req.user?.userId;
        const currentUserGlobalRole = req.user?.role;
        if (!currentUserId || !currentUserGlobalRole) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const userId = req.body.userId;
        const clubId = getRouteParam(req.params.id);
        if (!userId) {
            return res.status(400).json({ error: "User ID required" });
        }
        const clubRole = await getUserRoleInClub(userId, clubId);
        if (!clubRole) {
            return res
                .status(404)
                .json({ error: "User is not member of the club" });
        }
        if (clubRole === "president") {
            return res.status(409).json({
                error: "User is already the president",
            });
        }

        const currentUserClubRole = await getUserRoleInClub(
            currentUserId,
            clubId,
        );

        if (currentUserId === userId) {
            return res.status(403).json({ error: "Cannot update own role" });
        }

        if (currentUserClubRole === "president") {
            await client.query("BEGIN");
            transactionStarted = true;
            const result = await transferPresident(
                client,
                userId,
                clubId,
                currentUserId,
            );
            if (!result) {
                await client.query("ROLLBACK");
                return res
                    .status(404)
                    .json({ error: "User membership or club not found" });
            }
            await client.query("COMMIT");
            transactionStarted = false;
            return res.status(200).json({
                message: "President transfer successful",
                result,
            });
        }
        const result = await makePresident(userId, clubId);
        if (!result) {
            return res
                .status(404)
                .json({ error: "User membership or club not found" });
        }
        return res.status(200).json({
            message: "Successfully appointed president",
            result,
        });
    } catch (err: any) {
        if (transactionStarted) await client.query("ROLLBACK");
        if (err.code === "23505") {
            return res.status(409).json({
                error: "President already exists in this club",
            });
        }
        console.error("Error while appointing president", err);
        return res.status(500).json({ error: "Internal server error" });
    } finally {
        client.release();
    }
};

const removePresident = async (req: AuthRequest, res: express.Response) => {
    try {
        const userId = req.body.userId;
        const clubId = getRouteParam(req.params.id);

        const clubRole = await getUserRoleInClub(userId, clubId);
        if (!clubRole || clubRole !== "president") {
            return res.status(404).json({ error: "User is not the president" });
        }

        const result = await deletePresident(userId, clubId);
        return res.status(200).json({
            message: "President removed successfully",
            result,
        });
    } catch (err) {
        console.error("Error while removing president role", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export {
    addMemberInClub,
    removeMemberInClub,
    showAllMembers,
    makeAdmin,
    removeAdmin,
    appointPresident,
    removePresident,
};
