import { Router } from "express";
import {
    getClubs,
    updateClubDetails,
    deleteClubPerm,
} from "../controllers/clubController.js";
import { isLoggedIn } from "../middleware/authMiddleware.js";
import { canDeleteClub, canUpdateClub } from "../middleware/clubMiddleware.js";

const router = Router();

router.route("/").get(isLoggedIn, getClubs);

router
    .route("/:id")
    .patch(isLoggedIn, canUpdateClub, updateClubDetails)
    .delete(isLoggedIn, canDeleteClub, deleteClubPerm);

export default router;
