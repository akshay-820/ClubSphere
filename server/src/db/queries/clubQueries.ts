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
