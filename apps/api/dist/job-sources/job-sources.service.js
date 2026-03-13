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
exports.JobSourcesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const ingestion_queue_service_1 = require("../queue/ingestion-queue.service");
let JobSourcesService = class JobSourcesService {
    prisma;
    ingestionQueue;
    constructor(prisma, ingestionQueue) {
        this.prisma = prisma;
        this.ingestionQueue = ingestionQueue;
    }
    async findByWorkspace(workspaceId) {
        return this.prisma.jobSource.findMany({
            where: { workspaceId },
            orderBy: { createdAt: "desc" },
        });
    }
    async findById(id) {
        const source = await this.prisma.jobSource.findUnique({
            where: { id },
        });
        if (!source) {
            throw new common_1.NotFoundException("Job source not found");
        }
        return source;
    }
    async create(dto) {
        return this.prisma.jobSource.create({
            data: {
                workspaceId: dto.workspaceId,
                name: dto.name,
                type: dto.type,
                config: dto.config,
                status: "active",
            },
        });
    }
    async update(id, dto) {
        const source = await this.findById(id);
        return this.prisma.jobSource.update({
            where: { id },
            data: {
                name: dto.name,
                config: dto.config,
                status: dto.status,
            },
        });
    }
    async delete(id) {
        await this.prisma.jobSource.delete({
            where: { id },
        });
        return { success: true };
    }
    async triggerIngestion(sourceId, options) {
        const source = await this.findById(sourceId);
        const jobId = await this.ingestionQueue.addIngestionJob(sourceId, source.workspaceId, options);
        await this.prisma.jobSource.update({
            where: { id: sourceId },
            data: {
                lastCollectionAt: new Date(),
                lastCollectionStatus: "pending",
            },
        });
        return jobId;
    }
    async getCollectionStatus(sourceId) {
        const source = await this.findById(sourceId);
        return {
            lastCollectionAt: source.lastCollectionAt,
            lastCollectionStatus: source.lastCollectionStatus,
            lastCollectionError: null,
            totalJobsCollected: source.totalJobsCollected,
            activeJobsCount: source.activeJobsCount,
        };
    }
};
exports.JobSourcesService = JobSourcesService;
exports.JobSourcesService = JobSourcesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ingestion_queue_service_1.IngestionQueueService])
], JobSourcesService);
//# sourceMappingURL=job-sources.service.js.map