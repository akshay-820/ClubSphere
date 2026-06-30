import pool from "../index.js";

export type CollegeRequestStatus = "pending" | "approved" | "rejected";

type UpdateCollegeInput = {
    name?: string;
    email_domain?: string;
    logo_url?: string;
};

export async function getAllColleges() {
    const query = `
        SELECT id, name, email_domain, logo_url
        FROM colleges
        ORDER BY name ASC;
    `;

    const result = await pool.query(query);
    return result.rows;
}

export async function getCollegeByEmailDomain(emailDomain: string) {
    const query = `
        SELECT id, name, email_domain, logo_url
        FROM colleges
        WHERE email_domain = $1;
    `;

    const result = await pool.query(query, [emailDomain]);
    return result.rows[0] ?? null;
}

export async function getCollegeById(id: string) {
    const query = `
        SELECT id, name, email_domain, logo_url
        FROM colleges
        WHERE id = $1;
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] ?? null;
}

export async function updateCollege(id: string, college: UpdateCollegeInput) {
    const query = `
        UPDATE colleges
        SET
            name = COALESCE($2, name),
            email_domain = COALESCE($3, email_domain),
            logo_url = COALESCE($4, logo_url)
        WHERE id = $1
        RETURNING id, name, email_domain, logo_url;
    `;

    const result = await pool.query(query, [
        id,
        college.name,
        college.email_domain,
        college.logo_url,
    ]);
    return result.rows[0] ?? null;
}

export async function deleteCollege(id: string) {
    const query = `
        DELETE FROM colleges
        WHERE id = $1
        RETURNING id, name, email_domain, logo_url;
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] ?? null;
}
