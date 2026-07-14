import pool from "../index.js";

type postType = "announcement" | "recruitement" | "general";

type postContent = {
    clubId: string;
    type: postType;
    title: string;
    content: string;
    mediaUrls: string[];
};

type postUpdateType = {
    type?: postType;
    title?: string;
    content?: string;
};

export async function getPostByClub(clubId: string) {
    const query = `
        SELECT id,type,title,content,created_at,media_urls
        FROM posts p
        WHERE club_id = $1
        ORDER BY p.created_at DESC;
    `;
    const result = await pool.query(query, [clubId]);
    return result.rows;
}

export async function getPostByCollege(collegeId: string) {
    const query = `
        SELECT c.name AS club_name,p.id,p.club_id,p.type,p.title,p.content,p.created_at,p.media_urls
        FROM posts p
        JOIN clubs c on c.id = p.club_id
        WHERE c.college_id = $1
        ORDER BY p.created_at DESC;
    `;
    const result = await pool.query(query, [collegeId]);
    return result.rows;
}

export async function createPost(request: postContent) {
    const query = `
        INSERT INTO posts(club_id,type,title,content,media_urls)
        VALUES ($1,$2,$3,$4,$5)
        RETURNING id,club_id,type,title,content,created_at,media_urls;
    `;
    const values = [
        request.clubId,
        request.type,
        request.title,
        request.content,
        request.mediaUrls,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
}

export async function getPostById(postId: string) {
    const query = `
        SELECT c.name AS club_name,p.id,p.club_id,p.type,p.title,p.content,p.created_at,p.media_urls
        FROM posts p
        JOIN clubs c on c.id = p.club_id
        WHERE p.id = $1;
    `;
    const result = await pool.query(query, [postId]);
    return result.rows[0];
}

export async function deletePostById(postId: string) {
    const query = `
        DELETE FROM posts
        WHERE id = $1;
        RETURNING id,club_id,type,title,content,created_at,media_urls
    `;
    const result = await pool.query(query, [postId]);
    return result.rows[0];
}

export async function updatePostById(request: postUpdateType, postId: string) {
    const query = `
        UPDATE posts
        SET 
            type = COALESCE($2,type),
            title = COALESCE($3,title),
            content = COALESCE($4,content)
        WHERE id = $1
        RETURNING id,club_id,type,title,content,created_at,media_urls;
    `;
    const values = [postId, request.type, request.title, request.content];
    const result = await pool.query(query, values);
    return result.rows[0];
}
