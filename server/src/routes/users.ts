import { Router } from "express";
import {
    getMyProfile,
    updateMyProfile,
} from "../controllers/userController.js";
import { isLoggedIn } from "../middleware/authMiddleware.js";

const router = Router();

router.route("/me").get(isLoggedIn, getMyProfile).patch(isLoggedIn, updateMyProfile);

export default router;
