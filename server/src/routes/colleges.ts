import { Router } from "express";
import {
    deleteCollegePerm,
    getColleges,
    getCollegeDetails,
    updateCollegeDetails,
} from "../controllers/collegeController.js";
import { isLoggedIn, roleGuard } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";

const router = Router();

// Public: list all colleges (used for registration dropdown, etc.)
router.route("/").get(getColleges);

// Authenticated: get a specific college by ID
// Used by college_admin to fetch their own college details for editing
router
    .route("/:id")
    .get(isLoggedIn, getCollegeDetails)
    .patch(
        isLoggedIn,
        roleGuard("super_admin", "college_admin"),
        upload.single("logo"),
        updateCollegeDetails,
    )
    .delete(isLoggedIn, roleGuard("super_admin"), deleteCollegePerm);

export default router;
