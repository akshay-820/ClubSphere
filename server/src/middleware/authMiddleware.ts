import express from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "../db/queries/userQueries.js";
import { clubRole } from "../db/queries/membershipQueries.js";
import { getUserRoleInClub } from "../db/queries/membershipQueries.js";

type JwtPayload = {
    userId: string;
    role: UserRole;
    collegeId: string;
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
        req.user = {
            userId: decoded.userId,
            role: decoded.role,
            collegeId: decoded.collegeId,
        };
        next();
    } catch (error) {
        return res.status(401).json({ error: "Unauthorized" });
    }
};

const roleGuard = (...allowedRoles: UserRole[]) => {
    return (
        req: AuthRequest,
        res: express.Response,
        next: express.NextFunction,
    ) => {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: "Forbidden" });
        }

        next();
    };
};

const clubRoleGuard = (...allowedRoles: clubRole[]) => {
    return async (
        req: AuthRequest,
        res: express.Response,
        next: express.NextFunction,
    ) => {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const userId = req.user?.userId;
        const clubId = req.params.id;

        if (!clubId || typeof clubId !== "string") {
            return res.status(400).json({ error: "Invalid club id" });
        }

        const userRole = await getUserRoleInClub(userId, clubId);
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ error: "Forbidden" });
        }

        next();
    };
};

export { isLoggedIn, roleGuard, clubRoleGuard };
