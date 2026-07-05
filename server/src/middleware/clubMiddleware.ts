import express from "express";
import { AuthRequest } from "./authMiddleware.js";
import { getClubById } from "../db/queries/clubQueries.js";
import { getUserRoleInClub } from "../db/queries/membershipQueries.js";
import { getRouteParam } from "../utils/validation.js";

const canUpdateClub = async (
    req: AuthRequest,
    res: express.Response,
    next: express.NextFunction,
) => {
    const userId = req.user?.userId;
    const clubId = getRouteParam(req.params.id);

    if (!userId || !clubId) {
        return res.status(400).json({ error: "Bad Request" });
    }

    const role = req.user?.role;

    if (role === "super_admin") {
        return next();
    }

    if (role === "college_admin") {
        const collegeId = req.user?.collegeId;
        if (!collegeId) {
            return res.status(400).json({ error: "Bad Request" });
        }
        const club = await getClubById(clubId);
        if (!club) {
            return res.status(404).json({ error: "Club not found" });
        }
        if (club.college_id !== collegeId) {
            return res.status(403).json({ error: "Forbidden" });
        }
        return next();
    }

    const clubRole = await getUserRoleInClub(userId, clubId);
    if (clubRole === "admin" || clubRole === "president") {
        return next();
    }

    return res.status(403).json({ error: "Forbidden" });
};

const canDeleteClub = async (
    req: AuthRequest,
    res: express.Response,
    next: express.NextFunction,
) => {
    const userId = req.user?.userId;
    const clubId = getRouteParam(req.params.id);

    if (!userId || !clubId) {
        return res.status(400).json({ error: "Bad Request" });
    }

    const role = req.user?.role;

    if (role === "super_admin") {
        return next();
    }

    if (role === "college_admin") {
        const collegeId = req.user?.collegeId;
        if (!collegeId) {
            return res.status(400).json({ error: "Bad Request" });
        }
        const club = await getClubById(clubId);
        if (!club) {
            return res.status(404).json({ error: "Club not found" });
        }
        if (club.college_id !== collegeId) {
            return res.status(403).json({ error: "Forbidden" });
        }
        return next();
    }

    const clubRole = await getUserRoleInClub(userId, clubId);
    if (clubRole === "president") {
        return next();
    }

    return res.status(403).json({ error: "Forbidden" });
};

export { canUpdateClub, canDeleteClub };
