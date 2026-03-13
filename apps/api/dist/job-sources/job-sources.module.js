"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobSourcesModule = void 0;
const common_1 = require("@nestjs/common");
const job_sources_controller_1 = require("./job-sources.controller");
const job_sources_service_1 = require("./job-sources.service");
const ingestion_queue_service_1 = require("../queue/ingestion-queue.service");
const queue_module_1 = require("../queue/queue.module");
let JobSourcesModule = class JobSourcesModule {
};
exports.JobSourcesModule = JobSourcesModule;
exports.JobSourcesModule = JobSourcesModule = __decorate([
    (0, common_1.Module)({
        imports: [queue_module_1.QueueModule],
        controllers: [job_sources_controller_1.JobSourcesController],
        providers: [job_sources_service_1.JobSourcesService, ingestion_queue_service_1.IngestionQueueService],
        exports: [job_sources_service_1.JobSourcesService, ingestion_queue_service_1.IngestionQueueService],
    })
], JobSourcesModule);
//# sourceMappingURL=job-sources.module.js.map