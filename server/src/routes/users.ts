import { Router } from "express";
import {
    getMyProfile,
    updateMyProfile,
} from "../controllers/userController.js";
import { isLoggedIn } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router
    .route("/me")
    .get(isLoggedIn, getMyProfile)
    .patch(isLoggedIn, upload.single("avatar"), updateMyProfile);

export default router;
