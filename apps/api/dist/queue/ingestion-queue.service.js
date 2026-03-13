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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngestionQueueService = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const bullmq_1 = require("bullmq");
const prisma_service_1 = require("../database/prisma.service");
let IngestionQueueService = class IngestionQueueService {
    ingestionQueue;
    prisma;
    constructor(ingestionQueue, prisma) {
        this.ingestionQueue = ingestionQueue;
        this.prisma = prisma;
    }
    async addIngestionJob(sourceId, workspaceId, options) {
        const job = await this.ingestionQueue.add("ingest-source", {
            sourceId,
            workspaceId,
            options,
        }, {
            priority: 5,
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 2000,
            },
        });
        await this.prisma.scheduledTask.create({
            data: {
                name: `Ingest source: ${sourceId}`,
                type: "INGESTION",
                status: "pending",
                scheduledAt: new Date(),
                payload: { sourceId, workspaceId, options },
            },
        });
        return job.id || "";
    }
    async cancelJob(jobId) {
        const job = await this.ingestionQueue.getJob(jobId);
        if (job) {
            await job.remove();
        }
    }
    async getJobStatus(jobId) {
        const job = await this.ingestionQueue.getJob(jobId);
        if (!job)
            return null;
        return {
            status: await job.getState(),
            failedReason: job.failedReason,
            data: job.data,
        };
    }
};
exports.IngestionQueueService = IngestionQueueService;
exports.IngestionQueueService = IngestionQueueService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bull_1.InjectQueue)("ingestion")),
    __metadata("design:paramtypes", [bullmq_1.Queue,
        prisma_service_1.PrismaService])
], IngestionQueueService);
//# sourceMappingURL=ingestion-queue.service.js.map