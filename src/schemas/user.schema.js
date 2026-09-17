import { z } from "zod";
export const inviteUserSchema = z.object({
    name: z.string().min(1, "Nama wajib diisi"),
    email: z.string().email("Format email tidak valid"),
    roleId: z.number().int().positive("Role ID harus berupa angka positif"),
});
export const updateUserRoleSchema = z.object({
    roleId: z.number().int().positive("Role ID harus berupa angka positif"),
});
export const userQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    search: z.string().optional(),
});
