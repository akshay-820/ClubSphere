import express from "express";
import {
    createClubRequest,
    getClubRequests,
    approveClubRequest,
    rejectClubRequest,
} from "../db/queries/clubRequestQueries.js";
import { AuthRequest } from "../middleware/authMiddleware.js";
import { getRouteParam, optionalTrimmedString } from "../utils/validation.js";
import { findClubInCollege } from "../db/queries/clubQueries.js";

const requestClubCreation = async (req: AuthRequest, res: express.Response) => {
    try {
        const userId = req.user?.userId;
        const collegeId = req.user?.collegeId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        if (!collegeId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { name, description, category, logo_url, membership_fee } =
            req.body;

        if (!name || !category) {
            return res.status(400).json({
                error: "Required field missing",
            });
        }

        const existingClub = await findClubInCollege(collegeId, name);
        if (existingClub) {
            return res.status(408).json({
                error: "Club with this name already exists in the College",
            });
        }

        const clubRequest = await createClubRequest({
            name: name,
            description: description,
            category: category,
            logo_url: logo_url,
            membership_fee: membership_fee,
            college_id: collegeId,
            requested_by: userId,
        });

        return res.status(201).json({
            message: "Club Request submitted succesfully",
            club_request: clubRequest,
        });
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
};

const listClubRequests = async (req: AuthRequest, res: express.Response) => {
    try {
        const collegeId = req.user?.collegeId;
        if (!collegeId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const clubRequests = await getClubRequests(collegeId);
        return res.status(200).json({
            club_requests: clubRequests,
        });
    } catch (err) {
        console.error("Error fetching club requests", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const approveClubCreationRequest = async (
    req: express.Request,
    res: express.Response,
) => {
    try {
        const result = await approveClubRequest(getRouteParam(req.params.id));
        if (result.type === "not_found") {
            return res.status(404).json({ error: "Club Request not found" });
        }

        if (result.type === "club_exists") {
            return res.status(409).json({
                error: "Club already exists",
                club: result.club,
            });
        }

        return res.status(200).json({
            message: "Club request approved",
            club: result.club,
        });
    } catch (error) {
        console.error("Error approving club request", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const rejectClubCreationRequest = async (
    req: express.Request,
    res: express.Response,
) => {
    try {
        const reject = await rejectClubRequest(getRouteParam(req.params.id));
        if (reject.type === "not_found") {
            return res.status(404).json({ error: "Club Request not found" });
        }
        return res.status(200).json({
            message: "Club request rejected successfully",
        });
    } catch (error) {
        console.error("Error while rejecting the club request", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export {
    requestClubCreation,
    listClubRequests,
    approveClubCreationRequest,
    rejectClubCreationRequest,
};
