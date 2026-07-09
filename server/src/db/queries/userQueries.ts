import pool from "../index.js";

export type UserRole = "student" | "college_admin" | "super_admin";

type CreateUserInput = {
    name: string;
    email: string;
    year?: number | null;
    branch?: string | null;
    password_hash: string;
    avatar_url?: string | null;
    college_id?: string | null;
    email_verified?: boolean;
};

export async function createUser(user: CreateUserInput) {
    const {
        name,
        email,
        year,
        branch,
        password_hash,
        avatar_url,
        college_id,
        email_verified,
    } = user;
    const query = `
        INSERT INTO users (
            name, email, year, branch, password_hash,
            avatar_url, college_id, email_verified
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
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
        email_verified ?? false,
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
        SELECT
            u.id, u.name, u.email, u.year, u.branch,
            u.college_id, u.avatar_url, u.role, u.email_verified,
            c.name AS college_name
        FROM users u
        LEFT JOIN colleges c ON c.id = u.college_id
        WHERE u.id = $1;
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

export async function updateUserProfile(
    id: string,
    profile: {
        name?: string;
        year?: number | null;
        branch?: string | null;
        avatar_url?: string | null;
    },
) {
    const query = `
        UPDATE users
        SET
            name = COALESCE($2, name),
            year = COALESCE($3, year),
            branch = COALESCE($4, branch),
            avatar_url = COALESCE($5, avatar_url)
        WHERE id = $1
        RETURNING id,name,email,year,branch,college_id,avatar_url,role,email_verified;
    `;

    try {
        const result = await pool.query(query, [
            id,
            profile.name,
            profile.year,
            profile.branch,
            profile.avatar_url,
        ]);
        return result.rows[0] ?? null;
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
}

export async function searchUserByName(collegeId: string, name: string) {
    const query = `
        SELECT id,name,email,avatar_url
        FROM users
        WHERE college_id = $1 
            AND name ILIKE $2 || '%'
        ORDER BY name
        LIMIT 10;
    `;

    try {
        const result = await pool.query(query, [collegeId, name.trim()]);
        return result.rows;
    } catch (err) {
        console.error("Error finding users by name:", err);
        throw err;
    }
}
