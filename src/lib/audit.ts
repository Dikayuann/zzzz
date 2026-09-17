import prisma from "./prisma";

export interface AuditLogParams {
    tenantId?: number;
    actorId?: number;
    action: string;
    entityType: string;
    entityId?: number;
    details?: any;
}

export const logAudit = async (params: AuditLogParams) => {
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
    } catch (error) {
        console.error("[AuditLog Error]:", error);
    }
};
