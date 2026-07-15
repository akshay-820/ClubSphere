import { Router } from "express";
import { getAllPosts, getPostDetails } from "../controllers/postController.js";
import { isLoggedIn } from "../middleware/authMiddleware.js";

const router = Router();

router.route("/").get(isLoggedIn, getAllPosts);

router.route("/:id").get(isLoggedIn, getPostDetails);

export default router;
