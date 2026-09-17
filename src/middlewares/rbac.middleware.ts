import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";

/**
 * Middleware factory untuk memvalidasi hak akses (RBAC) berdasarkan modul & aksi.
 * Contoh penggunaan: router.post('/', authenticateJWT, requirePermission('contacts', 'create'), handler);
 */
export const requirePermission = (module: string, action: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: "Akses ditolak. Silakan login terlebih dahulu." });
        }

        try {
            // Ambil semua role user beserta permissions yang dimilikinya
            const userRoles = await prisma.userRole.findMany({
                where: { userId },
                include: {
                    role: {
                        include: {
                            rolePermissions: {
                                include: {
                                    permission: true,
                                },
                            },
                        },
                    },
                },
            });

            if (!userRoles || userRoles.length === 0) {
                return res.status(403).json({ message: "Akses ditolak. Anda tidak memiliki role aktif." });
            }

            // Cek 1: Apakah user memiliki role 'Org Admin' (Bypass semua izin)
            const isOrgAdmin = userRoles.some((ur) => ur.role.name === "Org Admin");
            if (isOrgAdmin) {
                return next();
            }

            // Cek 2: Apakah salah satu role user memiliki permission (module & action) yang diminta
            const hasPermission = userRoles.some((ur) =>
                ur.role.rolePermissions.some(
                    (rp) => rp.permission.module === module && rp.permission.action === action
                )
            );

            if (!hasPermission) {
                return res.status(403).json({
                    message: `Akses ditolak. Anda tidak memiliki izin [${module}:${action}] untuk melakukan aksi ini.`,
                });
            }

            next();
        } catch (error) {
            console.error("[RBAC Error]:", error);
            return res.status(500).json({ message: "Terjadi kesalahan internal saat memeriksa hak akses." });
        }
    };
};
