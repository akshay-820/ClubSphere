import pool from "../index.js";

// see all events , see event details , see club events, create event , edit event, delete event(if there are zero registrations)
type eventStatus = "scheduled" | "cancelled" | "completed";
type eventContent = {
    title: string;
    description: string;
    event_type: string;
    banner_url: string;
    start_time: string;
    end_time: string;
    location: string;
    max_participants: number;
    registration_fee: number;
    club_id: string;
};

type editEventContent = {
    title?: string;
    description?: string;
    event_type?: string;
    banner_url?: string;
    start_time?: string;
    end_time?: string;
    location?: string;
    max_participants?: number;
    registration_fee?: number;
};

export async function getEventsByCollege(collegeId: string) {
    const query = `
        SELECT e.id,e.title,e.description,e.event_type,
            e.banner_url,e.start_time,e.end_time,e.location,
            e.max_participants,e.registration_fee,e.created_at,
            e.club_id,c.name as club_name,e.status
        FROM events e
        JOIN clubs c on c.id = e.club_id
        WHERE c.college_id = $1
            AND e.status = 'scheduled'
        ORDER BY e.created_at DESC;
    `;
    const result = await pool.query(query, [collegeId]);
    return result.rows;
}

export async function getEventById(eventId: string, college_id: string) {
    const query = `
        SELECT e.id,e.title,e.description,e.event_type,
            e.banner_url,e.start_time,e.end_time,e.location,
            e.max_participants,e.registration_fee,e.created_at,
            e.club_id,c.name as club_name,e.status
        FROM events e
        JOIN clubs c on c.id = e.club_id
        WHERE c.college_id = $1
            AND e.id = $2;
    `;
    const result = await pool.query(query, [college_id, eventId]);
    return result.rows[0];
}

export async function getEventsByClub(clubId: string, college_id: string) {
    const query = `
        SELECT e.id,e.title,e.description,e.event_type,
            e.banner_url,e.start_time,e.end_time,e.location,
            e.max_participants,e.registration_fee,e.created_at,e.status
        FROM events e
        JOIN clubs c on e.club_id = c.id
        WHERE e.club_id = $1
            AND c.college_id = $2
        ORDER BY e.created_at DESC;
    `;
    const result = await pool.query(query, [clubId, college_id]);
    return result.rows;
}

export async function createEventByClub(request: eventContent) {
    const query = `
        INSERT INTO events(title,description,event_type,banner_url,start_time,end_time,
            location,max_participants,registration_fee,club_id)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        RETURNING id,title,description,event_type,banner_url,start_time,end_time,
            location,max_participants,registration_fee,club_id,created_at,open_to_all_colleges,status;
    `;
    const values = [
        request.title,
        request.description,
        request.event_type,
        request.banner_url,
        request.start_time,
        request.end_time,
        request.location,
        request.max_participants,
        request.registration_fee,
        request.club_id,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
}

export async function editEventById(
    eventId: string,
    clubId: string,
    request: editEventContent,
) {
    const query = `
        UPDATE events
        SET
            title = COALESCE($3,title),
            description = COALESCE($4,description),
            event_type = COALESCE($5,event_type),
            banner_url = COALESCE($6,banner_url),
            start_time = COALESCE($7,start_time),
            end_time = COALESCE($8,end_time),
            location = COALESCE($9,location),
            max_participants = COALESCE($10,max_participants),
            registration_fee = COALESCE($11,registration_fee)
        WHERE id = $1
            AND club_id = $2
        RETURNING id,title,description,event_type,banner_url,start_time,end_time,location,max_participants,registration_fee,club_id,created_at,status;
    `;
    const values = [
        eventId,
        clubId,
        request.title,
        request.description,
        request.event_type,
        request.banner_url,
        request.start_time,
        request.end_time,
        request.location,
        request.max_participants,
        request.registration_fee,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
}

export async function editEventStatus(
    eventId: string,
    clubId: string,
    status: eventStatus,
) {
    const query = `
        UPDATE events e
        SET status = $3
        FROM clubs c
        WHERE e.id = $1
            AND e.club_id = $2
            AND c.id = e.club_id
        RETURNING e.id,e.title,e.description,e.event_type,e.banner_url,e.status,c.name as club_name;
    `;
    const result = await pool.query(query, [eventId, clubId, status]);
    return result.rows[0];
}

export async function markCompletedEvents() {
    const query = `
        UPDATE events
        SET status = 'completed'
        WHERE status = 'scheduled'
            AND end_time <= NOW();
    `;
    await pool.query(query);
}
