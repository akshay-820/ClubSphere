import { Router } from "express";
import express from "express";
const router = Router();
import {
    loginUser,
    logoutUser,
    registerUser,
    verifyRegistrationOtp,
} from "../controllers/authController.js";
import {
    AuthRequest,
    isLoggedIn,
    roleGuard,
} from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";

router.route("/register").post(upload.single("avatar"), registerUser);
router.route("/register/verify").post(verifyRegistrationOtp);

router.route("/login").post(loginUser);
router.route("/logout").post(isLoggedIn, logoutUser);

router
    .route("/protected")
    .get(
        isLoggedIn,
        roleGuard("super_admin"),
        (req: AuthRequest, res: express.Response) => {
            res.send("This is a protected route");
        },
    );

export default router;
