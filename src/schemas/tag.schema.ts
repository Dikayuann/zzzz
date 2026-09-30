import { z } from "zod";

export const createTagSchema = z.object({
    name: z.string().trim().min(1, "Nama tag tidak boleh kosong").max(100),
});

export type CreateTagInput = z.infer<typeof createTagSchema>;
