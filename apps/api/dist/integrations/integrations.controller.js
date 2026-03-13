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
exports.IntegrationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const integrations_service_1 = require("./integrations.service");
let IntegrationsController = class IntegrationsController {
    integrationsService;
    constructor(integrationsService) {
        this.integrationsService = integrationsService;
    }
    async getAccounts(userId) {
        return this.integrationsService.getConnectedAccounts(userId);
    }
    async getMailboxes(workspaceId) {
        return this.integrationsService.getMailboxConnections(workspaceId);
    }
};
exports.IntegrationsController = IntegrationsController;
__decorate([
    (0, common_1.Get)("accounts"),
    __param(0, (0, common_1.Query)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "getAccounts", null);
__decorate([
    (0, common_1.Get)("mailboxes"),
    __param(0, (0, common_1.Query)("workspaceId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "getMailboxes", null);
exports.IntegrationsController = IntegrationsController = __decorate([
    (0, swagger_1.ApiTags)("integrations"),
    (0, common_1.Controller)("integrations"),
    __metadata("design:paramtypes", [integrations_service_1.IntegrationsService])
], IntegrationsController);
//# sourceMappingURL=integrations.controller.js.map