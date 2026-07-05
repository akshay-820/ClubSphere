import pool from "../index.js";

//to find the role of the user in a particular club for the middleware
export type clubRole = "member" | "admin" | "president" | null;

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
