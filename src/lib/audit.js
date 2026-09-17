import prisma from "./prisma";
export const logAudit = async (params) => {
    try {
        await prisma.auditLog.create({
            data: {
                tenantId: params.tenantId,
                actorId: params.actorId,
                action: params.action,
                entityType: params.entityType,
                entityId: params.entityId,
                details: params.details ? params.details : undefined,
            },
        });
    }
    catch (error) {
        console.error("[AuditLog Error]:", error);
    }
};
