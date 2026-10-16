import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { JWT_SECRET } from "../config/jwt";

if ((!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === "") && process.env.NODE_ENV === "production") {
    throw new Error("[FATAL SECURITY]: JWT_SECRET wajib dikonfigurasi di file .env sebelum menjalankan di production!");
}

export interface AuthUser {
    userId: number;
    tenantId: number;
    roles: string[];
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Akses ditolak. Token tidak ditemukan" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token tidak valid atau sudah kedaluwarsa" });
    }
};
