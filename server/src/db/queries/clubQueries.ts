import pool from "../index.js";

//to only check if the club already exists in college
export async function findClubInCollege(college_id: string, club_name: string) {
    const query = `
        SELECT * FROM clubs
        WHERE college_id=$1 and name=$2;
    `;
    const result = await pool.query(query, [college_id, club_name]);
    return result.rows[0] ?? null;
}
