import { PoolClient } from "pg";
import { PaymentRecord } from "./paymentQueries.js";
import pool from "../index.js";

export async function createEventRegistrationRequest(
    client: PoolClient,
    userId: string,
    eventId: string,
    paymentId: string,
) {
    const query = `
        INSERT INTO pending_event_registrations(user_id,event_id,expires_at,payment_id)
        VALUES (
            $1,
            $2,
            NOW() + INTERVAL '5 minutes',
            $3
        )
        RETURNING id,user_id,event_id,created_at,expires_at,payment_id;
    `;
    const result = await client.query(query, [userId, eventId, paymentId]);
    return result.rows[0];
}

export async function lockEventAndGetCapacity(
    client: PoolClient,
    eventId: string,
) {
    return client.query(
        `
            SELECT e.max_participants,
                (
                    SELECT COUNT(*)
                    FROM event_registrations er
                    WHERE er.event_id = e.id
                ) AS registered_count,
                (
                    SELECT COUNT(*)
                    FROM pending_event_registrations per
                    WHERE per.event_id = e.id
                        AND per.expires_at > NOW()
                ) AS pending_count
            FROM events e
            WHERE e.id = $1
            FOR UPDATE;
        `,
        [eventId],
    );
}

export async function completePaymentAndEnsureRegistration(
    client: PoolClient,
    payment: PaymentRecord,
    razorpayPaymentId: string,
) {
    if (!payment.event_id) {
        throw new Error("Payment missing event_id");
    }

    const pendingRegistration = await client.query(
        `
            SELECT *
            FROM pending_event_registrations
            WHERE payment_id = $1;
        `,
        [payment.id],
    );
    const pendingReg = pendingRegistration.rows[0];
    if (!pendingReg || new Date(pendingReg.expires_at) <= new Date()) {
        throw new Error("Payment expired,try again");
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
            ON CONFLICT (user_id, event_id) DO NOTHING
            RETURNING *;
        `,
        [payment.user_id, payment.event_id, payment.id],
    );

    await client.query(
        `
            DELETE FROM pending_event_registrations
            WHERE payment_id = $1;
        `,
        [payment.id],
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

export async function deletePendingEventRegistrations() {
    const query = `
        DELETE FROM pending_event_registrations
        WHERE expires_at <= NOW()
        RETURNING *;
    `;
    const result = await pool.query(query);
    return result.rows;
}

export async function getPendingEventRegistrationById(
    client: PoolClient,
    userId: string,
    eventId: string,
) {
    const query = `
        SELECT *
        FROM pending_event_registrations
        WHERE user_id = $1
          AND event_id = $2;
    `;

    const result = await client.query(query, [userId, eventId]);
    return result.rows[0];
}
