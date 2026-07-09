import { Router } from "express";
import {
    getClubs,
    updateClubDetails,
    deleteClubPerm,
    getClubDetailsById,
    searchUsersToAdd,
} from "../controllers/clubController.js";
import { isLoggedIn } from "../middleware/authMiddleware.js";
import { canDeleteClub, canUpdateClub } from "../middleware/clubMiddleware.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.route("/").get(isLoggedIn, getClubs);

router
    .route("/:id")
    .get(isLoggedIn, getClubDetailsById)
    .patch(isLoggedIn, canUpdateClub, upload.single("logo"), updateClubDetails)
    .delete(isLoggedIn, canDeleteClub, deleteClubPerm);

router
    .route("/:id/search-users")
    .get(isLoggedIn, canUpdateClub, searchUsersToAdd);
export default router;
