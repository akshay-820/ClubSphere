import express from "express";
import pool from "../db/index.js";
import { getClubById } from "../db/queries/clubQueries.js";
import { isMember } from "../db/queries/membershipQueries.js";
import {
    completePaymentAndEnsureMembership,
    createPendingPayment,
    getPaymentByIdForUpdate,
    getPaymentByRazorpayOrderIdForUpdate,
} from "../db/queries/paymentQueries.js";
import { AuthRequest } from "../middleware/authMiddleware.js";
import {
    createRazorpayOrder,
    getRazorpayKeyId,
    verifyRazorpayPaymentSignature,
    verifyRazorpayWebhookSignature,
} from "../utils/razorpay.js";

const paidRegistrationTypes = new Set(["paid", "both"]);

const createOrder = async (req: AuthRequest, res: express.Response) => {
    try {
        const userId = req.user?.userId;
        const collegeId = req.user?.collegeId;
        const { clubId } = req.body;

        if (!userId || !collegeId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (typeof clubId !== "string") {
            return res.status(400).json({ error: "Invalid club" });
        }

        //see if the club is from the same college
        const club = await getClubById(clubId);
        if (!club || club.college_id !== collegeId) {
            return res.status(404).json({ error: "Club not found" });
        }

        if (!club.accepting_members) {
            return res
                .status(400)
                .json({ error: "This club is not accepting members" });
        }

        if (!paidRegistrationTypes.has(club.registration_type)) {
            return res
                .status(400)
                .json({ error: "This club does not use paid registration" });
        }

        //check if the user is alredy a member
        const alreadyMember = await isMember(userId, clubId);
        if (alreadyMember) {
            return res.status(409).json({ error: "User is already a member" });
        }

        const amount = Number(club.membership_fee);
        if (!Number.isFinite(amount) || amount <= 0) {
            return res
                .status(400)
                .json({ error: "Club membership fee is not configured" });
        }

        const amountInPaise = Math.round(amount * 100);
        //create razorpay order and store the pending request in the payments table as well
        const order = await createRazorpayOrder({
            amountInPaise,
            receipt: `membership_${clubId.slice(0, 12)}_${Date.now()}`,
            notes: {
                purpose: "membership_fee",
                clubId,
                userId,
            },
        });

        const payment = await createPendingPayment({
            userId,
            clubId,
            amount,
            purpose: "membership_fee",
            razorpayOrderId: order.id,
        });

        return res.status(201).json({
            keyId: getRazorpayKeyId(),
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            clubName: club.name,
            paymentId: payment.id,
        });
    } catch (err) {
        console.error("Error creating Razorpay order", err);
        return res
            .status(500)
            .json({ error: "Unable to create payment order" });
    }
};

const verifyPayment = async (req: AuthRequest, res: express.Response) => {
    const client = await pool.connect();
    try {
        const userId = req.user?.userId;
        const {
            paymentId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (
            typeof paymentId !== "string" ||
            typeof razorpay_order_id !== "string" ||
            typeof razorpay_payment_id !== "string" ||
            typeof razorpay_signature !== "string"
        ) {
            return res.status(400).json({ error: "Invalid payment details" });
        }

        //everything should execute or not even one
        await client.query("BEGIN");

        const payment = await getPaymentByIdForUpdate(client, paymentId);
        if (!payment) {
            await client.query("ROLLBACK");
            return res.status(404).json({ error: "Payment not found" });
        }

        if (
            payment.user_id !== userId ||
            payment.razorpay_order_id !== razorpay_order_id ||
            payment.purpose !== "membership_fee"
        ) {
            await client.query("ROLLBACK");
            return res.status(403).json({ error: "Payment mismatch" });
        }

        const isValidSignature = verifyRazorpayPaymentSignature({
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
        });

        if (!isValidSignature) {
            await client.query("ROLLBACK");
            return res.status(400).json({ error: "Invalid payment signature" });
        }

        const result = await completePaymentAndEnsureMembership(
            client,
            payment,
            razorpay_payment_id,
        );

        await client.query("COMMIT");

        return res.status(200).json({
            message: "Payment verified and membership activated",
            payment: result.payment,
            membership: result.membership,
        });
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("Error verifying Razorpay payment", err);
        return res.status(500).json({ error: "Unable to verify payment" });
    } finally {
        client.release();
    }
};

const handleWebhook = async (req: express.Request, res: express.Response) => {
    const client = await pool.connect();
    try {
        const signature = req.header("x-razorpay-signature");
        if (!signature) {
            return res.status(400).json({ error: "Missing signature" });
        }

        const rawBody = req.body as Buffer;
        const isValidSignature = verifyRazorpayWebhookSignature(
            rawBody,
            signature,
        );

        if (!isValidSignature) {
            return res.status(400).json({ error: "Invalid signature" });
        }

        const event = JSON.parse(rawBody.toString("utf8")) as {
            event?: string;
            payload?: {
                payment?: {
                    entity?: {
                        id?: string;
                        order_id?: string;
                        status?: string;
                    };
                };
            };
        };

        const razorpayPayment = event.payload?.payment?.entity;
        const razorpayPaymentId = razorpayPayment?.id;
        const razorpayOrderId = razorpayPayment?.order_id;

        if (
            !["payment.captured", "order.paid"].includes(event.event ?? "") ||
            typeof razorpayPaymentId !== "string" ||
            typeof razorpayOrderId !== "string"
        ) {
            return res.status(200).json({ received: true });
        }

        await client.query("BEGIN");

        const payment = await getPaymentByRazorpayOrderIdForUpdate(
            client,
            razorpayOrderId,
        );

        if (payment && payment.purpose === "membership_fee") {
            await completePaymentAndEnsureMembership(
                client,
                payment,
                razorpayPaymentId,
            );
        }

        await client.query("COMMIT");

        return res.status(200).json({ received: true });
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("Error handling Razorpay webhook", err);
        return res.status(500).json({ error: "Unable to handle webhook" });
    } finally {
        client.release();
    }
};

export { createOrder, handleWebhook, verifyPayment };
