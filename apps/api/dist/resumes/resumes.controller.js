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
exports.ResumesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const resumes_service_1 = require("./resumes.service");
let ResumesController = class ResumesController {
    resumesService;
    constructor(resumesService) {
        this.resumesService = resumesService;
    }
    async list(profileId) {
        return this.resumesService.findByProfile(profileId);
    }
};
exports.ResumesController = ResumesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)("profileId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ResumesController.prototype, "list", null);
exports.ResumesController = ResumesController = __decorate([
    (0, swagger_1.ApiTags)("resumes"),
    (0, common_1.Controller)("resumes"),
    __metadata("design:paramtypes", [resumes_service_1.ResumesService])
], ResumesController);
//# sourceMappingURL=resumes.controller.js.map