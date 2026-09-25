import { z } from "zod";

export const createRoleSchema = z.object({
    name: z.string().min(2, "Nama role minimal 2 karakter").max(50, "Nama role maksimal 50 karakter"),
    permissionIds: z.array(z.number().int().positive("ID permission tidak valid")).min(1, "Minimal pilih 1 permission untuk role ini"),
})

export type CreateRoleInput = z.infer<typeof createRoleSchema>