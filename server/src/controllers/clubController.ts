import express from "express";
import {
    getAllClubs,
    updateClub,
    deleteClub,
} from "../db/queries/clubQueries.js";
import { AuthRequest } from "../middleware/authMiddleware.js";
import { getRouteParam } from "../utils/validation.js";
import { error } from "node:console";

const getClubs = async (req: AuthRequest, res: express.Response) => {
    try {
        const collegeId = req.user?.collegeId;
        if (!collegeId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const clubs = await getAllClubs(collegeId);
        return res.status(200).json({
            clubs,
        });
    } catch (err) {
        console.error("Error fetching clubs");
        return res.status(500).json({
            error: "Internal server error",
        });
    }
};

const updateClubDetails = async (req: AuthRequest, res: express.Response) => {
    try {
        const id = getRouteParam(req.params.id);
        const collegeId = req.user?.collegeId;
        if (!collegeId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const {
            name,
            description,
            category,
            logo_url,
            membership_fee,
            accepting_members,
            registration_type,
            membership_duration_days,
        } = req.body;

        if (
            name === undefined &&
            description === undefined &&
            category === undefined &&
            logo_url === undefined &&
            membership_duration_days === undefined &&
            membership_fee === undefined &&
            accepting_members === undefined &&
            registration_type === undefined
        ) {
            return res.status(400).json({
                error: "Atleast one club field is required to update",
            });
        }

        const club = await updateClub(id, collegeId, {
            name,
            description,
            category,
            logo_url,
            membership_fee,
            accepting_members,
            registration_type,
            membership_duration_days,
        });

        if (!club) {
            return res.status(404).json({ error: "Club not found" });
        }
        return res.status(200).json({
            message: "Club details updated successfully",
            club,
        });
    } catch (err) {
        console.error("Error updating club", err);
        res.status(500).json({
            error: "Internal server error",
        });
    }
};

const deleteClubPerm = async (req: AuthRequest, res: express.Response) => {
    try {
        const id = getRouteParam(req.params.id);
        const collegeId = req.user?.collegeId;
        if (!collegeId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const club = await deleteClub(id, collegeId);
        if (!club) {
            return res.status(404).json({ error: "Club not found" });
        }

        return res.status(200).json({
            message: "Club deleted successfully",
            club,
        });
    } catch (err) {
        console.error("Error while deleting club", err);
        return res.status(500).json({
            error: "Internal server error",
        });
    }
};

export { getClubs, updateClubDetails, deleteClubPerm };
