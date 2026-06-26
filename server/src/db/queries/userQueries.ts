import pool from "../index.js";

type CreateUserInput = {
    name: string;
    email: string;
    year?: number | null;
    branch?: string | null;
    password_hash: string;
    avatar_url?: string | null;
    college_id?: string | null;
};

export async function createUser(user: CreateUserInput) {
    const { name, email, year, branch, password_hash, avatar_url, college_id } =
        user;
    const query = `
        INSERT INTO users (name, email, year, branch, password_hash, avatar_url, college_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, name, email, year, branch, college_id, avatar_url, role, email_verified;
    `;
    const values = [
        name,
        email,
        year ?? null,
        branch ?? null,
        password_hash,
        avatar_url ?? null,
        college_id ?? null,
    ];

    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
}

export async function getUserById(id: string) {
    const query = `
        SELECT id,name,email,year,branch,college_id,avatar_url,role,email_verified FROM users WHERE id = $1;
    `;
    try {
        const result = await pool.query(query, [id]);
        return result.rows[0] ?? null;
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        throw error;
    }
}

export async function getUserByEmail(email: string) {
    const query = `
        SELECT * FROM users WHERE email = $1;
    `;
    try {
        const result = await pool.query(query, [email]);
        return result.rows[0] ?? null;
    } catch (error) {
        console.error("Error fetching user by email:", error);
        throw error;
    }
}
