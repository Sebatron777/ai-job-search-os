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
exports.WorkspacesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const workspaces_service_1 = require("./workspaces.service");
let WorkspacesController = class WorkspacesController {
    workspacesService;
    constructor(workspacesService) {
        this.workspacesService = workspacesService;
    }
    async listWorkspaces(req) {
        return this.workspacesService.getMemberships(req.user?.id || "user-id");
    }
    async getWorkspace(slug) {
        return this.workspacesService.findBySlug(slug);
    }
    async createWorkspace(req, dto) {
        return this.workspacesService.create(req.user?.id || "user-id", dto);
    }
    async updateWorkspace(id, dto) {
        return this.workspacesService.update(id, dto);
    }
};
exports.WorkspacesController = WorkspacesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "List user's workspaces" }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkspacesController.prototype, "listWorkspaces", null);
__decorate([
    (0, common_1.Get)(":slug"),
    (0, swagger_1.ApiOperation)({ summary: "Get workspace by slug" }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __param(0, (0, common_1.Param)("slug")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkspacesController.prototype, "getWorkspace", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: "Create a new workspace" }),
    (0, swagger_1.ApiResponse)({ status: 201 }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WorkspacesController.prototype, "createWorkspace", null);
__decorate([
    (0, common_1.Put)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Update workspace" }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WorkspacesController.prototype, "updateWorkspace", null);
exports.WorkspacesController = WorkspacesController = __decorate([
    (0, swagger_1.ApiTags)("workspaces"),
    (0, common_1.Controller)("workspaces"),
    __metadata("design:paramtypes", [workspaces_service_1.WorkspacesService])
], WorkspacesController);
//# sourceMappingURL=workspaces.controller.js.map