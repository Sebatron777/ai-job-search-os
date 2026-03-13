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
var IngestionProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngestionProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const bullmq_1 = require("bullmq");
const common_1 = require("@nestjs/common");
let IngestionProcessor = IngestionProcessor_1 = class IngestionProcessor {
    logger = new common_1.Logger(IngestionProcessor_1.name);
    async processIngestion(job) {
        this.logger.log(`Starting ingestion for source: ${job.data.sourceId}`);
        try {
            const { sourceId, workspaceId, options } = job.data;
            this.logger.log(`Processing source ${sourceId} in workspace ${workspaceId}`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.logger.log(`Completed ingestion for source: ${sourceId}`);
            return {
                success: true,
                sourceId,
                collectedCount: 0,
                normalizedCount: 0,
                duplicateCount: 0,
                newJobsCount: 0,
            };
        }
        catch (error) {
            this.logger.error(`Ingestion failed for source ${job.data.sourceId}: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.IngestionProcessor = IngestionProcessor;
__decorate([
    (0, bull_1.Process)("ingest-source"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bullmq_1.Job]),
    __metadata("design:returntype", Promise)
], IngestionProcessor.prototype, "processIngestion", null);
exports.IngestionProcessor = IngestionProcessor = IngestionProcessor_1 = __decorate([
    (0, bull_1.Processor)("ingestion")
], IngestionProcessor);
//# sourceMappingURL=ingestion.processor.js.map