import pool from "../index.js";

//for the middleware
export async function getClubOfEvent(eventId: string) {
    const query = `
        SELECT c.id as club_id,c.college_id
        FROM clubs c
        JOIN events e on e.club_id = c.id
        WHERE e.id = $1;
    `;
    const result = await pool.query(query, [eventId]);
    return result.rows[0];
}

//see all event registrations (for admins and president only) -> one is used for cancel event emails , another used for viewing normal registrations
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
export async function getEventRegistrationsById(
    eventId: string,
    clubId: string,
) {
    const query = `
        SELECT u.name,u.email,er.registered_at
        FROM event_registrations er
        JOIN users u on u.id = er.user_id
        JOIN events e on e.id = er.event_id
        WHERE e.id = $1
            AND e.club_id = $2;
        ORDER BY er.registered_at DESC;
    `;
    const result = await pool.query(query, [eventId, clubId]);
    return result.rows;
}

export async function countEventRegistrations(eventId: string) {
    const query = `
        SELECT COUNT(*)::int AS count
        FROM events_registrations
        WHERE id = $1;
    `;
    const result = await pool.query(query, [eventId]);
    return Number(result.rows[0].count);
}

export async function isUserRegisteredForEvent(
    eventId: string,
    userId: string,
) {
    const query = `
        SELECT EXISTS (
            SELECT 1
            FROM event_registrations
            WHERE event_id = $1
                AND user_id = $2
        ) AS is_registered;
    `;

    const result = await pool.query(query, [eventId, userId]);
    return result.rows[0].is_registered;
}
