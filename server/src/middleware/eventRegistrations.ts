import express from "express";
import { AuthRequest } from "./authMiddleware.js";
import { getRouteParam } from "../utils/validation.js";
import { getClubOfEvent } from "../db/queries/eventRegistrationQueries.js";
import { getUserRoleInClub } from "../db/queries/membershipQueries.js";

const canViewEventRegistrations = async (
    req: AuthRequest,
    res: express.Response,
    next: express.NextFunction,
) => {
    const userId = req.user?.userId;
    if (!userId) {
        return res.status(403).json({ error: "User not logged in" });
    }
    const eventId = getRouteParam(req.params.id);

    const clubId = await getClubOfEvent(eventId);
    if (!clubId) {
        return res.status(404).json({ error: "Event not found" });
    }
    const role = await getUserRoleInClub(userId, clubId);
    const globalRole = req.user?.role;

    if (
        role === "admin" ||
        role === "president" ||
        globalRole === "college_admin" ||
        globalRole === "super_admin"
    ) {
        return next();
    }

    return res.status(403).json({ error: "Forbidden" });
};

export { canViewEventRegistrations };
