import pool from "../index.js";

type createClubRequestInput = {
    name: string;
    description: string;
    category: string;
    college_id: string;
    requested_by: string;
    logo_url?: string;
    membership_fee?: number;
};

export async function createClubRequest(request: createClubRequestInput) {
    const query = `
        INSERT INTO club_requests 
        (name, description, category,logo_url,membership_fee, college_id, requested_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, name, description, category, logo_url, membership_fee, college_id, requested_by, created_at;
    `;
    const values = [
        request.name,
        request.description,
        request.category,
        request.logo_url ?? null,
        request.membership_fee ?? 0,
        request.college_id,
        request.requested_by,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
}

export async function getClubRequests(collegeId: string) {
    const query = `
        SELECT
            cr.id,
            cr.name,
            cr.description,
            cr.category,
            cr.logo_url,
            cr.membership_fee,
            cr.college_id,
            cr.requested_by,
            cr.created_at,
            u.name AS requested_by_name,
            u.email AS requested_by_email
        FROM club_requests cr
        JOIN users u ON u.id = cr.requested_by
        WHERE cr.college_id = $1
        ORDER BY cr.created_at DESC;
     `;

    const result = await pool.query(query, [collegeId]);
    return result.rows;
}

export async function approveClubRequest(id: string) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Fetch the club request details
        const requestResult = await client.query(
            `SELECT * FROM club_requests 
            WHERE id = $1 
            FOR UPDATE`,
            [id],
        );
        const request = requestResult.rows[0];

        if (!request) {
            await client.query("ROLLBACK");
            return { type: "not_found" as const };
        }

        const existingClubResult = await client.query(
            `SELECT id FROM clubs 
            WHERE name = $1 AND college_id = $2`,
            [request.name, request.college_id],
        );

        if (existingClubResult.rows[0]) {
            await client.query("ROLLBACK");
            return {
                type: "club_exists" as const,
                club: existingClubResult.rows[0],
            };
        }

        // Insert the new club into the clubs table
        const clubResult = await client.query(
            `
                INSERT INTO 
                clubs(name,description,category,logo_url,membership_fee,college_id,created_by)
                VALUES($1,$2,$3,$4,$5,$6,$7)
                RETURNING id,name,description,category,logo_url,membership_fee,college_id,created_by,accepting_members,registration_type,membership_duration_days;
            `,
            [
                request.name,
                request.description,
                request.category,
                request.logo_url,
                request.membership_fee,
                request.college_id,
                request.requested_by,
            ],
        );

        await client.query(
            `
                DELETE FROM club_requests
                WHERE id=$1;
            `,
            [id],
        );

        const club = clubResult.rows[0];

        //if accepted insert the user and club into membership table
        await client.query(
            `
                INSERT INTO memberships(
                    user_id, 
                    club_id, 
                    joined_at,
                    ends_at,
                    status,
                    role
                )
                VALUES($1,$2,CURRENT_DATE,CURRENT_DATE + CAST($3 AS INTEGER),'active','president');
            `,
            [request.requested_by, club.id, club.membership_duration_days],
        );

        await client.query("COMMIT");

        return {
            type: "approved" as const,
            club,
        };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

export async function rejectClubRequest(id: string) {
    const query = `
        DELETE FROM club_requests
        WHERE id=$1
        RETURNING id
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0]
        ? { type: "rejected" as const }
        : { type: "not_found" as const };
}
