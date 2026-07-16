import pool from "../index.js";

//see all event registrations (for admins and president only)
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
    `;
    const result = await pool.query(query, [eventId, clubId]);
    return result.rows;
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
