import { PoolClient } from "pg";
import pool from "../index.js";

export type PaymentRecord = {
    id: string;
    user_id: string;
    club_id: string;
    event_id?: string;
    amount: string;
    purpose: "membership_fee" | "event_fee";
    status: "pending" | "completed" | "failed";
    razorpay_order_id: string | null;
    razorpay_payment_id: string | null;
    paid_at: Date | null;
    created_at: Date;
};

export async function createPendingPayment(input: {
    userId: string;
    clubId: string;
    amount: number;
    purpose: "membership_fee" | "event_fee";
    razorpayOrderId: string;
    eventId?: string;
}) {
    const query = `
        INSERT INTO payments (
            user_id,
            club_id,
            amount,
            purpose,
            status,
            razorpay_order_id,
            event_id
        )
        VALUES ($1, $2, $3, $4, 'pending', $5, $6)
        RETURNING *;
    `;
    const result = await pool.query<PaymentRecord>(query, [
        input.userId,
        input.clubId,
        input.amount,
        input.purpose,
        input.razorpayOrderId,
        input.eventId ?? null,
    ]);
    const payment = result.rows[0];
    if (!payment) {
        throw new Error("Failed to create pending payment");
    }
    return payment;
}

export async function getPaymentByIdForUpdate(
    client: PoolClient,
    paymentId: string,
) {
    const result = await client.query<PaymentRecord>(
        `
            SELECT *
            FROM payments
            WHERE id = $1
            FOR UPDATE;
        `,
        [paymentId],
    );
    return result.rows[0] ?? null;
}

export async function getPaymentByRazorpayOrderIdForUpdate(
    client: PoolClient,
    razorpayOrderId: string,
) {
    const result = await client.query<PaymentRecord>(
        `
            SELECT *
            FROM payments
            WHERE razorpay_order_id = $1
            FOR UPDATE;
        `,
        [razorpayOrderId],
    );
    return result.rows[0] ?? null;
}

export async function completePaymentAndEnsureMembership(
    client: PoolClient,
    payment: PaymentRecord,
    razorpayPaymentId: string,
) {
    const completedPayment = await client.query<PaymentRecord>(
        `
            UPDATE payments
            SET
                status = 'completed',
                razorpay_payment_id = COALESCE(razorpay_payment_id, $2),
                paid_at = COALESCE(paid_at, NOW())
            WHERE id = $1
            RETURNING *;
        `,
        [payment.id, razorpayPaymentId],
    );

    const membership = await client.query(
        `
            INSERT INTO memberships (
                user_id,
                club_id,
                joined_at,
                ends_at,
                payment_id
            )
            SELECT
                $1,
                c.id,
                CURRENT_DATE,
                CURRENT_DATE + c.membership_duration_days,
                $3
            FROM clubs c
            WHERE c.id = $2
            ON CONFLICT (user_id, club_id) DO NOTHING
            RETURNING *;
        `,
        [payment.user_id, payment.club_id, payment.id],
    );

    const updatedPayment = completedPayment.rows[0];
    if (!updatedPayment) {
        throw new Error("Failed to complete payment");
    }

    return {
        payment: updatedPayment,
        membership: membership.rows[0] ?? null,
    };
}

//lock event -> count registrations -> update payment -> insert registration
export async function completePaymentAndEnsureRegistration(
    client: PoolClient,
    payment: PaymentRecord,
    razorpayPaymentId: string,
) {
    if (!payment.event_id) {
        throw new Error("Payment missing event_id");
    }
    //lock the event row
    const eventResult = await client.query(
        `
            SELECT max_participants
            FROM events
            WHERE id = $1
            FOR UPDATE;
    `,
        [payment.event_id],
    );
    const countResult = await client.query(
        `
            SELECT COUNT(*)::int AS count
            FROM event_registrations
            WHERE event_id = $1;
    `,
        [payment.event_id],
    );

    const event = eventResult.rows[0];
    if (!event) {
        throw new Error("Event not found");
    }
    const count = countResult.rows[0].count;
    const maxParticipants = event.max_participants;
    if (count >= maxParticipants) {
        throw new Error("Event is full");
    }

    const completedPayment = await client.query<PaymentRecord>(
        `
            UPDATE payments
            SET
                status = 'completed',
                razorpay_payment_id = COALESCE(razorpay_payment_id, $2),
                paid_at = COALESCE(paid_at, NOW())
            WHERE id = $1
            RETURNING *;
        `,
        [payment.id, razorpayPaymentId],
    );

    const registration = await client.query(
        `
            INSERT INTO event_registrations(user_id,event_id,payment_id)
            VALUES ($1,$2,$3)
            RETURNING *;
        `,
        [payment.user_id, payment.event_id, payment.id],
    );

    const updatedPayment = completedPayment.rows[0];
    if (!updatedPayment) {
        throw new Error("Failed to complete payment");
    }

    return {
        payment: updatedPayment,
        registration: registration.rows[0] ?? null,
    };
}
