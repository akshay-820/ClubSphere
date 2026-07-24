import { Pool, PoolClient } from "pg";
import pool from "../index.js";
export type clubRole = "member" | "admin" | "president" | null;
//to find the role of the user in a particular club for the middleware
export async function getUserRoleInClub(userId: string, clubId: string) {
    const query = `
        SELECT role
        FROM memberships
        WHERE user_id = $1 AND club_id = $2
    `;
    const values = [userId, clubId];

    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
        return null; // User is not a member of the club
    }

    return result.rows[0].role;
}

export async function isMember(userId: string, clubId: string) {
    const query = `
        SELECT 1
        FROM memberships
        WHERE user_id = $1
            AND club_id = $2
    `;
    const result = await pool.query(query, [userId, clubId]);
    return result.rowCount! > 0;
}

export async function addMembership(
    userId: string,
    clubId: string,
    paymentId?: string,
) {
    try {
        const query = `
        INSERT INTO memberships(user_id,club_id,joined_at,ends_at,payment_id)
        SELECT
            $1,
            c.id,
            CURRENT_DATE,
            CURRENT_DATE + c.membership_duration_days,
            $3
        FROM clubs c
        WHERE c.id = $2
        RETURNING *
    `;
        const result = await pool.query(query, [
            userId,
            clubId,
            paymentId ?? null,
        ]);
        return result.rows[0];
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export async function removeMembership(userId: string, clubId: string) {
    const query = `
        DELETE FROM memberships
        WHERE user_id = $1
            AND club_id = $2
        RETURNING id,user_id,club_id,payment_id;
    `;
    const result = await pool.query(query, [userId, clubId]);
    return result.rows[0];
}

//to show all members in a club
export async function getMemberships(clubId: string) {
    const query = `
        SELECT u.id,u.name,u.email,u.avatar_url, m.role
        FROM memberships m
        JOIN users u on u.id = m.user_id
        WHERE m.club_id = $1
    `;
    const result = await pool.query(query, [clubId]);
    return result.rows;
}

//to change user's role in the club
export async function changeUserClubRole(
    userId: string,
    clubId: string,
    role: string,
) {
    const query = `
        UPDATE memberships 
        SET role = $3
        WHERE user_id = $1
            AND club_id = $2
        RETURNING id,user_id,club_id,role;
    `;
    const result = await pool.query(query, [userId, clubId, role]);
    return result.rows[0];
}

export async function transferPresident(
    client: PoolClient,
    userId: string,
    clubId: string,
    currentUserId: string,
) {
    const query = `
        UPDATE memberships
        SET role = 'president'
        WHERE user_id = $1
            AND club_id = $2
        RETURNING id,user_id,role,club_id;
    `;
    const result = await client.query(query, [userId, clubId]);

    await client.query(
        `
            UPDATE memberships
            SET role = 'admin'
            WHERE user_id = $1
            AND club_id = $2;
        `,
        [currentUserId, clubId],
    );
    return result.rows[0];
}

//this function is for college admins to appoint president - since partial unique
export async function makePresident(userId: string, clubId: string) {
    const query = `
        UPDATE memberships
        SET role = 'president'
        WHERE user_id = $1
            AND club_id = $2
        RETURNING id,user_id,club_id,role;
    `;
    const result = await pool.query(query, [userId, clubId]);
    return result.rows[0];
}

export async function deletePresident(userId: string, clubId: string) {
    const query = `
UPDATE memberships
SET role = 'admin'
WHERE user_id = $1
AND club_id = $2
RETURNING id,user_id,club_id,role;
`;
    const result = await pool.query(query, [userId, clubId]);
    return result.rows[0];
}
