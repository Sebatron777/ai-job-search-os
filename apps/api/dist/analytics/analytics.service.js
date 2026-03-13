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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let AnalyticsService = class AnalyticsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getFunnelMetrics(workspaceId) {
        const applications = await this.prisma.application.findMany({
            where: { workspaceId },
            select: { status: true },
        });
        const byStatus = applications.reduce((acc, app) => {
            acc[app.status] = (acc[app.status] || 0) + 1;
            return acc;
        }, {});
        const total = applications.length;
        const applied = byStatus["applied"] || 0;
        const replyReceived = byStatus["reply_received"] || 0;
        const interview = byStatus["interview"] || 0;
        const offer = byStatus["offer"] || 0;
        return {
            totalApplications: total,
            byStatus,
            appliedCount: applied,
            replyCount: replyReceived,
            interviewCount: interview,
            offerCount: offer,
            replyRate: total > 0 ? replyReceived / total : 0,
            interviewRate: total > 0 ? interview / total : 0,
            offerRate: total > 0 ? offer / total : 0,
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map