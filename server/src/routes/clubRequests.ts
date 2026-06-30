import { Router } from "express";
import {
    requestClubCreation,
    listClubRequests,
    approveClubCreationRequest,
    rejectClubCreationRequest,
} from "../controllers/clubRequestController.js";
import { isLoggedIn, roleGuard } from "../middleware/authMiddleware.js";

const router = Router();

router
    .route("/")
    .get(isLoggedIn, roleGuard("college_admin"), listClubRequests)
    .post(isLoggedIn, requestClubCreation);

router
    .route("/:id/approve")
    .post(isLoggedIn, roleGuard("college_admin"), approveClubCreationRequest);

router
    .route("/:id/reject")
    .delete(isLoggedIn, roleGuard("college_admin"), rejectClubCreationRequest);

export default router;
