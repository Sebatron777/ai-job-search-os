import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";

export interface AuditLogData {
  organizationId?: string;
  workspaceId?: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: any;
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(data: AuditLogData) {
    try {
      return await this.prisma.auditLog.create({
        data: {
          organizationId: data.organizationId,
          workspaceId: data.workspaceId,
          userId: data.userId,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          changes: data.changes,
        },
      });
    } catch (error) {
      console.error("Failed to create audit log:", error);
      // We don't want to throw error and break the main flow if logging fails
    }
  }

  async findByOrganization(organizationId: string) {
    return this.prisma.auditLog.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  }
}
