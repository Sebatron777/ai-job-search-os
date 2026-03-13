"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspacesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let WorkspacesService = class WorkspacesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        const workspace = await this.prisma.workspace.findUnique({
            where: { id },
            include: {
                memberships: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                name: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
            },
        });
        if (!workspace) {
            throw new common_1.NotFoundException("Workspace not found");
        }
        return workspace;
    }
    async findBySlug(slug) {
        const workspace = await this.prisma.workspace.findUnique({
            where: { slug },
            include: {
                memberships: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                name: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
            },
        });
        if (!workspace) {
            throw new common_1.NotFoundException("Workspace not found");
        }
        return workspace;
    }
    async create(ownerId, dto) {
        const existing = await this.prisma.workspace.findUnique({
            where: { slug: dto.slug },
        });
        if (existing) {
            throw new common_1.ForbiddenException("Workspace slug already taken");
        }
        const workspace = await this.prisma.workspace.create({
            data: {
                name: dto.name,
                slug: dto.slug,
                ownerId,
                settings: {
                    defaultApprovalMode: "manual",
                    autoSyncEnabled: false,
                    timezone: "UTC",
                    currency: "USD",
                },
            },
        });
        await this.prisma.membership.create({
            data: {
                userId: ownerId,
                workspaceId: workspace.id,
                role: "OWNER",
                acceptedAt: new Date(),
            },
        });
        return workspace;
    }
    async update(id, dto) {
        const workspace = await this.prisma.workspace.update({
            where: { id },
            data: {
                name: dto.name,
                settings: dto.settings,
            },
        });
        return workspace;
    }
    async getMemberships(userId) {
        const memberships = await this.prisma.membership.findMany({
            where: { userId },
            include: {
                workspace: true,
            },
        });
        return memberships;
    }
};
exports.WorkspacesService = WorkspacesService;
exports.WorkspacesService = WorkspacesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkspacesService);
//# sourceMappingURL=workspaces.service.js.map