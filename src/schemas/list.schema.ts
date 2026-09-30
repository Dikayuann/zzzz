import { z } from "zod";

export const createListSchema = z.object({
    name: z.string().trim().min(2, "Nama list minimal 2 karakter").max(255),
    description: z.string().trim().max(255).optional(),
});

export const updateListSchema = z.object({
    name: z.string().trim().min(2).max(255).optional(),
    description: z.string().trim().max(255).optional(),
});

export const addContactsToListSchema = z.object({
    contactIds: z.array(z.number().int().positive("ID kontak tidak valid")).min(1, "Minimal pilih 1 kontak"),
});

export type CreateListInput = z.infer<typeof createListSchema>;
export type UpdateListInput = z.infer<typeof updateListSchema>;
export type AddContactsToListInput = z.infer<typeof addContactsToListSchema>;

