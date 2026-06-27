import pool from "../index.js";

type UpsertPendingRegistrationInput = {
    name: string;
    email: string;
    year?: number | null;
    branch?: string | null;
    password_hash: string;
    avatar_url?: string | null;
    college_id?: string | null;
    otp_hash: string;
    otp_expires_at: Date;
};

export async function upsertPendingRegistration(
    registration: UpsertPendingRegistrationInput,
) {
    const query = `
        INSERT INTO pending_registrations (
            name, email, year, branch, password_hash, avatar_url,
            college_id, otp_hash, otp_expires_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (email) DO UPDATE SET
            name = EXCLUDED.name,
            year = EXCLUDED.year,
            branch = EXCLUDED.branch,
            password_hash = EXCLUDED.password_hash,
            avatar_url = EXCLUDED.avatar_url,
            college_id = EXCLUDED.college_id,
            otp_hash = EXCLUDED.otp_hash,
            otp_expires_at = EXCLUDED.otp_expires_at,
            otp_attempts = 0,
            updated_at = now()
        RETURNING *;
    `;

    const values = [
        registration.name,
        registration.email,
        registration.year ?? null,
        registration.branch ?? null,
        registration.password_hash,
        registration.avatar_url ?? null,
        registration.college_id ?? null,
        registration.otp_hash,
        registration.otp_expires_at,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
}

export async function getPendingRegistrationByEmail(email: string) {
    const query = `
        SELECT *
        FROM pending_registrations
        WHERE email = $1;
    `;

    const result = await pool.query(query, [email]);
    return result.rows[0] ?? null;
}

export async function incrementPendingRegistrationOtpAttempts(id: string) {
    const query = `
        UPDATE pending_registrations
        SET otp_attempts = otp_attempts + 1,
            updated_at = now()
        WHERE id = $1;
    `;

    await pool.query(query, [id]);
}

export async function deletePendingRegistration(id: string) {
    await pool.query("DELETE FROM pending_registrations WHERE id = $1;", [id]);
}
