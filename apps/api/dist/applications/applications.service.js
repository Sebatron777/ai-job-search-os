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
exports.ApplicationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let ApplicationsService = class ApplicationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(workspaceId, filters) {
        return this.prisma.application.findMany({
            where: { workspaceId },
            include: {
                job: {
                    select: {
                        id: true,
                        title: true,
                        company: true,
                    },
                },
                matchScore: {
                    select: {
                        totalScore: true,
                        recommendation: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
    }
    async findById(id) {
        const application = await this.prisma.application.findUnique({
            where: { id },
            include: {
                job: true,
                matchScore: true,
            },
        });
        if (!application) {
            throw new common_1.NotFoundException("Application not found");
        }
        return application;
    }
    async create(dto) {
        const application = await this.prisma.application.create({
            data: {
                workspaceId: dto.workspaceId,
                candidateProfileId: dto.candidateProfileId,
                jobId: dto.jobId,
                status: "draft",
            },
        });
        return application;
    }
    async updateStatus(id, status, reason) {
        const application = await this.findById(id);
        const statusHistory = application.statusHistory || [];
        statusHistory.push({
            fromStatus: application.status,
            toStatus: status,
            reason,
            changedBy: "system",
            changedAt: new Date(),
        });
        return this.prisma.application.update({
            where: { id },
            data: {
                status: status,
                statusHistory,
                lastActivityAt: new Date(),
            },
        });
    }
    async approve(id, userId) {
        return this.updateStatus(id, "ready_to_apply", "Approved by user");
    }
    async reject(id, reason) {
        return this.updateStatus(id, "draft", `Rejected: ${reason}`);
    }
};
exports.ApplicationsService = ApplicationsService;
exports.ApplicationsService = ApplicationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ApplicationsService);
//# sourceMappingURL=applications.service.js.map