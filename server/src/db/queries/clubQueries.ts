import pool from "../index.js";

type updateClubInput = {
    name?: string;
    description?: string;
    category?: string;
    logo_url?: string;
    membership_fee?: number;
    accepting_members?: boolean;
    registration_type?: string;
    membership_duration_days?: number;
};

export async function getClubById(id: string) {
    const query = `
        SELECT
            c.id,
            c.name,
            c.description,
            c.category,
            c.logo_url,
            c.college_id,
            c.membership_fee,
            c.registration_type,
            c.membership_duration_days,
            c.accepting_members,
            c.created_by,
            cl.name AS college_name,
            u.name AS created_by,
            COUNT(m.user_id) AS total_members
        FROM clubs c
        JOIN colleges cl
        ON cl.id = c.college_id
        JOIN users u
        ON u.id = c.created_by
        LEFT JOIN memberships m
        ON m.club_id = c.id
        WHERE c.id = $1
        GROUP BY
            c.id,
            cl.name,
            u.name;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] ?? null;
}

//to only check if the club already exists in college, used while creating
export async function findClubInCollege(college_id: string, club_name: string) {
    const query = `
        SELECT id FROM clubs
        WHERE college_id=$1 and name=$2;
    `;
    const result = await pool.query(query, [college_id, club_name]);
    return result.rows[0] ?? null;
}

export async function getAllClubs(college_id: string) {
    const query = `
        SELECT * from clubs
        WHERE college_id = $1
        ORDER BY name;
    `;

    const result = await pool.query(query, [college_id]);
    return result.rows;
}

export async function updateClub(
    id: string,
    college_id: string,
    club: updateClubInput,
) {
    const query = `
        UPDATE clubs
        SET 
            name = COALESCE($2,name),
            description = COALESCE($3,description),
            category = COALESCE($4,category),
            logo_url = COALESCE($5,logo_url),
            membership_fee = COALESCE($6,membership_fee),
            accepting_members = COALESCE($7,accepting_members),
            registration_type = COALESCE($8,registration_type),
            membership_duration_days = COALESCE($9,membership_duration_days)
        WHERE id = $1 AND college_id = $10
        RETURNING id,name,description,category,logo_url,
                membership_fee,college_id,created_by,accepting_members,
                registration_type,membership_duration_days;
    `;
    const result = await pool.query(query, [
        id,
        club.name,
        club.description,
        club.category,
        club.logo_url,
        club.membership_fee,
        club.accepting_members,
        club.registration_type,
        club.membership_duration_days,
        college_id,
    ]);
    return result.rows[0] ?? null;
}

export async function deleteClub(id: string, college_id: string) {
    const query = `
        DELETE from clubs
        WHERE id = $1 AND college_id = $2
        RETURNING id,name,description,category,logo_url,
                membership_fee,college_id,created_by,accepting_members,
                registration_type,membership_duration_days;
    `;
    const result = await pool.query(query, [id, college_id]);
    return result.rows[0] ?? null;
}

//search users inside the club route - to add members
export async function searchNonMembers(
    name: string,
    collegeId: string,
    clubId: string,
) {
    const query = `
        SELECT u.id,u.name,u.email,u.avatar_url
        FROM users u
        WHERE
            u.name ILIKE $1 || '%'
            AND u.college_id = $2
            AND NOT EXISTS (
                SELECT 1
                FROM memberships m
                WHERE m.user_id = u.id
                    AND m.club_id = $3
            ) 
        ORDER BY u.name
        LIMIT 10;
    `;

    const result = await pool.query(query, [name, collegeId, clubId]);
    return result.rows;
}

export async function getCollegeOfClub(id: string) {
    const query = `
        SELECT college_id
        FROM clubs
        WHERE id = $1;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
}
