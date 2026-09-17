import { Router } from "express";
import prisma from "../lib/prisma";
import { authenticateJWT } from "../middlewares/auth.middleware";

const router = Router();

// GET /api/v1/roles
router.get("/", authenticateJWT, async (req, res) => {
    const tenantId = req.user?.tenantId;
    try {
        const roles = await prisma.role.findMany({
            where: {
                OR: [{ tenantId: null }, { tenantId }],
            },
            select: { id: true, name: true, isCustom: true },
        });
        return res.status(200).json({ message: "Berhasil mengambil roles", data: roles });
    } catch (error) {
        return res.status(500).json({ message: "Terjadi kesalahan internal" });
    }
});

export default router;
