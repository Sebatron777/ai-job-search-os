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
exports.JobSourcesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const job_sources_service_1 = require("./job-sources.service");
let JobSourcesController = class JobSourcesController {
    sourcesService;
    constructor(sourcesService) {
        this.sourcesService = sourcesService;
    }
    async list(workspaceId) {
        return this.sourcesService.findByWorkspace(workspaceId);
    }
    async get(id) {
        return this.sourcesService.findById(id);
    }
    async create(dto) {
        return this.sourcesService.create(dto);
    }
    async update(id, dto) {
        return this.sourcesService.update(id, dto);
    }
    async delete(id) {
        return this.sourcesService.delete(id);
    }
    async ingest(id, limit, dryRun) {
        const jobId = await this.sourcesService.triggerIngestion(id, {
            limit,
            dryRun: dryRun === "true",
        });
        return {
            success: true,
            jobId,
            message: "Ingestion job queued",
        };
    }
    async getStatus(id) {
        return this.sourcesService.getCollectionStatus(id);
    }
};
exports.JobSourcesController = JobSourcesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "List job sources for workspace" }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __param(0, (0, common_1.Query)("workspaceId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JobSourcesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Get job source by ID" }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JobSourcesController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: "Create a new job source" }),
    (0, swagger_1.ApiResponse)({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], JobSourcesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Update job source" }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], JobSourcesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Delete job source" }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JobSourcesController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(":id/ingest"),
    (0, swagger_1.ApiOperation)({ summary: "Trigger job ingestion from source" }),
    (0, swagger_1.ApiResponse)({ status: 201 }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("limit")),
    __param(2, (0, common_1.Query)("dryRun")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String]),
    __metadata("design:returntype", Promise)
], JobSourcesController.prototype, "ingest", null);
__decorate([
    (0, common_1.Get)(":id/status"),
    (0, swagger_1.ApiOperation)({ summary: "Get collection status for source" }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JobSourcesController.prototype, "getStatus", null);
exports.JobSourcesController = JobSourcesController = __decorate([
    (0, swagger_1.ApiTags)("sources"),
    (0, common_1.Controller)("sources"),
    __metadata("design:paramtypes", [job_sources_service_1.JobSourcesService])
], JobSourcesController);
//# sourceMappingURL=job-sources.controller.js.map