import { Router } from "express";
import {
    deleteCollegePerm,
    getColleges,
    updateCollegeDetails,
} from "../controllers/collegeController.js";
import { isLoggedIn, roleGuard } from "../middleware/authMiddleware.js";

const router = Router();

router.route("/").get(getColleges);

router
    .route("/:id")
    .patch(
        isLoggedIn,
        roleGuard("super_admin", "college_admin"),
        updateCollegeDetails,
    )
    .delete(isLoggedIn, roleGuard("super_admin"), deleteCollegePerm);

export default router;
