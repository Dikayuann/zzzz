import prisma from "../lib/prisma";
import { logAudit } from "../lib/audit";
import {
    CreateTemplateInput,
    UpdateTemplateInput,
    CreateTemplateVersionInput
} from "../schemas/template.schema";

export const getTemplates = async (tenantId: number) => {
   const templates  = await  prisma.template.findMany({
    where: {
        tenantId,
        deletedAt: null,
    },
       include: {
        versions: {
            orderBy: { versionNo: "desc" },
            take: 1,
        },
       },
    orderBy: { createdAt: "desc" },
   });

   return templates;
}

export const getTemplateById = async (tenantId: number, templateId: number) => {
    const template = await prisma.template.findFirst({
        where: { id: templateId, tenantId, deletedAt: null },
        include: { versions: { orderBy: { versionNo: "desc" } } }
    })
    if (!template) {
        throw new Error("TEMPLATE_NOT_FOUND");
    }
    return template;
}

export const createTemplate = async (tenantId: number, actorId: number, data: CreateTemplateInput) => {
    const existing = await prisma.template.findFirst({
        where: { tenantId, name: data.name, deletedAt: null },
    });
    if (existing) {
        throw new Error("TEMPLATE_NAME_DUPLICATE");
    }

    const template = await prisma.template.create({
        data: {
            tenantId,
            name: data.name,
            channelMode: data.channelMode,
            category: data.category,
            versions: {
                create: {
                    versionNo: 1,
                    subject: data.subject,
                    preheader: data.preheader,
                    contentJson: data.contentJson,
                    contentHtml: data.contentHtml,
                    contentWhatsapp: data.contentWhatsapp,
                    contentTelegram: data.contentTelegram,
                    createdById: actorId,
                },
            },
        },
        include: { versions: true }
    });
    await logAudit({
        tenantId,
        actorId,
        action: "CREATE_TEMPLATE",
        entityType: "TEMPLATE",
        entityId: template.id,
        details: { name: template.name, channelMode: template.channelMode }
    })
    return template;
}

export const updateTemplate = async ( tenantId: number, actorId: number, templateId: number, data: UpdateTemplateInput) => {
    // cek apakah tenplate ada
    await getTemplateById(tenantId, templateId)

    // jika nama diubah apakah nama baru sama dengan template lain
    if (data.name) {
        const existing = await prisma.template.findFirst({
            where: {
                tenantId,
                name: data.name,
                id: { not: templateId },
                deletedAt: null,
            },
        });
        if (existing) {
            throw new Error("TEMPLATE_NAME_DUPLICATE");
        }
    }

    const updated = await prisma.template.update({
        where: { id: templateId },
        data: {
            name: data.name,
            channelMode: data.channelMode,
            category: data.category,
        },
    });

    // audit log
    await logAudit({
        tenantId,
        actorId,
        action: "UPDATE_TEMPLATE",
        entityType: "TEMPLATE",
        entityId: updated.id,
        details: data,
    });
    return updated;
};

export const createTemplateVersion = async ( tenantId: number, actorId: number, templateId: number, data: CreateTemplateVersionInput)=> {
    // cek template milik tenant
    await getTemplateById(tenantId, templateId);

    // cek versi terakhir menentukan version
    const lastVersion = await prisma.templateVersion.findFirst({
        where: {templateId},
        orderBy: { versionNo: "desc" },
    });

    const nextVersionNo = (lastVersion?.versionNo ?? 0) + 1;

    // membuat versi baru
    const newVersion = await prisma.templateVersion.create({
        data: {
            templateId,
            versionNo: nextVersionNo,
            subject: data.subject,
            preheader: data.preheader,
            contentJson: data.contentJson,
            contentHtml: data.contentHtml,
            contentWhatsapp: data.contentWhatsapp,
            contentTelegram: data.contentTelegram,
            createdById: actorId,

        },
    });

    // audit log
    await logAudit({
        tenantId,
        actorId,
        action: "CREATE_TEMPLATE_VERSION",
        entityType: "TEMPLATE_VERSION",
        entityId: newVersion.id,
        details: data,
    });
    return newVersion;
}

export const deleteTemplate = async (tenantId: number, actorId: number, template: number) => {
    await getTemplateById(tenantId, template);

    const deleted = await prisma.template.update({
        where: { id: template },
        data: { deletedAt: new Date() },
    });

    await logAudit({
        tenantId,
        actorId,
        action: "DELETE_TEMPLATE",
        entityType: "TEMPLATE",
        entityId: template,
        details: { name: deleted.name },
    });

    return { message: "Template berhasil dihapus" };
}
