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
exports.MatchingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const matching_service_1 = require("./matching.service");
class ScoreJobDto {
    candidateProfileId;
}
let MatchingController = class MatchingController {
    matchingService;
    constructor(matchingService) {
        this.matchingService = matchingService;
    }
    async scoreJob(jobId, dto) {
        return this.matchingService.scoreJob(jobId, dto.candidateProfileId);
    }
    async getCandidateScores(candidateProfileId, workspaceId, limit) {
        return this.matchingService.getCandidateScores(candidateProfileId, workspaceId, limit ? parseInt(limit) : undefined);
    }
    async getBestMatches(candidateProfileId, workspaceId, minScore) {
        return this.matchingService.getBestMatches(candidateProfileId, workspaceId, minScore ? parseInt(minScore) : undefined);
    }
    async batchScore(candidateProfileId, dto, workspaceId) {
        return this.matchingService.batchScoreForCandidate(dto.candidateProfileId || candidateProfileId, workspaceId);
    }
    async updateRecommendation(matchScoreId, dto) {
        return this.matchingService.updateRecommendation(matchScoreId, dto.recommendation, dto.applyMode);
    }
};
exports.MatchingController = MatchingController;
__decorate([
    (0, common_1.Post)("jobs/:jobId/score"),
    (0, swagger_1.ApiOperation)({ summary: "Score a job against candidate profile" }),
    (0, swagger_1.ApiResponse)({ status: 201 }),
    __param(0, (0, common_1.Param)("jobId")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ScoreJobDto]),
    __metadata("design:returntype", Promise)
], MatchingController.prototype, "scoreJob", null);
__decorate([
    (0, common_1.Get)("candidates/:candidateProfileId/scores"),
    (0, swagger_1.ApiOperation)({ summary: "Get all scores for a candidate" }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __param(0, (0, common_1.Param)("candidateProfileId")),
    __param(1, (0, common_1.Query)("workspaceId")),
    __param(2, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], MatchingController.prototype, "getCandidateScores", null);
__decorate([
    (0, common_1.Get)("candidates/:candidateProfileId/best-matches"),
    (0, swagger_1.ApiOperation)({ summary: "Get best matches for a candidate" }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __param(0, (0, common_1.Param)("candidateProfileId")),
    __param(1, (0, common_1.Query)("workspaceId")),
    __param(2, (0, common_1.Query)("minScore")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], MatchingController.prototype, "getBestMatches", null);
__decorate([
    (0, common_1.Post)("candidates/:candidateProfileId/batch-score"),
    (0, swagger_1.ApiOperation)({ summary: "Batch score all jobs for a candidate" }),
    (0, swagger_1.ApiResponse)({ status: 201 }),
    __param(0, (0, common_1.Param)("candidateProfileId")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)("workspaceId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], MatchingController.prototype, "batchScore", null);
__decorate([
    (0, common_1.Post)("scores/:matchScoreId/recommendation"),
    (0, swagger_1.ApiOperation)({ summary: "Update recommendation for a match score" }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __param(0, (0, common_1.Param)("matchScoreId")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MatchingController.prototype, "updateRecommendation", null);
exports.MatchingController = MatchingController = __decorate([
    (0, swagger_1.ApiTags)("matching"),
    (0, common_1.Controller)("matching"),
    __metadata("design:paramtypes", [matching_service_1.MatchingService])
], MatchingController);
//# sourceMappingURL=matching.controller.js.map