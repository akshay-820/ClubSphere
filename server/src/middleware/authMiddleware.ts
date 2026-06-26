import express from "express";
import jwt from "jsonwebtoken";

type JwtPayload = {
    userId: string;
    role: string;
};

export type AuthRequest = express.Request & { user?: JwtPayload };

const isLoggedIn = (
    req: AuthRequest,
    res: express.Response,
    next: express.NextFunction,
) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string,
        ) as JwtPayload;
        req.user = { userId: decoded.userId, role: decoded.role };
        next();
    } catch (error) {
        return res.status(401).json({ error: "Unauthorized" });
    }
};

export { isLoggedIn };
