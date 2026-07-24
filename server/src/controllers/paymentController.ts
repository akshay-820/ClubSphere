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
import {
    getClubOfEvent,
    isUserRegisteredForEvent,
} from "../db/queries/eventRegistrationsQueries.js";
import { getEventById } from "../db/queries/eventQueries.js";
import {
    createEventRegistrationRequest,
    lockEventAndGetCapacity,
    completePaymentAndEnsureRegistration,
    getPendingEventRegistrationById,
} from "../db/queries/eventPaymentQueries.js";

const paidRegistrationTypes = new Set(["paid", "both"]);

const createOrder = async (req: AuthRequest, res: express.Response) => {
    const client = await pool.connect();
    let transactionStarted = false;
    try {
        const { purpose } = req.body;
        const userId = req.user?.userId;
        const collegeId = req.user?.collegeId;
        if (!userId || !collegeId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        if (
            !purpose ||
            (purpose !== "membership_fee" && purpose !== "event_fee")
        ) {
            return res.status(400).json({ error: "Invalid order purpose " });
        }

        if (purpose === "membership_fee") {
            const { clubId } = req.body;

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
                return res.status(400).json({
                    error: "This club does not use paid registration",
                });
            }

            //check if the user is alredy a member
            const alreadyMember = await isMember(userId, clubId);
            if (alreadyMember) {
                return res
                    .status(409)
                    .json({ error: "User is already a member" });
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
                db: pool,
                userId: userId,
                clubId: clubId,
                amount: amount,
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
        } else {
            const { eventId } = req.body;
            if (typeof eventId !== "string") {
                return res.status(400).json({ error: "Invalid event" });
            }
            const club = await getClubOfEvent(eventId);
            const event = await getEventById(eventId, collegeId);
            if (!club || !event) {
                return res.status(404).json({ error: "Event not found" });
            }
            const clubId = club.club_id;
            if (club.college_id !== collegeId) {
                return res.status(404).json({ error: "Club not found" });
            }

            //check if event registration is valid
            if (event.status !== "scheduled") {
                return res
                    .status(400)
                    .json({ error: "Event registrations closed" });
            }

            const alreadyRegistered = await isUserRegisteredForEvent(
                eventId,
                userId,
            );
            if (alreadyRegistered) {
                return res
                    .status(400)
                    .json({ error: "User already registered for the event" });
            }

            await client.query("BEGIN");
            transactionStarted = true;

            const cap = await lockEventAndGetCapacity(client, eventId);
            const capacity = cap.rows[0];

            const maxParticipants = capacity.max_participants;
            const registered = Number(capacity.registered_count);
            const pending = Number(capacity.pending_count);

            if (
                maxParticipants !== null &&
                registered + pending >= maxParticipants
            ) {
                await client.query("ROLLBACK");
                transactionStarted = false;
                return res.status(400).json({ error: "Event is full" });
            }

            const alreadyRequested = await getPendingEventRegistrationById(
                client,
                userId,
                eventId,
            );
            if (alreadyRequested) {
                await client.query("ROLLBACK");
                transactionStarted = false;
                return res
                    .status(400)
                    .json({ error: "Wait for few more mins to try again" });
            }

            const amount = Number(event.registration_fee);
            if (!Number.isFinite(amount) || amount <= 0) {
                return res
                    .status(400)
                    .json({ error: "Event fee is not configured" });
            }
            const amountInPaise = Math.round(amount * 100);

            const order = await createRazorpayOrder({
                amountInPaise,
                receipt: `event_${eventId.slice(0, 12)}_${Date.now()}`,
                notes: {
                    purpose: "event_fee",
                    clubId,
                    userId,
                    eventId,
                },
            });

            const payment = await createPendingPayment({
                db: client,
                userId: userId,
                clubId: clubId,
                eventId: eventId,
                amount: amount,
                purpose: "event_fee",
                razorpayOrderId: order.id,
            });

            const pending_registration = await createEventRegistrationRequest(
                client,
                userId,
                eventId,
                payment.id,
            );

            await client.query("COMMIT");
            transactionStarted = false;

            return res.status(201).json({
                keyId: getRazorpayKeyId(),
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                clubName: club.name,
                eventName: event.title,
                paymentId: payment.id,
                pending_registration,
            });
        }
    } catch (err) {
        if (transactionStarted) await client.query("ROLLBACK");
        console.error("Error while creating razorpay order", err);
        return res.status(500).json({
            error: "Unable to create order, try again after a few mins",
        });
    } finally {
        client.release();
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

        await client.query("BEGIN");
        const payment = await getPaymentByIdForUpdate(client, paymentId);
        if (!payment) {
            await client.query("ROLLBACK");
            return res.status(404).json({ error: "Payment not found" });
        }

        if (
            payment.user_id !== userId ||
            payment.razorpay_order_id !== razorpay_order_id
        ) {
            await client.query("ROLLBACK");
            return res.status(403).json({ error: "Payment mismatch" });
        }

        if (
            payment.purpose !== "membership_fee" &&
            payment.purpose !== "event_fee"
        ) {
            await client.query("ROLLBACK");
            return res.status(400).json({ error: "Invalid payment purpose" });
        }
        if (payment.status === "completed") {
            await client.query("COMMIT");
            return res.status(200).json({
                message: "Payment already verified",
            });
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

        if (payment.purpose === "membership_fee") {
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
        }
        const result = await completePaymentAndEnsureRegistration(
            client,
            payment,
            razorpay_payment_id,
        );
        await client.query("COMMIT");
        return res.status(200).json({
            message: "Payment verified and event registration done",
            payment: result.payment,
            registration: result.registration,
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

        if (!payment) {
            await client.query("COMMIT");
            return res.status(200).json({ received: true });
        }
        if (payment.status === "completed") {
            await client.query("COMMIT");
            return res.status(200).json({ received: true });
        }
        if (payment.purpose === "membership_fee") {
            await completePaymentAndEnsureMembership(
                client,
                payment,
                razorpayPaymentId,
            );
        } else if (payment.purpose === "event_fee") {
            await completePaymentAndEnsureRegistration(
                client,
                payment,
                razorpayPaymentId,
            );
        } else {
            await client.query("ROLLBACK");
            console.error("Invalid payment purpose:", payment.purpose);
            return res.status(400).json({ error: "Invalid payment purpose" });
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
