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
exports.ProfilesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const profiles_service_1 = require("./profiles.service");
let ProfilesController = class ProfilesController {
    profilesService;
    constructor(profilesService) {
        this.profilesService = profilesService;
    }
    async getMyProfile(req, workspaceId) {
        return this.profilesService.findByUserAndWorkspace(req.user?.id || "user-id", workspaceId);
    }
    async createProfile(req, workspaceId, dto) {
        return this.profilesService.create(req.user?.id || "user-id", workspaceId, dto);
    }
    async updateProfile(id, dto) {
        return this.profilesService.update(id, dto);
    }
    async getProfile(id) {
        return this.profilesService.findById(id);
    }
    async upsertPreferences(id, dto) {
        return this.profilesService.upsertJobPreference(id, dto);
    }
};
exports.ProfilesController = ProfilesController;
__decorate([
    (0, common_1.Get)("me"),
    (0, swagger_1.ApiOperation)({ summary: "Get current user's candidate profile" }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)("workspaceId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProfilesController.prototype, "getMyProfile", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: "Create candidate profile" }),
    (0, swagger_1.ApiResponse)({ status: 201 }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)("workspaceId")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ProfilesController.prototype, "createProfile", null);
__decorate([
    (0, common_1.Put)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Update candidate profile" }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProfilesController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Get profile by ID" }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProfilesController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Post)(":id/preferences"),
    (0, swagger_1.ApiOperation)({ summary: "Create/update job preferences" }),
    (0, swagger_1.ApiResponse)({ status: 201 }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProfilesController.prototype, "upsertPreferences", null);
exports.ProfilesController = ProfilesController = __decorate([
    (0, swagger_1.ApiTags)("profiles"),
    (0, common_1.Controller)("profiles"),
    __metadata("design:paramtypes", [profiles_service_1.ProfilesService])
], ProfilesController);
//# sourceMappingURL=profiles.controller.js.map