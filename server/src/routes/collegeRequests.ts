import { Router } from "express";
import {
    requestCollegeCreation,
    listCollegeRequests,
    approveCollegeCreationRequest,
    rejectCollegeCreationRequest,
} from "../controllers/collegeRequestController.js";
import { isLoggedIn, roleGuard } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router
    .route("/")
    .post(upload.single("logo"), requestCollegeCreation)
    .get(isLoggedIn, roleGuard("super_admin"), listCollegeRequests);

router
    .route("/:id/approve")
    .patch(isLoggedIn, roleGuard("super_admin"), approveCollegeCreationRequest);

router
    .route("/:id/reject")
    .patch(isLoggedIn, roleGuard("super_admin"), rejectCollegeCreationRequest);

export default router;
