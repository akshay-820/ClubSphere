import express from "express";
import {
    createCollegeRequest,
    rejectCollegeRequest,
    getCollegeRequests,
    approveCollegeRequest,
} from "../db/queries/collegeRequestQueries.js";
import { AuthRequest } from "../middleware/authMiddleware.js";
import { getCollegeByEmailDomain } from "../db/queries/collegeQueries.js";
import {
    getRouteParam,
    normalizeEmailDomain,
    optionalTrimmedString,
} from "../utils/validation.js";

// requests a new college to be created - flow = validate incoming data -> check if college already exists -> create a new college request
const requestCollegeCreation = async (
    req: AuthRequest,
    res: express.Response,
) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { college_name, email_domain, logo_url } = req.body;
        const collegeName = optionalTrimmedString(college_name);
        const emailDomain =
            typeof email_domain === "string"
                ? normalizeEmailDomain(email_domain)
                : "";
        const logoUrl = typeof logo_url === "string" ? logo_url.trim() : "";

        if (!collegeName || !emailDomain || !logoUrl) {
            return res.status(400).json({
                error: "College name, email domain, and logo URL are required",
            });
        }

        const existingCollege = await getCollegeByEmailDomain(emailDomain);

        if (existingCollege) {
            return res.status(409).json({
                error: "A college with this email domain already exists",
                college: existingCollege,
            });
        }

        const collegeRequest = await createCollegeRequest({
            college_name: collegeName,
            email_domain: emailDomain,
            logo_url: logoUrl,
            requested_by: userId,
        });

        return res.status(201).json({
            message: "College request submitted successfully",
            college_request: collegeRequest,
        });
    } catch (error: any) {
        if (error?.code === "23505") {
            return res.status(409).json({
                error: "A college request with this email domain already exists",
            });
        }

        console.error("Error creating college request:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// lists all the colleges for the super admin to approve or reject the college creation requests
const listCollegeRequests = async (
    req: express.Request,
    res: express.Response,
) => {
    try {
        const collegeRequests = await getCollegeRequests("pending");
        return res.status(200).json({ college_requests: collegeRequests });
    } catch (error) {
        console.error("Error fetching college requests:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const approveCollegeCreationRequest = async (
    req: express.Request,
    res: express.Response,
) => {
    try {
        const result = await approveCollegeRequest(
            getRouteParam(req.params.id),
        );

        if (result.type === "not_found") {
            return res.status(404).json({ error: "College request not found" });
        }

        if (result.type === "college_exists") {
            return res.status(409).json({
                error: "A college with this email domain already exists",
                college: result.college,
            });
        }

        return res.status(200).json({
            message: "College request approved successfully",
            college: result.college,
        });
    } catch (error) {
        console.error("Error approving college request:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const rejectCollegeCreationRequest = async (
    req: express.Request,
    res: express.Response,
) => {
    try {
        const rejected = await rejectCollegeRequest(
            getRouteParam(req.params.id),
        );

        if (!rejected) {
            return res
                .status(404)
                .json({ error: "Pending college request not found" });
        }

        return res.status(200).json({
            message: "College request rejected successfully",
        });
    } catch (error) {
        console.error("Error rejecting college request:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export {
    requestCollegeCreation,
    listCollegeRequests,
    approveCollegeCreationRequest,
    rejectCollegeCreationRequest,
};
