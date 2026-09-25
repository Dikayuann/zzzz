import prisma from "../lib/prisma";
import {CreateRoleInput} from "../schemas/role.schema";
import {logAudit} from "../lib/audit";

export const getRoles = async(tenantId: number) => {
    return await prisma.role.findMany({
        where: {
            OR: [
                { tenantId: null },
                // Role default sistem (Org Admin, Manager, dll)
                { tenantId: tenantId }
                //role kustom
            ],
        },
        select: {
            id: true,
            name: true,
            isCustom: true,
            tenantId: true,
            rolePermissions: {
                select: {
                    permission: {
                        select: {
                            id: true,
                            module: true,
                            action: true
                        },
                    },
                },
            },
        },
        orderBy: { id: "asc"}
    });
};

// Ambil seluruh daftar permission (untuk form checklist di frontend)
export const getPermissions = async () => {
    return prisma.permission.findMany({
        select: {
            id: true,
            module: true,
            action: true
        },
        orderBy: [
            { module: "asc" },
            { action: "asc" }
        ],
    });
};

export const createCustomRole = async ( tenantId: number, actorUserId: number, data: CreateRoleInput) => {

    //Cek apakah nama role sudah dipakai di tenant ini atau bentrok dengan role bawaan
    const existingRole = await prisma.role.findFirst({
        where: {
            name: data.name,
            OR: [
                { tenantId }, { tenantId: null }
            ],
        },
    });

    if (existingRole) {
        throw new Error("ROLE_NAME_DUPLICATE");
    }

    //Validasi apakah semua permissionIds yang dikirim benar-benar ada di tabel permissions
    const validPermissions = await prisma.permission.findMany({
        where: {
            id: { in: data.permissionIds }
        }
    });
    if (validPermissions.length !== data.permissionIds.length) {
        throw new Error("INVALID_PERMISSION_IDS");
    }
    //buat Role dan hubungkan ke Permission secara atomik
    const newRole = await prisma.$transaction(async (tx) => {
        // membuat record role
        const role = await tx.role.create({
            data: {
                name: data.name,
                tenantId: tenantId,
                isCustom: true
            },
        });

        const rolePermissionsData = data.permissionIds.map((permissionId) => ({
            roleId: role.id,
            permissionId: permissionId
        }));
        await tx.rolePermission.createMany({
            data:
                rolePermissionsData,
            });
        return role;
    });
    // mencatat audit log
    await logAudit({
        tenantId,
        actorId: actorUserId,
        action: "CREATE_CUSTOM_ROLE",
        entityType: "Role",
        entityId: newRole.id,
        details: {
            name: newRole.name,
            permissionCount: data.permissionIds.length,
            permissions: validPermissions.map((p) => `${p.module}:${p.action}`),
        },
    });

    // return role yang baru dibuat beserta permissionsnya
    return prisma.role.findUnique({
        where: { id: newRole.id },
        include: {
            rolePermissions: {
                include: {
                    permission: true
                },
            },
        },
    });
};