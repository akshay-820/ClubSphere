import express from "express";
import { AuthRequest } from "../middleware/authMiddleware.js";
import { getRouteParam } from "../utils/validation.js";
import { getAllRegistrations } from "../db/queries/eventRegistrationQueries.js";

const viewRegistrations = async (req: AuthRequest, res: express.Response) => {
    try {
        const eventId = getRouteParam(req.params.id);
        const registrations = await getAllRegistrations(eventId);

        return res.status(200).json({
            registrations,
        });
    } catch (err) {
        console.error("Error while getting event registrations", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export { viewRegistrations };
