import { Router } from "express";
import express from "express";
const router = Router();
import {
    loginUser,
    registerUser,
    verifyRegistrationOtp,
} from "../controllers/authController.js";
import { AuthRequest, isLoggedIn } from "../middleware/authMiddleware.js";

router.route("/register").post(registerUser);
router.route("/register/verify").post(verifyRegistrationOtp);

router.route("/login").post(loginUser);

router
    .route("/protected")
    .get(isLoggedIn, (req: AuthRequest, res: express.Response) => {
        res.send("This is a protected route");
    });

export default router;
