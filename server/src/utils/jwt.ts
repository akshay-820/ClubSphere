import jwt, { SignOptions } from "jsonwebtoken";

type TokenPayload = {
    userId: string;
    role: string;
};

export function generateToken(payload: TokenPayload) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }
    return jwt.sign(payload, secret, {
        expiresIn: (process.env.JWT_EXPIRES_IN ||
            "1d") as SignOptions["expiresIn"],
    });
}
