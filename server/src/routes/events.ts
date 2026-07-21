/*
    1) getallevents - GET /events - isLoggedIn
    2) getEventDetails - GET /events/:id - isLoggedIn
    3) getClubEvents - GET /clubs/:id/events - isLoggedIn
    4) createEvent - POST /clubs/:id/events - isLoggedIn,canUpdateClub
    5) editEvent - PATCH /clubs/:clubId/events/:eventId - isLoggedIn,canUpdateClub
    6) cancelEvent - PATCH /clubs/:clubId/events/:eventId/cancel - same as above
*/
import { Router } from "express";
import {
    getAllEvents,
    getEventDetails,
} from "../controllers/eventController.js";
import { isLoggedIn } from "../middleware/authMiddleware.js";
import { canViewEventRegistrations } from "../middleware/eventRegistrations.js";
import { viewRegistrations } from "../controllers/eventRegistrations.js";

const router = Router();

router.route("/").get(isLoggedIn, getAllEvents);
router.route("/:id").get(isLoggedIn, getEventDetails);

//registrations
router
    .route("/:id/registrations")
    .get(isLoggedIn, canViewEventRegistrations, viewRegistrations);

export default router;
