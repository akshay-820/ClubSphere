import express from "express";
import { AuthRequest } from "../middleware/authMiddleware.js";
import { getRouteParam } from "../utils/validation.js";
import {
    createEventByClub,
    editEventById,
    editEventStatus,
    getEventById,
    getEventsByClub,
    getEventsByCollege,
} from "../db/queries/eventQueries.js";
import { uploadImage } from "../utils/uploadImage.js";
import {
    getEventRegistrationsById,
    isUserRegisteredForEvent,
} from "../db/queries/eventRegistrationsQueries.js";
import { sendEventCancelledEmail } from "../utils/mailer.js";

const getAllEvents = async (req: AuthRequest, res: express.Response) => {
    try {
        const collegeId = req.user?.collegeId;
        if (!collegeId) {
            return res
                .status(403)
                .json({ error: "Join a college to view events" });
        }

        const events = await getEventsByCollege(collegeId);
        return res.status(200).json({ events });
    } catch (err) {
        console.error("Error while getting all events", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const getEventDetails = async (req: AuthRequest, res: express.Response) => {
    try {
        const collegeId = req.user?.collegeId;
        if (!collegeId) {
            return res
                .status(403)
                .json({ error: "Join a college to view event details" });
        }
        const eventId = getRouteParam(req.params.id);

        const event = await getEventById(eventId, collegeId);
        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }
        const isRegistered = await isUserRegisteredForEvent(
            eventId,
            req.user!.userId,
        );
        return res.status(200).json({ event, isRegistered });
    } catch (err) {
        console.error("Error while getting event details", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const getClubEvents = async (req: AuthRequest, res: express.Response) => {
    try {
        const collegeId = req.user?.collegeId;
        if (!collegeId) {
            return res
                .status(403)
                .json({ error: "Join a college to view event details" });
        }
        const clubId = getRouteParam(req.params.id);

        const events = await getEventsByClub(clubId, collegeId);
        return res.status(200).json({ events });
    } catch (err) {
        console.error("Error while getting event details", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const createEvent = async (req: AuthRequest, res: express.Response) => {
    try {
        const {
            title,
            description,
            event_type,
            start_time,
            end_time,
            location,
            max_participants,
            registration_fee,
        } = req.body;

        if (
            !title ||
            !description ||
            !event_type ||
            !start_time ||
            !end_time ||
            !location ||
            registration_fee == null
        ) {
            return res.status(400).json({ error: "Missing fields required" });
        }

        //validate dates
        const start = new Date(start_time);
        const end = new Date(end_time);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ error: "Invalid date/time" });
        }

        if (start >= end) {
            return res.status(400).json({
                error: "End time must be after start time",
            });
        }

        //validate max_participants
        if (max_participants !== undefined && max_participants <= 0) {
            return res.status(400).json({
                error: "Maximum participants must be greater than 0",
            });
        }

        if (!req.file) {
            return res.status(400).json({ error: "Event banner required" });
        }
        const image = await uploadImage(req.file.buffer, "clubsphere/events");
        const banner_url = image.secure_url;
        const club_id = getRouteParam(req.params.id);

        const event = await createEventByClub({
            title,
            description,
            event_type,
            banner_url,
            start_time,
            end_time,
            location,
            max_participants,
            registration_fee,
            club_id,
        });

        return res.status(201).json({
            message: "Successfully created event",
            event,
        });
    } catch (err) {
        console.error("Error while creating event", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const editEvent = async (req: AuthRequest, res: express.Response) => {
    try {
        const eventId = getRouteParam(req.params.eventId);
        const clubId = getRouteParam(req.params.id);

        const collegeId = req.user?.collegeId;
        if (!collegeId) {
            return res
                .status(403)
                .json({ error: "Join college to edit event" });
        }

        const {
            title,
            description,
            event_type,
            start_time,
            end_time,
            location,
            max_participants,
            registration_fee,
        } = req.body;

        //validating time
        const existingEvent = await getEventById(eventId, collegeId);
        if (!existingEvent) {
            return res.status(404).json({ error: "Event not found" });
        }
        const existingStart = new Date(existingEvent.start_time);
        const existingEnd = new Date(existingEvent.end_time);

        if (start_time && end_time) {
            const start = new Date(start_time);
            const end = new Date(end_time);

            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return res.status(400).json({ error: "Invalid date/time" });
            }

            if (start >= end) {
                return res.status(400).json({
                    error: "End time must be after start time",
                });
            }
        }
        if (start_time) {
            const start = new Date(start_time);
            if (isNaN(start.getTime())) {
                return res.status(400).json({ error: "Invalid start time" });
            }
            if (start >= existingEnd) {
                return res
                    .status(400)
                    .json({ error: "End time must be after start time" });
            }
        }
        if (end_time) {
            const end = new Date(end_time);
            if (isNaN(end.getTime())) {
                return res.status(400).json({ error: "Invalid end time" });
            }
            if (existingStart >= end) {
                return res
                    .status(400)
                    .json({ error: "End time must be after start time" });
            }
        }

        //validating max participants
        if (max_participants !== undefined && max_participants <= 0) {
            return res
                .status(400)
                .json({ error: "Max participants should be greater than 0" });
        }

        //banner editing
        let banner_url: string | undefined = undefined;
        if (req.file) {
            const img = await uploadImage(
                req.file.buffer,
                "clubsphere/events",
                eventId,
            );
            banner_url = img.secure_url;
        }

        const event = await editEventById(eventId, clubId, {
            title,
            description,
            event_type,
            banner_url,
            start_time,
            end_time,
            location,
            max_participants,
            registration_fee,
        });
        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }

        return res.status(200).json({
            message: "Event updated successfully",
            event,
        });
    } catch (err) {
        console.error("Error while editing event", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const cancelEvent = async (req: AuthRequest, res: express.Response) => {
    try {
        const eventId = getRouteParam(req.params.eventId);
        const clubId = getRouteParam(req.params.id);

        const event = await editEventStatus(eventId, clubId, "cancelled");
        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }
        const registrations = await getEventRegistrationsById(eventId, clubId);

        for (const reg of registrations) {
            try {
                await sendEventCancelledEmail({
                    to: reg.email,
                    name: reg.name,
                    eventName: event.title,
                    clubName: event.club_name,
                });
            } catch (err) {
                console.error(
                    `Failed to send cancellation email to ${reg.email}`,
                    err,
                );
            }
        }
        return res.status(200).json({
            message: "Event cancelled successfully",
            event,
        });
    } catch (err) {
        console.error("Error while cancelling event", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export {
    getAllEvents,
    getEventDetails,
    getClubEvents,
    createEvent,
    editEvent,
    cancelEvent,
};
