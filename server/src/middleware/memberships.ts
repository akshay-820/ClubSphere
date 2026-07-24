import express from "express";
import { AuthRequest } from "./authMiddleware.js";
import { getRouteParam } from "../utils/validation.js";
import { getCollegeOfClub } from "../db/queries/clubQueries.js";

const canRemovePresident = async (
    req: AuthRequest,
    res: express.Response,
    next: express.NextFunction,
) => {
    //check if the college-admin is from the same college and then allow him to remove
    const userRole = req.user?.role;
    const userCollege = req.user?.collegeId;
    if (!userRole || !userCollege) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    if (userRole !== "college_admin") {
        return res.status(403).json({ error: "Forbidden" });
    }
    const clubId = getRouteParam(req.params.id);
    const clubCollege = await getCollegeOfClub(clubId);
    if (!clubCollege) {
        return res.status(404).json({ error: "Club not found" });
    }

    if (clubCollege.college_id !== userCollege) {
        return res.status(403).json({ error: "Forbidden" });
    }
    return next();
};

export { canRemovePresident };
