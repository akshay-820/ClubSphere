import { Router } from "express";
import {
    getClubs,
    updateClubDetails,
    deleteClubPerm,
    getClubDetailsById,
    searchUsersToAdd,
} from "../controllers/clubController.js";
import { isLoggedIn, roleGuard } from "../middleware/authMiddleware.js";
import {
    canPerformMajorClubOperations,
    canUpdateClub,
} from "../middleware/clubMiddleware.js";
import { upload } from "../middleware/upload.js";
import {
    addMemberInClub,
    appointPresident,
    makeAdmin,
    removeAdmin,
    removeMemberInClub,
    showAllMembers,
} from "../controllers/membershipController.js";
import {
    createNewPost,
    deletePost,
    getClubPosts,
    updatePost,
} from "../controllers/postController.js";
import {
    cancelEvent,
    createEvent,
    editEvent,
    getClubEvents,
} from "../controllers/eventController.js";

const router = Router();

router.route("/").get(isLoggedIn, getClubs);

router
    .route("/:id")
    .get(isLoggedIn, getClubDetailsById)
    .patch(isLoggedIn, canUpdateClub, upload.single("logo"), updateClubDetails)
    .delete(isLoggedIn, canPerformMajorClubOperations, deleteClubPerm);

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
    .post(isLoggedIn, canUpdateClub, upload.array("media"), createNewPost);

router
    .route("/:id/posts/:postId")
    .patch(isLoggedIn, canUpdateClub, updatePost)
    .delete(isLoggedIn, canUpdateClub, deletePost);

//for events - get,edit,create
router
    .route("/:id/events")
    .get(isLoggedIn, getClubEvents)
    .post(isLoggedIn, canUpdateClub, upload.single("banner"), createEvent);

router
    .route("/:id/events/:eventId")
    .patch(isLoggedIn, canUpdateClub, upload.single("banner"), editEvent);

router
    .route("/:id/events/:eventId/cancel")
    .patch(isLoggedIn, canUpdateClub, cancelEvent);

//update user club role
router.route("/:id/make-admin").post(isLoggedIn, canUpdateClub, makeAdmin);
router
    .route("/:id/remove-admin")
    .post(isLoggedIn, canPerformMajorClubOperations, removeAdmin);
router
    .route("/:id/make-president")
    .post(isLoggedIn, canPerformMajorClubOperations, appointPresident);

export default router;
