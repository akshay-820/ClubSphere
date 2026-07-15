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
import {
    addMemberInClub,
    removeMemberInClub,
    showAllMembers,
} from "../controllers/membershipController.js";
import {
    createNewPost,
    deletePost,
    getClubPosts,
    updatePost,
} from "../controllers/postController.js";

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

router
    .route("/:id/members")
    .get(isLoggedIn, showAllMembers)
    .post(isLoggedIn, canUpdateClub, addMemberInClub)
    .delete(isLoggedIn, canUpdateClub, removeMemberInClub);

//for posts CRUD
router
    .route("/:id/posts")
    .get(getClubPosts)
    .post(isLoggedIn, canUpdateClub, createNewPost);

router
    .route("/:id/posts/:postId")
    .patch(isLoggedIn, canUpdateClub, updatePost)
    .delete(isLoggedIn, canUpdateClub, deletePost);

export default router;
