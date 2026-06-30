import { Router } from "express";
import {
    getClubs,
    updateClubDetails,
    deleteClubPerm,
} from "../controllers/clubController.js";
import { isLoggedIn, roleGuard } from "../middleware/authMiddleware.js";

const router = Router();

router.route("/").get(isLoggedIn, getClubs);

router
    .route("/:id")
    .patch(
        isLoggedIn,
        roleGuard("college_admin", "super_admin"),
        updateClubDetails,
    )
    .delete(
        isLoggedIn,
        roleGuard("college_admin", "super_admin"),
        deleteClubPerm,
    );

export default router;
