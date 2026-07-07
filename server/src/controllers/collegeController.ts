import express from "express";
import {
    deleteCollege,
    getAllColleges,
    getCollegeById,
    updateCollege,
} from "../db/queries/collegeQueries.js";

import {
    getRouteParam,
    normalizeEmailDomain,
    optionalTrimmedString,
} from "../utils/validation.js";
import { uploadImage } from "../utils/uploadImage.js";

const getCollegeDetails = async (
    req: express.Request,
    res: express.Response,
) => {
    try {
        const id = getRouteParam(req.params.id);
        const college = await getCollegeById(id);
        if (!college) {
            return res.status(404).json({ error: "College not found" });
        }
        return res.status(200).json({ college });
    } catch (error) {
        console.error("Error fetching college:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const getColleges = async (req: express.Request, res: express.Response) => {
    try {
        const colleges = await getAllColleges();
        return res.status(200).json({ colleges });
    } catch (error) {
        console.error("Error fetching colleges:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const updateCollegeDetails = async (
    req: express.Request,
    res: express.Response,
) => {
    try {
        const id = getRouteParam(req.params.id);
        const { name, email_domain } = req.body;

        // If a file was uploaded, send it to Cloudinary and use the returned URL
        let logo_url: string | undefined = undefined;
        if (req.file) {
            const result = await uploadImage(
                req.file.buffer,
                "clubsphere/college-logos",
                id,
            );
            logo_url = result.secure_url;
        }
        if (
            name === undefined &&
            email_domain === undefined &&
            logo_url === undefined
        ) {
            return res
                .status(400)
                .json({ error: "At least one college field is required" });
        }

        const trimmedName = optionalTrimmedString(name);
        const normalizedEmailDomain =
            typeof email_domain === "string"
                ? normalizeEmailDomain(email_domain)
                : undefined;

        if (trimmedName === "" || normalizedEmailDomain === "") {
            return res
                .status(400)
                .json({ error: "College fields cannot be empty" });
        }

        const college = await updateCollege(id, {
            name: trimmedName,
            email_domain: normalizedEmailDomain,
            logo_url,
        });

        if (!college) {
            return res.status(404).json({ error: "College not found" });
        }

        return res.status(200).json({
            message: "College updated successfully",
            college,
        });
    } catch (error: any) {
        if (error?.code === "23505") {
            return res
                .status(409)
                .json({ error: "A college with this email domain exists" });
        }

        console.error("Error updating college:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const deleteCollegePerm = async (
    req: express.Request,
    res: express.Response,
) => {
    try {
        const id = getRouteParam(req.params.id);
        const college = await deleteCollege(id);

        if (!college) {
            return res.status(404).json({ error: "College not found" });
        }

        return res.status(200).json({
            message: "College deleted successfully",
            college,
        });
    } catch (error) {
        console.error("Error deleting college:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export {
    deleteCollegePerm,
    getColleges,
    getCollegeDetails,
    updateCollegeDetails,
};
