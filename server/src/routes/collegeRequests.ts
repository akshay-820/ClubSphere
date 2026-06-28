import { Router } from "express";
import {
    requestCollegeCreation,
    listCollegeRequests,
    approveCollegeCreationRequest,
    rejectCollegeCreationRequest,
} from "../controllers/collegeRequestController.js";
import { isLoggedIn, roleGuard } from "../middleware/authMiddleware.js";

const router = Router();

router
    .route("/")
    .post(isLoggedIn, requestCollegeCreation)
    .get(isLoggedIn, roleGuard("super_admin"), listCollegeRequests);

router
    .route("/:id/approve")
    .patch(isLoggedIn, roleGuard("super_admin"), approveCollegeCreationRequest);

router
    .route("/:id/reject")
    .patch(isLoggedIn, roleGuard("super_admin"), rejectCollegeCreationRequest);

export default router;
