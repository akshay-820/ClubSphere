import express from "express";
import {
    getAllClubs,
    updateClub,
    deleteClub,
    getClubById,
} from "../db/queries/clubQueries.js";
import { AuthRequest } from "../middleware/authMiddleware.js";
import { getRouteParam } from "../utils/validation.js";
import { uploadImage } from "../utils/uploadImage.js";

//get all clubs in a college
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

//edit club details
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
            membership_fee,
            accepting_members,
            registration_type,
            membership_duration_days,
        } = req.body;

        // If a file was uploaded, send it to Cloudinary and use the returned URL
        let logo_url: string | undefined = undefined;
        if (req.file) {
            const result = await uploadImage(
                req.file.buffer,
                "clubsphere/club-logos",
                id,
            );
            logo_url = result.secure_url;
        }

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

//delete club
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

const getClubDetailsById = async (req: AuthRequest, res: express.Response) => {
    try {
        const id = getRouteParam(req.params.id);
        const club = await getClubById(id);
        if (!club) {
            return res.status(404).json({ error: "Club not found" });
        }
        return res.status(200).json({
            club,
        });
    } catch (err) {
        console.error("Error getting club details", err);
        return res.status(500).json({
            error: "Internal server error",
        });
    }
};

export { getClubs, updateClubDetails, deleteClubPerm, getClubDetailsById };
