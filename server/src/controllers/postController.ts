import express from "express";
import { AuthRequest } from "../middleware/authMiddleware.js";
import { getRouteParam } from "../utils/validation.js";
import {
    createPost,
    deletePostById,
    getPostByClub,
    getPostByCollege,
    getPostById,
    updatePostById,
} from "../db/queries/postQueries.js";
import { uploadImage } from "../utils/uploadImage.js";

const getClubPosts = async (req: AuthRequest, res: express.Response) => {
    try {
        const clubId = getRouteParam(req.params.id);
        const posts = await getPostByClub(clubId);
        return res.status(200).json({
            posts,
        });
    } catch (err) {
        console.error("Error while finding posts by club", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const getAllPosts = async (req: AuthRequest, res: express.Response) => {
    try {
        const collegeId = req.user?.collegeId;
        if (!collegeId) {
            return res
                .status(403)
                .json({ error: "Join a college to view posts" });
        }
        const posts = await getPostByCollege(collegeId);
        return res.status(200).json({ posts });
    } catch (err) {
        console.error("Error while fetching posts", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const getPostDetails = async (req: AuthRequest, res: express.Response) => {
    try {
        const postId = getRouteParam(req.params.id);
        const post = await getPostById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        return res.status(200).json({ post });
    } catch (err) {
        console.error("Error getting the post details", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const createNewPost = async (req: AuthRequest, res: express.Response) => {
    try {
        const clubId = getRouteParam(req.params.id);

        const { type, title, content } = req.body;
        if (!type || !title || !content) {
            return res.status(400).json({
                error: "Missing fields required",
            });
        }

        if (
            type !== "announcement" &&
            type !== "recruitment" &&
            type !== "general"
        ) {
            return res.status(400).json({
                error: "Invalid post type",
            });
        }

        let mediaUrls: string[] = [];

        if (req.files) {
            const files = req.files as Express.Multer.File[];

            mediaUrls = await Promise.all(
                files.map(async (file) => {
                    const result = await uploadImage(
                        file.buffer,
                        "clubsphere/posts",
                    );
                    return result.secure_url;
                }),
            );
        }

        const post = await createPost({
            clubId,
            type,
            title,
            content,
            mediaUrls,
        });

        return res.status(201).json({
            message: "Post created successfully",
            post,
        });
    } catch (err) {
        console.error("Error while creating post", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const updatePost = async (req: AuthRequest, res: express.Response) => {
    try {
        const postId = getRouteParam(req.params.id);

        const { type, title, content } = req.body;

        if (
            type === undefined &&
            title === undefined &&
            content === undefined
        ) {
            return res.status(400).json({
                error: "At least one field is required to update",
            });
        }

        if (
            type !== undefined &&
            type !== "announcement" &&
            type !== "general" &&
            type !== "recruitment"
        ) {
            return res.status(400).json({
                error: "Invalid post type",
            });
        }

        const post = await updatePostById({ type, title, content }, postId);
        if (!post) {
            return res.status(404).json({
                error: "Post not found",
            });
        }

        return res.status(200).json({
            message: "Successfully updated the post",
            post,
        });
    } catch (err) {
        console.error("Error while updating post", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const deletePost = async (req: AuthRequest, res: express.Response) => {
    try {
        const postId = getRouteParam(req.params.id);

        const post = await deletePostById(postId);
        if (!post) {
            return res.status(404).json({
                error: "Post not found",
            });
        }

        return res.status(200).json({
            message: "Post deleted successfully",
            post,
        });
    } catch (err) {
        console.error("Error while deleting the post", err);
        return res.status(500).json({
            error: "Internal server error",
        });
    }
};

export {
    getClubPosts,
    getAllPosts,
    getPostDetails,
    createNewPost,
    updatePost,
    deletePost,
};
