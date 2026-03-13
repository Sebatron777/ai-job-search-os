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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../database/prisma.service");
const bcrypt_1 = require("bcrypt");
let AuthService = class AuthService {
    prisma;
    jwt;
    config;
    constructor(prisma, jwt, config) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
    }
    async register(dto) {
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });
        if (existing) {
            throw new common_1.ConflictException("User with this email already exists");
        }
        const passwordHash = await (0, bcrypt_1.hash)(dto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email.toLowerCase(),
                name: dto.name,
                passwordHash,
            },
        });
        const workspace = await this.prisma.workspace.create({
            data: {
                name: `${dto.name || dto.email.split("@")[0]}'s Workspace`,
                slug: `ws-${user.id.slice(0, 8)}`,
                ownerId: user.id,
                settings: {
                    defaultApprovalMode: "manual",
                    autoSyncEnabled: false,
                    timezone: "UTC",
                    currency: "USD",
                },
            },
        });
        await this.prisma.membership.create({
            data: {
                userId: user.id,
                workspaceId: workspace.id,
                role: "OWNER",
                acceptedAt: new Date(),
            },
        });
        return this.generateTokens(user.id);
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });
        if (!user) {
            throw new common_1.UnauthorizedException("Invalid email or password");
        }
        if (!user.passwordHash) {
            throw new common_1.UnauthorizedException("Please sign in with your provider");
        }
        const valid = await (0, bcrypt_1.compare)(dto.password, user.passwordHash);
        if (!valid) {
            throw new common_1.UnauthorizedException("Invalid email or password");
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        return this.generateTokens(user.id);
    }
    async refreshTokens(userId, refreshToken) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.UnauthorizedException("User not found");
        }
        if (!user.refreshTokenHash) {
            throw new common_1.UnauthorizedException("No refresh token");
        }
        const valid = await (0, bcrypt_1.compare)(refreshToken, user.refreshTokenHash);
        if (!valid) {
            throw new common_1.UnauthorizedException("Invalid refresh token");
        }
        return this.generateTokens(user.id);
    }
    async generateTokens(userId) {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwt.signAsync({ sub: userId }),
            this.jwt.signAsync({ sub: userId, type: "refresh" }, { expiresIn: this.config.get("REFRESH_TOKEN_EXPIRES_IN", "30d") }),
        ]);
        const refreshTokenHash = await (0, bcrypt_1.hash)(refreshToken, 10);
        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshTokenHash },
        });
        return { accessToken, refreshToken };
    }
    async validateToken(token) {
        try {
            const payload = await this.jwt.verifyAsync(token);
            return { userId: payload.sub };
        }
        catch {
            throw new common_1.UnauthorizedException("Invalid token");
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map