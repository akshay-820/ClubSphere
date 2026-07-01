import pool from "../index.js";
import { CollegeRequestStatus } from "./collegeQueries.js";

type CreateCollegeRequestInput = {
    college_name: string;
    email_domain: string;
    logo_url: string;
};

//just inserts a new college request into the college_requests table
export async function createCollegeRequest(request: CreateCollegeRequestInput) {
    const query = `
        INSERT INTO college_requests (
            college_name, email_domain, logo_url
        )
        VALUES ($1, $2, $3)
        RETURNING
            id, college_name, email_domain, logo_url,
            status, created_at;
    `;

    const result = await pool.query(query, [
        request.college_name,
        request.email_domain,
        request.logo_url,
    ]);
    return result.rows[0];
}

// fetches all college requests with the specified status="pending"
export async function getCollegeRequests(status: CollegeRequestStatus) {
    const query = `
        SELECT
            cr.id,
            cr.college_name,
            cr.email_domain,
            cr.logo_url,
            cr.status,
            cr.created_at
        FROM college_requests cr
        WHERE cr.status = $1
        ORDER BY cr.created_at DESC;
    `;

    const result = await pool.query(query, [status]);
    return result.rows;
}

//atomic function (like a transaction) to approve a college request and insert it into the colleges table, then delete the request from the college_requests table
export async function approveCollegeRequest(id: string) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const requestResult = await client.query(
            `
                SELECT id, college_name, email_domain, logo_url, status
                FROM college_requests
                WHERE id = $1
                FOR UPDATE;
            `,
            [id],
        );

        const request = requestResult.rows[0];

        if (!request) {
            await client.query("ROLLBACK");
            return { type: "not_found" as const };
        }

        const existingCollegeResult = await client.query(
            `
                SELECT id, name, email_domain, logo_url
                FROM colleges
                WHERE email_domain = $1;
            `,
            [request.email_domain],
        );

        if (existingCollegeResult.rows[0]) {
            await client.query("ROLLBACK");
            return {
                type: "college_exists" as const,
                college: existingCollegeResult.rows[0],
            };
        }

        const collegeResult = await client.query(
            `
                INSERT INTO colleges (name, email_domain, logo_url)
                VALUES ($1, $2, $3)
                RETURNING id, name, email_domain, logo_url;
            `,
            [request.college_name, request.email_domain, request.logo_url],
        );

        await client.query(
            `
                DELETE FROM college_requests
                WHERE id = $1;
            `,
            [id],
        );

        await client.query("COMMIT");

        return {
            type: "approved" as const,
            college: collegeResult.rows[0],
        };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

// function to reject a college request by deleting it from the college_requests table
export async function rejectCollegeRequest(id: string) {
    const query = `
        DELETE FROM college_requests
        WHERE id = $1 AND status = 'pending'
        RETURNING id;
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0]
        ? { type: "rejected" as const }
        : { type: "not_found" as const };
}
