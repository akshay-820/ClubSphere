import pool from "../index.js";

//for the middleware
export async function getClubOfEvent(eventId: string) {
    const query = `
        SELECT club_id
        FROM events 
        WHERE id = $1;
    `;
    const result = await pool.query(query, [eventId]);
    return result.rows[0];
}

export async function getAllRegistrations(eventId: string) {
    const query = `
        SELECT u.name,u.email,u.avatar_url,er.registered_at
        FROM event_registrations er
        JOIN users u on er.user_id = u.id
        WHERE er.event_id = $1
        ORDER BY er.registered_at DESC;
    `;
    const result = await pool.query(query, [eventId]);
    return result.rows;
}
