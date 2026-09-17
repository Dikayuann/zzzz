import "dotenv/config";
import prisma from "../src/lib/prisma";

// 1. Matriks Seluruh Permission Modul & Aksi (Berdasarkan FSD Section 5)
const PERMISSIONS_DATA = [
    // Modul Users & Roles
    { module: "users", action: "view" },
    { module: "users", action: "create" },
    { module: "users", action: "edit" },
    { module: "users", action: "delete" },

    // Modul Channel Config (SMTP & Settings)
    { module: "channels", action: "view" },
    { module: "channels", action: "edit" },
    { module: "channels", action: "delete" },

    // Modul Telegram Bot
    { module: "telegram", action: "view" },
    { module: "telegram", action: "edit" },
    { module: "telegram", action: "delete" },

    // Modul Kontak
    { module: "contacts", action: "view" },
    { module: "contacts", action: "create" },
    { module: "contacts", action: "edit" },
    { module: "contacts", action: "delete" },

    // Modul Templates
    { module: "templates", action: "view" },
    { module: "templates", action: "create" },
    { module: "templates", action: "edit" },
    { module: "templates", action: "delete" },

    // Modul Scheduler
    { module: "scheduler", action: "view" },
    { module: "scheduler", action: "create" },
    { module: "scheduler", action: "edit" },
    { module: "scheduler", action: "delete" },

    // Modul Broadcast / Send
    { module: "broadcast", action: "view" },
    { module: "broadcast", action: "send" },

    // Modul Analytics / Reports
    { module: "analytics", action: "view" },
];

async function main() {
    console.log("🌱 Mulai proses seeding RBAC permissions & roles...");

    // 1. Insert / Upsert semua permissions
    const createdPermissions: Record<string, number> = {};

    for (const p of PERMISSIONS_DATA) {
        const perm = await prisma.permission.upsert({
            where: {
                module_action: { module: p.module, action: p.action },
            },
            update: {},
            create: { module: p.module, action: p.action },
        });
        createdPermissions[`${p.module}:${p.action}`] = perm.id;
    }

    console.log(`✅ Berhasil mendaftarkan ${Object.keys(createdPermissions).length} permissions.`);

    // Helper untuk mapping permission ke role
    const getPermIds = (keys: string[]) => keys.map((k) => createdPermissions[k]).filter(Boolean);

    // 2. Definisi 4 Predefined Roles beserta permission-nya
    const ROLES_DEFINITIONS = [
        {
            name: "Org Admin",
            permissions: Object.keys(createdPermissions), // Full access
        },
        {
            name: "Campaign Manager",
            permissions: [
                "telegram:view", "telegram:edit", "telegram:delete",
                "contacts:view", "contacts:create", "contacts:edit", "contacts:delete",
                "templates:view", "templates:create", "templates:edit", "templates:delete",
                "scheduler:view", "scheduler:create", "scheduler:edit", "scheduler:delete",
                "broadcast:view", "broadcast:send",
                "analytics:view",
            ],
        },
        {
            name: "Editor",
            permissions: [
                "telegram:view", "telegram:edit", "telegram:delete",
                "contacts:view", "contacts:create", "contacts:edit",
                "templates:view", "templates:create", "templates:edit",
                "scheduler:view",
                "analytics:view",
            ],
        },
        {
            name: "Viewer",
            permissions: [
                "contacts:view",
                "templates:view",
                "scheduler:view",
                "broadcast:view",
                "analytics:view",
            ],
        },
    ];

    // 3. Insert / Upsert System Roles & Relasi RolePermissions
    for (const r of ROLES_DEFINITIONS) {
        // Cari role system (tenantId = null)
        let role = await prisma.role.findFirst({
            where: { name: r.name, tenantId: null },
        });

        if (!role) {
            role = await prisma.role.create({
                data: {
                    name: r.name,
                    tenantId: null,
                    isCustom: false,
                },
            });
        }

        // Hubungkan permission ke role
        const permIds = getPermIds(r.permissions);
        for (const pid of permIds) {
            await prisma.rolePermission.upsert({
                where: {
                    roleId_permissionId: { roleId: role.id, permissionId: pid },
                },
                update: {},
                create: { roleId: role.id, permissionId: pid },
            });
        }

        console.log(`✅ Role "${r.name}" siap dengan ${permIds.length} permissions.`);
    }

    console.log("🎉 Seeding RBAC selesai dengan sukses!");
}

main()
    .catch((e) => {
        console.error("❌ Seeding gagal:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
