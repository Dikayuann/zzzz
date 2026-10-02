import { z } from "zod";

//  Schema untuk membuat kontak baru (Create)
export const createContactSchema = z.object({
    name:  z
        .string({ message: "Nama kontak wajib diisi" })
        .trim()
        .min(2, "Nama kontak minimal 2 karakter")
        .max(255, "Nama kontak maksimal 255 karakter"),
    email: z
        .string()
        .trim()
        .email("Format email tidak valid")
        .optional()
        .or(z.literal("")),
    phone: z.string().trim().optional(),
    whatsappNumber: z.string().trim().optional(),
    teleChatId: z.string().trim().optional(),
    status: z.enum(["active", "unsubscribed", "bounced"]).default("active"),
    customFields: z.record(z.string(), z.any()).optional(),
    listId: z.number().int().positive("ID list tidak valid").optional(),
    tagIds: z.array(z.number().int().positive("ID Tag tidak valid")).optional(),
})
.refine((data) => (data.email && data.email.length > 0) ||
    (data.whatsappNumber && data.whatsappNumber.length > 0), {
    message: "Minimal salah satu dari Email atau Whatsapp Number wajib diisi",
    path: ["email"],
});


// Schema untuk update kontak (seluruh field opsional)
export const updateContactSchema = z.object({
    name: z.string().trim().min(2).max(255).optional(),
    email: z.string().trim().email().optional().or(z.literal("")),
    phone: z.string().trim().optional(),
    whatsappNumber: z.string().trim().optional(),
    teleChatId: z.string().trim().optional(),
    status: z.enum(["active", "unsubscribed", "bounced"]).optional(),
    customFields: z.record(z.string(), z.any()).optional(),
    listId: z.number().int().positive().optional(),
    tagIds: z.array(z.number().int().positive()).optional(),
});

// Schema untuk query parameter (Paginasi, Search, Filter)
export const contactQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().optional(),
  listId: z.coerce.number().int().positive().optional(),
  tagId: z.coerce.number().int().positive().optional(),
  status: z.string().trim().optional(),
})

export const bulkDeleteContactSchema = z.object({
  contactIds: z.array(z.number().int().positive("ID kontak tidak valid")).min(1, "Minimal pilih 1 kontak untuk dihapus"),
});

export const importContactItemSchema = z.object({
    name: z.string().trim().min(1 ,"Nama kontak wajib diisi").max(255, "Nama kontak maksimal 255 karakter"),
    email: z.string().trim().email("Format email tidak valid").optional().or(z.literal("")),
    phone: z.string().trim().optional(),
    whatsappNumber: z.string().trim().optional(),
    teleChatId: z.string().trim().optional(),
    customFields: z.record(z.string(), z.any()).optional(),

});

// schema untuk playload request import
export const importContactsSchema  = z.object({
    contacts: z
        .array(importContactItemSchema)
        .min(1, "Minimal 1 kontak harus diimpor")
        .max(1000, "Maksimal 1000 kontak dapat diimpor"),
        listId: z.number().int().positive("ID list tidak valid").optional(),
        tagsIds: z.array(z.number().int().positive("ID tag tidak valid")).optional(),
        duplicateStrategy: z.enum(["skip", "update", "skip"]).default("skip"),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
export type ContactQueryInput = z.infer<typeof contactQuerySchema>;
export type BulkDeleteContactInput = z.infer<typeof bulkDeleteContactSchema>;
export type ImportContactsItemInput = z.infer<typeof importContactItemSchema>;
export type ImportContactsInput = z.infer<typeof importContactsSchema>;