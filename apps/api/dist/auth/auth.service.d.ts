import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../database/prisma.service";
export interface RegisterDto {
    email: string;
    password: string;
    name?: string;
}
export interface LoginDto {
    email: string;
    password: string;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
export declare class AuthService {
    private prisma;
    private jwt;
    private config;
    constructor(prisma: PrismaService, jwt: JwtService, config: ConfigService);
    register(dto: RegisterDto): Promise<AuthTokens>;
    login(dto: LoginDto): Promise<AuthTokens>;
    refreshTokens(userId: string, refreshToken: string): Promise<AuthTokens>;
    private generateTokens;
    validateToken(token: string): Promise<{
        userId: string;
    }>;
}
