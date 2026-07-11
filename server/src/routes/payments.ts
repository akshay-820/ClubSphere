import { Router } from "express";
import {
    createOrder,
    handleWebhook,
    verifyPayment,
} from "../controllers/paymentController.js";
import { isLoggedIn } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/create-order", isLoggedIn, createOrder);
router.post("/verify", isLoggedIn, verifyPayment);
router.post("/webhook", handleWebhook);

export default router;
